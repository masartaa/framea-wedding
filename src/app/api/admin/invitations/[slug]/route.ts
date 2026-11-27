import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireSuperAdminSession } from "@/lib/auth";
import {
  getInvitationCacheTag,
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import {
  deleteInvitationBySlug,
  INVITATIONS_LIST_CACHE_TAG,
  updateInvitationMeta,
} from "@/lib/invitations";
import { isManagedMediaUrl } from "@/lib/media-utils";
import { deleteMediaObjects, isMediaStorageConfigured } from "@/lib/storage";

const patchMetaSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Nama undangan wajib diisi.")
    .max(120, "Nama undangan maksimal 120 karakter.")
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(80, "Slug maksimal 80 karakter.")
    .optional(),
  password: z
    .union([
      z.null(),
      z
        .string()
        .trim()
        .min(6, "Sandi pasangan minimal 6 karakter.")
        .max(200, "Sandi terlalu panjang."),
    ])
    .optional(),
});

function isUniqueViolationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const err = error as { code?: unknown; cause?: { code?: unknown }; message?: unknown };
  if (err.code === "23505" || err.cause?.code === "23505") {
    return true;
  }
  return (
    typeof err.message === "string" &&
    err.message.toLowerCase().includes("duplicate key")
  );
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { slug } = await context.params;
  const currentSlug = normalizeInvitationSlug(slug);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = patchMetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let nextSlugNormalized: string | undefined;
  if (typeof parsed.data.slug === "string") {
    nextSlugNormalized = normalizeInvitationSlug(parsed.data.slug);
    if (!isValidInvitationSlug(nextSlugNormalized)) {
      return NextResponse.json(
        {
          error:
            "Slug baru tidak valid atau memakai kata sistem. Gunakan huruf kecil, angka, dan tanda hubung (-).",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  try {
    const updated = await updateInvitationMeta(currentSlug, {
      label: parsed.data.label,
      slug: nextSlugNormalized,
      password: parsed.data.password,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    revalidateTag(INVITATIONS_LIST_CACHE_TAG, { expire: 0 });
    revalidateTag(getInvitationCacheTag(currentSlug), { expire: 0 });
    revalidatePath(`/${currentSlug}`);
    if (updated.slug !== currentSlug) {
      revalidateTag(getInvitationCacheTag(updated.slug), { expire: 0 });
      revalidatePath(`/${updated.slug}`);
    }

    return NextResponse.json(
      {
        ok: true,
        invitation: {
          id: updated.id,
          slug: updated.slug,
          label: updated.label,
          hasPassword: updated.hasPassword,
          updatedAt: updated.updatedAt,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    if (isUniqueViolationError(error)) {
      return NextResponse.json(
        {
          error: `Slug "/${nextSlugNormalized ?? ""}" sudah digunakan undangan lain.`,
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    const message =
      error instanceof Error ? error.message : "Gagal memperbarui undangan.";
    console.error(`Gagal memperbarui meta undangan "${currentSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memperbarui pengaturan undangan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { slug } = await context.params;
  const normalizedSlug = normalizeInvitationSlug(slug);

  try {
    const deleted = await deleteInvitationBySlug(normalizedSlug);
    if (!deleted) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (isMediaStorageConfigured()) {
      const managedUrls = deleted.mediaUrls.filter((url) =>
        isManagedMediaUrl(url)
      );
      if (managedUrls.length > 0) {
        await deleteMediaObjects(managedUrls).catch((storageErr: unknown) => {
          const msg =
            storageErr instanceof Error ? storageErr.message : "Storage error";
          console.warn(`Gagal membersihkan media saat hapus undangan: ${msg}`);
        });
      }
    }

    revalidateTag(INVITATIONS_LIST_CACHE_TAG, { expire: 0 });
    revalidateTag(getInvitationCacheTag(normalizedSlug), { expire: 0 });
    revalidatePath(`/${normalizedSlug}`);

    return NextResponse.json(
      { ok: true, slug: deleted.slug },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus undangan.";
    console.error(`Gagal menghapus undangan "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus undangan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
