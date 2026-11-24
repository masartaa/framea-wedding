import { and, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { wishes } from "@/db/schema";
import { requireInvitationAccessSession } from "@/lib/auth";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { getInvitationBySlugFresh } from "@/lib/invitations";

const patchWishSchema = z.object({
  id: z.number().int().positive("ID ucapan tidak valid."),
  isHidden: z.boolean(),
});

const deleteWishSchema = z.object({
  id: z.number().int().positive("ID ucapan tidak valid."),
});

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
      .where(eq(wishes.invitationId, invitation.id))
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
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat ucapan.";
    console.error(`Gagal membaca ucapan admin "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar ucapan dari database." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
      .where(
        and(
          eq(wishes.id, parsed.data.id),
          eq(wishes.invitationId, invitation.id)
        )
      )
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
    console.error(`Gagal ubah status ucapan "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memperbarui status ucapan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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
      .where(
        and(
          eq(wishes.id, parsed.data.id),
          eq(wishes.invitationId, invitation.id)
        )
      )
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
    console.error(`Gagal hapus ucapan "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus ucapan." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
