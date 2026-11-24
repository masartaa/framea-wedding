import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireInvitationAccessSession } from "@/lib/auth";
import { siteConfigSchema } from "@/lib/config-schema";
import {
  getInvitationCacheTag,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import {
  getInvitationBySlugFresh,
  INVITATIONS_LIST_CACHE_TAG,
  saveInvitationConfig,
} from "@/lib/invitations";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const normalizedSlug = normalizeInvitationSlug(slug);

  const auth = await requireInvitationAccessSession(normalizedSlug);
  if (!auth.ok) {
    return auth.response;
  }

  const invitation = await getInvitationBySlugFresh(normalizedSlug);
  if (!invitation) {
    return NextResponse.json(
      { error: "Undangan tidak ditemukan." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      config: invitation.config,
      source: "database" as const,
      updatedAt: invitation.updatedAt,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const normalizedSlug = normalizeInvitationSlug(slug);

  const auth = await requireInvitationAccessSession(normalizedSlug);
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi (DATABASE_URL kosong)." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data JSON tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = siteConfigSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const pathKey = issue.path.map(String).join(".") || "form";
      if (!fieldErrors[pathKey]) {
        fieldErrors[pathKey] = issue.message;
      }
    }

    const firstMessage =
      parsed.error.issues[0]?.message ?? "Data konfigurasi tidak valid.";
    return NextResponse.json(
      { error: firstMessage, fieldErrors },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const saved = await saveInvitationConfig(normalizedSlug, parsed.data);
    if (!saved) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    revalidateTag(getInvitationCacheTag(normalizedSlug), { expire: 0 });
    revalidateTag(INVITATIONS_LIST_CACHE_TAG, { expire: 0 });
    revalidatePath(`/${normalizedSlug}`);

    return NextResponse.json(
      {
        ok: true,
        config: saved.config,
        updatedAt: saved.updatedAt,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menyimpan ke database.";
    console.error(`Gagal menyimpan config undangan "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menyimpan konfigurasi ke database. Silakan coba lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
