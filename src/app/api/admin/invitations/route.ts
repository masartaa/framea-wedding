import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireSuperAdminSession } from "@/lib/auth";
import { DEFAULT_SITE_CONFIG } from "@/lib/config-schema";
import {
  getInvitationCacheTag,
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import {
  createInvitation,
  INVITATIONS_LIST_CACHE_TAG,
  listInvitations,
} from "@/lib/invitations";

const createInvitationSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Nama undangan wajib diisi.")
    .max(120, "Nama undangan maksimal 120 karakter."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(80, "Slug maksimal 80 karakter."),
  password: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 6,
      "Sandi pasangan minimal 6 karakter (atau kosongkan)."
    )
    .max(200, "Sandi terlalu panjang.")
    .optional()
    .default(""),
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

export async function GET() {
  const auth = await requireSuperAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { invitations: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const items = await listInvitations();
    return NextResponse.json(
      { invitations: items },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat daftar undangan.";
    console.error(`Gagal memuat daftar undangan: ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar undangan dari database." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data undangan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const normalizedSlug = normalizeInvitationSlug(parsed.data.slug);
  if (!isValidInvitationSlug(normalizedSlug)) {
    return NextResponse.json(
      {
        error:
          "Slug tidak valid atau memakai kata yang dipesan sistem (admin/api/login). Gunakan huruf kecil, angka, dan tanda hubung (-).",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const created = await createInvitation({
      slug: normalizedSlug,
      label: parsed.data.label,
      password: parsed.data.password || undefined,
      initialConfig: DEFAULT_SITE_CONFIG,
    });

    revalidateTag(INVITATIONS_LIST_CACHE_TAG, { expire: 0 });
    revalidateTag(getInvitationCacheTag(created.slug), { expire: 0 });
    revalidatePath(`/${created.slug}`);

    return NextResponse.json(
      {
        ok: true,
        invitation: {
          id: created.id,
          slug: created.slug,
          label: created.label,
          coupleTitle: `${created.config.couple.groom.nickname} & ${created.config.couple.bride.nickname}`,
          eventDate: created.config.general.eventDate,
          hasPassword: created.hasPassword,
          guestCount: 0,
          wishCount: 0,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    if (isUniqueViolationError(error)) {
      return NextResponse.json(
        {
          error: `Slug "/${normalizedSlug}" sudah dipakai undangan lain. Pilih slug yang berbeda.`,
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    const message =
      error instanceof Error ? error.message : "Gagal membuat undangan.";
    console.error(`Gagal membuat undangan baru: ${message}`);
    return NextResponse.json(
      { error: "Gagal membuat undangan baru. Silakan coba lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
