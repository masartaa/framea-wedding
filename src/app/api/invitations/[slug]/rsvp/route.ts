import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, rsvps } from "@/db/schema";
import { siteConfigSchema } from "@/lib/config-schema";
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import {
  checkRsvpRateLimit,
  getClientIp,
  recordRsvpSubmission,
} from "@/lib/rate-limit";

const createRsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(60, "Nama maksimal 60 karakter."),
  attendance: z.enum(["hadir", "tidak_hadir", "ragu"], {
    message: "Pilih status kehadiran terlebih dahulu.",
  }),
  guestCount: z
    .number()
    .int("Jumlah tamu harus berupa angka bulat.")
    .min(0, "Jumlah tamu tidak valid.")
    .max(400, "Jumlah tamu maksimal 400 orang."),
  note: z
    .string()
    .trim()
    .max(200, "Catatan maksimal 200 karakter.")
    .optional()
    .default(""),
  website: z.string().optional().default(""),
});

function sanitizePlainText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Layanan konfirmasi kehadiran belum tersedia saat ini." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { slug } = await context.params;
  const normalized = normalizeInvitationSlug(slug);
  if (!isValidInvitationSlug(normalized)) {
    return NextResponse.json(
      { error: "Undangan tidak ditemukan." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let invitationRow: { id: number; data: unknown } | undefined;
  try {
    const db = getDb();
    const [row] = await db
      .select({ id: invitations.id, data: invitations.data })
      .from(invitations)
      .where(eq(invitations.slug, normalized))
      .limit(1);
    invitationRow = row;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mencari undangan.";
    console.error(`Gagal mencari undangan untuk RSVP "${normalized}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memproses konfirmasi. Silakan coba lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!invitationRow) {
    return NextResponse.json(
      { error: "Undangan tidak ditemukan." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = createRsvpSchema.safeParse(body);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Isian konfirmasi tidak valid.";
    return NextResponse.json(
      { error: firstMessage },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json(
      { ok: true, skipped: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const clientIp = getClientIp(request.headers);
  const rateLimit = checkRsvpRateLimit(clientIp);
  if (!rateLimit.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        error: `Anda sudah mengirim beberapa konfirmasi. Silakan coba lagi dalam ${minutes} menit.`,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const parsedConfig = siteConfigSchema.safeParse(invitationRow.data);
  const maxGuests = parsedConfig.success
    ? parsedConfig.data.rsvp.maxGuests
    : 5;

  const cleanName = sanitizePlainText(parsed.data.name).slice(0, 60);
  const cleanNote = sanitizePlainText(parsed.data.note).slice(0, 200);
  if (!cleanName) {
    return NextResponse.json(
      { error: "Nama wajib diisi." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const finalGuestCount =
    parsed.data.attendance === "tidak_hadir"
      ? 0
      : Math.max(1, Math.min(maxGuests, parsed.data.guestCount));

  try {
    const db = getDb();
    const [inserted] = await db
      .insert(rsvps)
      .values({
        invitationId: invitationRow.id,
        name: cleanName,
        attendance: parsed.data.attendance,
        guestCount: finalGuestCount,
        note: cleanNote,
      })
      .returning({
        id: rsvps.id,
        name: rsvps.name,
        attendance: rsvps.attendance,
        guestCount: rsvps.guestCount,
        note: rsvps.note,
        createdAt: rsvps.createdAt,
      });

    recordRsvpSubmission(clientIp);

    return NextResponse.json(
      {
        ok: true,
        rsvp: {
          id: inserted.id,
          name: inserted.name,
          attendance: inserted.attendance,
          guestCount: inserted.guestCount,
          note: inserted.note,
          createdAt: inserted.createdAt.toISOString(),
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan RSVP.";
    console.error(`Gagal menyimpan RSVP untuk "${normalized}": ${message}`);
    return NextResponse.json(
      { error: "Gagal mengirim konfirmasi. Silakan coba beberapa saat lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
