import { and, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { rsvps } from "@/db/schema";
import { requireInvitationAccessSession } from "@/lib/auth";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { getInvitationBySlugFresh } from "@/lib/invitations";

const deleteRsvpSchema = z.object({
  id: z.number().int().positive("ID konfirmasi tidak valid."),
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
        id: rsvps.id,
        name: rsvps.name,
        attendance: rsvps.attendance,
        guestCount: rsvps.guestCount,
        note: rsvps.note,
        createdAt: rsvps.createdAt,
      })
      .from(rsvps)
      .where(eq(rsvps.invitationId, invitation.id))
      .orderBy(desc(rsvps.createdAt))
      .limit(500);

    let attendingCount = 0;
    let attendingGuestsTotal = 0;
    let notAttendingCount = 0;
    let maybeCount = 0;

    for (const row of rows) {
      if (row.attendance === "hadir") {
        attendingCount += 1;
        attendingGuestsTotal += row.guestCount;
      } else if (row.attendance === "tidak_hadir") {
        notAttendingCount += 1;
      } else {
        maybeCount += 1;
      }
    }

    return NextResponse.json(
      {
        rsvps: rows.map((row) => ({
          id: row.id,
          name: row.name,
          attendance: row.attendance,
          guestCount: row.guestCount,
          note: row.note,
          createdAt: row.createdAt.toISOString(),
        })),
        summary: {
          totalResponses: rows.length,
          attendingCount,
          attendingGuestsTotal,
          notAttendingCount,
          maybeCount,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data RSVP.";
    console.error(`Gagal membaca RSVP admin "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar RSVP dari database." },
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

  const parsed = deleteRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ID RSVP tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const [deleted] = await db
      .delete(rsvps)
      .where(
        and(
          eq(rsvps.id, parsed.data.id),
          eq(rsvps.invitationId, invitation.id)
        )
      )
      .returning({ id: rsvps.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Data RSVP tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, id: deleted.id },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus RSVP.";
    console.error(`Gagal hapus RSVP "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal menghapus data RSVP." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
