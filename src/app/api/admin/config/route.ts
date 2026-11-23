import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { siteConfigSchema } from "@/lib/config-schema";
import {
  getSiteConfigFresh,
  saveSiteConfig,
  SITE_CONFIG_CACHE_TAG,
} from "@/lib/site-config";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  const result = await getSiteConfigFresh();
  return NextResponse.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi (DATABASE_URL kosong)." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data JSON tidak valid." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
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
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const saved = await saveSiteConfig(parsed.data);
    revalidateTag(SITE_CONFIG_CACHE_TAG, { expire: 0 });
    revalidatePath("/");

    return NextResponse.json(
      {
        ok: true,
        config: saved.config,
        updatedAt: saved.updatedAt,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menyimpan ke database.";
    console.error(`Gagal menyimpan site_config: ${message}`);
    return NextResponse.json(
      { error: "Gagal menyimpan konfigurasi ke database. Silakan coba lagi." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
