import { del, put } from "@vercel/blob";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, media } from "@/db/schema";
import { canAccessInvitation, requireAdminSession } from "@/lib/auth";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  isVercelBlobUrl,
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
} from "@/lib/media-utils";
import {
  checkUploadRateLimit,
  getClientIp,
  recordUploadSubmission,
} from "@/lib/rate-limit";

const MAX_MEDIA_FILES_PER_INVITATION = 30;

const mediaKindSchema = z.enum(["hero", "mempelai", "galeri", "kisah", "musik"]);

const deleteBodySchema = z.object({
  url: z.string().url("URL media tidak valid."),
});

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/ogg": "ogg",
};

function hasValidImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) {
    return false;
  }

  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mime === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (mime === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

function hasValidAudioSignature(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) {
    return false;
  }

  if (mime === "audio/mpeg" || mime === "audio/mp3") {
    const hasId3 =
      bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const hasFrameSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    return hasId3 || hasFrameSync;
  }

  if (mime === "audio/mp4" || mime === "audio/x-m4a") {
    return (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    );
  }

  if (mime === "audio/ogg") {
    return (
      bytes[0] === 0x4f &&
      bytes[1] === 0x67 &&
      bytes[2] === 0x67 &&
      bytes[3] === 0x53
    );
  }

  return false;
}

function sanitizeBaseName(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "media";
}

function isBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL_OIDC_TOKEN
  );
}

function getFriendlyBlobError(error: unknown): string {
  const raw = error instanceof Error ? error.message.toLowerCase() : "";
  if (raw.includes("private")) {
    return "Blob Store berstatus Private. Gunakan Blob Store dengan akses Public agar media dapat ditampilkan di undangan.";
  }
  if (
    raw.includes("token") ||
    raw.includes("access") ||
    raw.includes("oidc") ||
    raw.includes("unauthorized")
  ) {
    return "Autentikasi Vercel Blob gagal. Pastikan Blob Store Public terhubung ke proyek Vercel ini lalu Redeploy.";
  }
  return "Gagal mengunggah berkas ke penyimpanan. Silakan coba lagi.";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  const clientIp = getClientIp(request.headers);
  const uploadRateLimit = await checkUploadRateLimit(clientIp);
  if (!uploadRateLimit.allowed) {
    const minutes = Math.max(
      1,
      Math.ceil(uploadRateLimit.retryAfterSeconds / 60)
    );
    return NextResponse.json(
      {
        error: `Terlalu banyak unggahan dalam waktu singkat. Coba lagi dalam ${minutes} menit.`,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(uploadRateLimit.retryAfterSeconds),
        },
      }
    );
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Penyimpanan media belum dikonfigurasi. Hubungkan Vercel Blob Store (BLOB_STORE_ID / BLOB_READ_WRITE_TOKEN) di Vercel atau .env.local.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Format unggahan tidak valid (harus multipart/form-data)." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const kindParsed = mediaKindSchema.safeParse(formData.get("kind"));
  if (!kindParsed.success) {
    return NextResponse.json(
      { error: "Jenis media tidak valid." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const rawSlug = formData.get("slug");
  const targetSlug =
    auth.session.role === "couple"
      ? auth.session.slug
      : typeof rawSlug === "string" && rawSlug.trim()
        ? normalizeInvitationSlug(rawSlug)
        : "";

  if (targetSlug && !canAccessInvitation(auth.session, targetSlug)) {
    return NextResponse.json(
      { error: "Akses ditolak untuk undangan ini." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rawSortOrder = Number(formData.get("sortOrder") ?? 0);
  const sortOrder =
    Number.isInteger(rawSortOrder) && rawSortOrder >= 0 ? rawSortOrder : 0;

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File) || fileEntry.size <= 0) {
    return NextResponse.json(
      { error: "Berkas tidak ditemukan atau kosong." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const kind = kindParsed.data;
  const isAudio = kind === "musik";
  const mime = fileEntry.type.toLowerCase();

  if (isAudio) {
    if (
      !ALLOWED_AUDIO_MIME_TYPES.includes(
        mime as (typeof ALLOWED_AUDIO_MIME_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Format musik harus MP3, M4A, atau OGG." },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (fileEntry.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Ukuran berkas musik maksimal 4 MB." },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }
  } else {
    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Format foto harus JPG, PNG, atau WebP." },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (fileEntry.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran berkas foto maksimal 2 MB." },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }
  }

  const arrayBuffer = await fileEntry.arrayBuffer();
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 16));

  const validSignature = isAudio
    ? hasValidAudioSignature(headerBytes, mime)
    : hasValidImageSignature(headerBytes, mime);

  if (!validSignature) {
    return NextResponse.json(
      {
        error:
          "Isi berkas tidak sesuai dengan format yang diizinkan. Mohon pilih berkas yang valid.",
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const extension = MIME_TO_EXTENSION[mime] ?? (isAudio ? "mp3" : "webp");
  const baseName = sanitizeBaseName(fileEntry.name);
  const pathPrefix = targetSlug ? `framea/${targetSlug}/${kind}` : `framea/${kind}`;
  const pathname = `${pathPrefix}/${baseName}.${extension}`;
  const normalizedContentType = mime === "audio/mp3" ? "audio/mpeg" : mime;

  try {
    let resolvedInvitationId: number | null =
      auth.session.role === "couple" ? auth.session.invitationId : null;

    if (resolvedInvitationId === null && targetSlug && process.env.DATABASE_URL) {
      try {
        const db = getDb();
        const [inv] = await db
          .select({ id: invitations.id })
          .from(invitations)
          .where(eq(invitations.slug, targetSlug))
          .limit(1);
        resolvedInvitationId = inv?.id ?? null;
      } catch {
        resolvedInvitationId = null;
      }
    }

    if (
      auth.session.role === "couple" &&
      resolvedInvitationId !== null &&
      process.env.DATABASE_URL
    ) {
      const db = getDb();
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(media)
        .where(eq(media.invitationId, resolvedInvitationId));

      if ((countRow?.count ?? 0) >= MAX_MEDIA_FILES_PER_INVITATION) {
        return NextResponse.json(
          {
            error: `Batas maksimal ${MAX_MEDIA_FILES_PER_INVITATION} berkas media per undangan tercapai. Hapus berkas yang tidak terpakai terlebih dahulu.`,
          },
          {
            status: 400,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }
    }

    const blob = await put(pathname, Buffer.from(arrayBuffer), {
      access: "public",
      contentType: normalizedContentType,
      addRandomSuffix: true,
    });

    await recordUploadSubmission(clientIp);

    let insertedId: number | null = null;
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        const dbMediaKind = kind === "kisah" ? "galeri" : kind;
        const [inserted] = await db
          .insert(media)
          .values({
            invitationId: resolvedInvitationId,
            kind: dbMediaKind,
            url: blob.url,
            sortOrder,
          })
          .returning({ id: media.id });
        insertedId = inserted?.id ?? null;
      } catch (dbError: unknown) {
        const message =
          dbError instanceof Error ? dbError.message : "DB error";
        console.warn(`Gagal mencatat metadata media ke DB: ${message}`);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        id: insertedId,
        kind,
        url: blob.url,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengunggah ke Blob.";
    console.error(`Gagal unggah media ke Vercel Blob: ${message}`);
    return NextResponse.json(
      { error: getFriendlyBlobError(error) },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const parsed = deleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "URL tidak valid." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const { url } = parsed.data;
  if (!isVercelBlobUrl(url)) {
    return NextResponse.json(
      { error: "Hanya berkas milik Vercel Blob yang dapat dihapus." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  // Peran couple hanya boleh menghapus berkas media milik undangannya sendiri
  if (auth.session.role === "couple") {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Akses ditolak." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    const db = getDb();
    const [owned] = await db
      .select({ id: media.id })
      .from(media)
      .where(
        and(
          eq(media.url, url),
          eq(media.invitationId, auth.session.invitationId)
        )
      )
      .limit(1);

    if (!owned) {
      return NextResponse.json(
        { error: "Akses ditolak. Berkas bukan milik undangan Anda." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  try {
    if (isBlobConfigured()) {
      await del(url);
    }

    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        if (auth.session.role === "couple") {
          await db
            .delete(media)
            .where(
              and(
                eq(media.url, url),
                eq(media.invitationId, auth.session.invitationId)
              )
            );
        } else {
          await db.delete(media).where(eq(media.url, url));
        }
      } catch (dbError: unknown) {
        const message =
          dbError instanceof Error ? dbError.message : "DB error";
        console.warn(`Gagal menghapus catatan media di DB: ${message}`);
      }
    }

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus berkas.";
    console.error(`Gagal menghapus berkas di Vercel Blob: ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus berkas dari penyimpanan." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
