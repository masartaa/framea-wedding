import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { wishes } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";

const patchWishSchema = z.object({
  id: z.number().int().positive("ID ucapan tidak valid."),
  isHidden: z.boolean(),
});

const deleteWishSchema = z.object({
  id: z.number().int().positive("ID ucapan tidak valid."),
});

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { wishes: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: wishes.id,
        name: wishes.name,
        message: wishes.message,
        isHidden: wishes.isHidden,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .orderBy(desc(wishes.createdAt))
      .limit(300);

    return NextResponse.json(
      {
        wishes: rows.map((row) => ({
          id: row.id,
          name: row.name,
          message: row.message,
          isHidden: row.isHidden,
          createdAt: row.createdAt.toISOString(),
        })),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat ucapan.";
    console.error(`Gagal membaca ucapan di admin: ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar ucapan dari database." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminSession();
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

  const parsed = patchWishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const [updated] = await db
      .update(wishes)
      .set({ isHidden: parsed.data.isHidden })
      .where(eq(wishes.id, parsed.data.id))
      .returning({
        id: wishes.id,
        name: wishes.name,
        message: wishes.message,
        isHidden: wishes.isHidden,
        createdAt: wishes.createdAt,
      });

    if (!updated) {
      return NextResponse.json(
        { error: "Ucapan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        wish: {
          id: updated.id,
          name: updated.name,
          message: updated.message,
          isHidden: updated.isHidden,
          createdAt: updated.createdAt.toISOString(),
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui ucapan.";
    console.error(`Gagal memperbarui status ucapan: ${message}`);
    return NextResponse.json(
      { error: "Gagal memperbarui status ucapan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminSession();
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

  const parsed = deleteWishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ID ucapan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const [deleted] = await db
      .delete(wishes)
      .where(eq(wishes.id, parsed.data.id))
      .returning({ id: wishes.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Ucapan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, id: deleted.id },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus ucapan.";
    console.error(`Gagal menghapus ucapan: ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus ucapan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
