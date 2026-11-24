import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { guests, media, wishes } from "@/db/schema";
import { requireInvitationAccessSession } from "@/lib/auth";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { getInvitationBySlugFresh } from "@/lib/invitations";

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
    const [dbGuests, dbWishes, dbMedia] = await Promise.all([
      db
        .select()
        .from(guests)
        .where(eq(guests.invitationId, invitation.id))
        .orderBy(desc(guests.createdAt)),
      db
        .select()
        .from(wishes)
        .where(eq(wishes.invitationId, invitation.id))
        .orderBy(desc(wishes.createdAt)),
      db
        .select()
        .from(media)
        .where(eq(media.invitationId, invitation.id))
        .orderBy(desc(media.createdAt)),
    ]);

    const exportedAt = new Date().toISOString();
    const dateStamp = exportedAt.slice(0, 10);

    const backupPayload = {
      app: "framea-wedding-invitation",
      version: 2,
      slug: invitation.slug,
      label: invitation.label,
      exportedAt,
      siteConfig: invitation.config,
      guests: dbGuests.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        createdAt: row.createdAt.toISOString(),
      })),
      wishes: dbWishes.map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        isHidden: row.isHidden,
        createdAt: row.createdAt.toISOString(),
      })),
      media: dbMedia.map((row) => ({
        id: row.id,
        kind: row.kind,
        url: row.url,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
      })),
    };

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="framea-${invitation.slug}-backup-${dateStamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat cadangan.";
    console.error(`Gagal membuat cadangan "${normalizedSlug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal mengambil data cadangan dari database." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
