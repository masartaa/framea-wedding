import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { guests, media, wishes } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { getSiteConfigFresh } from "@/lib/site-config";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  const configResult = await getSiteConfigFresh();
  let guestRows: Array<{
    id: number;
    name: string;
    slug: string;
    createdAt: string;
  }> = [];
  let wishRows: Array<{
    id: number;
    name: string;
    message: string;
    isHidden: boolean;
    createdAt: string;
  }> = [];
  let mediaRows: Array<{
    id: number;
    kind: string;
    url: string;
    sortOrder: number;
    createdAt: string;
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const [dbGuests, dbWishes, dbMedia] = await Promise.all([
        db.select().from(guests).orderBy(desc(guests.createdAt)),
        db.select().from(wishes).orderBy(desc(wishes.createdAt)),
        db.select().from(media).orderBy(desc(media.createdAt)),
      ]);

      guestRows = dbGuests.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        createdAt: row.createdAt.toISOString(),
      }));
      wishRows = dbWishes.map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        isHidden: row.isHidden,
        createdAt: row.createdAt.toISOString(),
      }));
      mediaRows = dbMedia.map((row) => ({
        id: row.id,
        kind: row.kind,
        url: row.url,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal membaca database.";
      console.error(`Gagal membuat cadangan database: ${message}`);
      return NextResponse.json(
        { error: "Gagal mengambil data cadangan dari database." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  const exportedAt = new Date().toISOString();
  const dateStamp = exportedAt.slice(0, 10);

  const backupPayload = {
    app: "framea-wedding-invitation",
    version: 1,
    exportedAt,
    configSource: configResult.source,
    siteConfig: configResult.config,
    guests: guestRows,
    wishes: wishRows,
    media: mediaRows,
  };

  return new NextResponse(JSON.stringify(backupPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="framea-backup-${dateStamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
