import { and, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import { requireInvitationAccessSession } from "@/lib/auth";
import { createGuestSlug, parseGuestNamesInput } from "@/lib/guest-utils";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { getInvitationBySlugFresh } from "@/lib/invitations";

const createGuestsSchema = z.object({
  rawNames: z
    .string()
    .trim()
    .min(1, "Masukkan minimal satu nama tamu.")
    .max(40000, "Daftar nama terlalu panjang."),
});

const deleteGuestSchema = z.object({
  id: z.number().int().positive("ID tamu tidak valid."),
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
        id: guests.id,
        name: guests.name,
        slug: guests.slug,
        createdAt: guests.createdAt,
      })
      .from(guests)
      .where(eq(guests.invitationId, invitation.id))
      .orderBy(desc(guests.createdAt))
      .limit(1000);

    return NextResponse.json(
      {
        guests: rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          createdAt: row.createdAt.toISOString(),
        })),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat daftar tamu.";
    console.error(`Gagal membaca tamu untuk "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar tamu dari database." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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

  const parsed = createGuestsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tamu tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const names = parseGuestNamesInput(parsed.data.rawNames);
  if (names.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada nama tamu valid yang ditemukan." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const valuesToInsert = names.map((name) => ({
    invitationId: invitation.id,
    name,
    slug: createGuestSlug(name),
  }));

  try {
    const db = getDb();
    const inserted = await db
      .insert(guests)
      .values(valuesToInsert)
      .onConflictDoNothing({ target: [guests.invitationId, guests.slug] })
      .returning({
        id: guests.id,
        name: guests.name,
        slug: guests.slug,
        createdAt: guests.createdAt,
      });

    const addedCount = inserted.length;
    const skippedCount = Math.max(0, names.length - addedCount);

    return NextResponse.json(
      {
        ok: true,
        added: inserted.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          createdAt: row.createdAt.toISOString(),
        })),
        addedCount,
        skippedCount,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan tamu.";
    console.error(`Gagal menambahkan tamu untuk "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menyimpan daftar tamu ke database." },
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

  const parsed = deleteGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ID tamu tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const [deleted] = await db
      .delete(guests)
      .where(
        and(
          eq(guests.id, parsed.data.id),
          eq(guests.invitationId, invitation.id)
        )
      )
      .returning({ id: guests.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Data tamu tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, id: deleted.id },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus tamu.";
    console.error(`Gagal menghapus tamu untuk "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus tamu." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
