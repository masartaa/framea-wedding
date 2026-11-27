import { asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { guests, invitations, media, wishes } from "@/db/schema";
import {
  DEFAULT_SITE_CONFIG,
  ensureAllSections,
  siteConfigSchema,
  type SiteConfig,
} from "@/lib/config-schema";
import {
  getInvitationCacheTag,
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import { hashPassword } from "@/lib/password-hash";

export const INVITATIONS_LIST_CACHE_TAG = "invitations";

export interface InvitationRecord {
  id: number;
  slug: string;
  label: string;
  hasPassword: boolean;
  config: SiteConfig;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationAuthRecord {
  id: number;
  slug: string;
  label: string;
  passwordHash: string | null;
}

export interface InvitationSummary {
  id: number;
  slug: string;
  label: string;
  coupleTitle: string;
  eventDate: string;
  hasPassword: boolean;
  guestCount: number;
  wishCount: number;
  createdAt: string;
  updatedAt: string;
}

function clampLegacyStoredConfig(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }
  const record = raw as Record<string, unknown>;
  const rawRsvp = record.rsvp;
  if (
    rawRsvp &&
    typeof rawRsvp === "object" &&
    !Array.isArray(rawRsvp) &&
    typeof (rawRsvp as Record<string, unknown>).maxGuests === "number" &&
    ((rawRsvp as Record<string, unknown>).maxGuests as number) > 10
  ) {
    return {
      ...record,
      rsvp: {
        ...(rawRsvp as Record<string, unknown>),
        maxGuests: 10,
      },
    };
  }
  return raw;
}

function parseStoredConfig(raw: unknown): SiteConfig {
  const parsed = siteConfigSchema.safeParse(clampLegacyStoredConfig(raw));
  if (parsed.success) {
    return {
      ...parsed.data,
      sections: ensureAllSections(parsed.data.sections),
    };
  }
  console.warn(
    "Data konfigurasi undangan tidak valid, menggunakan fallback default."
  );
  return DEFAULT_SITE_CONFIG;
}

async function fetchInvitationBySlugFromDb(
  slug: string
): Promise<InvitationRecord | null> {
  const normalized = normalizeInvitationSlug(slug);
  if (!isValidInvitationSlug(normalized) || !process.env.DATABASE_URL) {
    return null;
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({
        id: invitations.id,
        slug: invitations.slug,
        label: invitations.label,
        passwordHash: invitations.passwordHash,
        data: invitations.data,
        createdAt: invitations.createdAt,
        updatedAt: invitations.updatedAt,
      })
      .from(invitations)
      .where(eq(invitations.slug, normalized))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      slug: row.slug,
      label: row.label,
      hasPassword: Boolean(row.passwordHash),
      config: parseStoredConfig(row.data),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.warn(`Gagal membaca undangan "${normalized}": ${message}`);
    return null;
  }
}

export async function getInvitationBySlug(
  slug: string
): Promise<InvitationRecord | null> {
  const normalized = normalizeInvitationSlug(slug);
  if (!isValidInvitationSlug(normalized) || !process.env.DATABASE_URL) {
    return null;
  }

  const cachedFetcher = unstable_cache(
    () => fetchInvitationBySlugFromDb(normalized),
    ["invitation-by-slug", normalized],
    {
      revalidate: 300,
      tags: [getInvitationCacheTag(normalized), INVITATIONS_LIST_CACHE_TAG],
    }
  );

  return cachedFetcher();
}

export async function getInvitationBySlugFresh(
  slug: string
): Promise<InvitationRecord | null> {
  return fetchInvitationBySlugFromDb(slug);
}

export async function getInvitationAuthRecordBySlug(
  slug: string
): Promise<InvitationAuthRecord | null> {
  const normalized = normalizeInvitationSlug(slug);
  if (!isValidInvitationSlug(normalized) || !process.env.DATABASE_URL) {
    return null;
  }

  const db = getDb();
  const [row] = await db
    .select({
      id: invitations.id,
      slug: invitations.slug,
      label: invitations.label,
      passwordHash: invitations.passwordHash,
    })
    .from(invitations)
    .where(eq(invitations.slug, normalized))
    .limit(1);

  return row ?? null;
}

export async function listInvitations(): Promise<InvitationSummary[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();
  const [rows, guestCounts, wishCounts] = await Promise.all([
    db
      .select({
        id: invitations.id,
        slug: invitations.slug,
        label: invitations.label,
        passwordHash: invitations.passwordHash,
        data: invitations.data,
        createdAt: invitations.createdAt,
        updatedAt: invitations.updatedAt,
      })
      .from(invitations)
      .orderBy(asc(invitations.id)),
    db
      .select({
        invitationId: guests.invitationId,
        count: sql<number>`count(*)::int`,
      })
      .from(guests)
      .groupBy(guests.invitationId),
    db
      .select({
        invitationId: wishes.invitationId,
        count: sql<number>`count(*)::int`,
      })
      .from(wishes)
      .groupBy(wishes.invitationId),
  ]);

  const guestMap = new Map<number, number>();
  for (const entry of guestCounts) {
    if (entry.invitationId !== null) {
      guestMap.set(entry.invitationId, entry.count);
    }
  }

  const wishMap = new Map<number, number>();
  for (const entry of wishCounts) {
    if (entry.invitationId !== null) {
      wishMap.set(entry.invitationId, entry.count);
    }
  }

  return rows.map((row) => {
    const config = parseStoredConfig(row.data);
    return {
      id: row.id,
      slug: row.slug,
      label: row.label,
      coupleTitle: `${config.couple.groom.nickname} & ${config.couple.bride.nickname}`,
      eventDate: config.general.eventDate,
      hasPassword: Boolean(row.passwordHash),
      guestCount: guestMap.get(row.id) ?? 0,
      wishCount: wishMap.get(row.id) ?? 0,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export async function createInvitation(params: {
  slug: string;
  label: string;
  password?: string;
  initialConfig?: SiteConfig;
}): Promise<InvitationRecord> {
  const normalizedSlug = normalizeInvitationSlug(params.slug);
  if (!isValidInvitationSlug(normalizedSlug)) {
    throw new Error(
      "Slug tidak valid. Gunakan 2–80 karakter huruf kecil, angka, atau tanda hubung (-), dan bukan kata sistem."
    );
  }

  const label = params.label.trim();
  if (!label) {
    throw new Error("Nama undangan wajib diisi.");
  }

  const config = siteConfigSchema.parse(
    params.initialConfig ?? DEFAULT_SITE_CONFIG
  );
  const trimmedPassword = params.password?.trim() ?? "";
  const passwordHash = trimmedPassword ? hashPassword(trimmedPassword) : null;

  const db = getDb();
  const now = new Date();
  const [inserted] = await db
    .insert(invitations)
    .values({
      slug: normalizedSlug,
      label,
      passwordHash,
      data: config,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    id: inserted.id,
    slug: inserted.slug,
    label: inserted.label,
    hasPassword: Boolean(inserted.passwordHash),
    config: parseStoredConfig(inserted.data),
    createdAt: inserted.createdAt.toISOString(),
    updatedAt: inserted.updatedAt.toISOString(),
  };
}

export async function saveInvitationConfig(
  slug: string,
  input: SiteConfig
): Promise<{ config: SiteConfig; updatedAt: string } | null> {
  const normalizedSlug = normalizeInvitationSlug(slug);
  const validated = siteConfigSchema.parse(input);
  const db = getDb();
  const now = new Date();

  const [updated] = await db
    .update(invitations)
    .set({
      data: validated,
      updatedAt: now,
    })
    .where(eq(invitations.slug, normalizedSlug))
    .returning({ updatedAt: invitations.updatedAt });

  if (!updated) {
    return null;
  }

  return {
    config: validated,
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function updateInvitationMeta(
  currentSlug: string,
  updates: {
    slug?: string;
    label?: string;
    password?: string | null;
  }
): Promise<InvitationRecord | null> {
  const normalizedCurrent = normalizeInvitationSlug(currentSlug);
  const patch: {
    slug?: string;
    label?: string;
    passwordHash?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (typeof updates.slug === "string") {
    const nextSlug = normalizeInvitationSlug(updates.slug);
    if (!isValidInvitationSlug(nextSlug)) {
      throw new Error(
        "Slug baru tidak valid. Gunakan huruf kecil, angka, atau tanda hubung (-)."
      );
    }
    patch.slug = nextSlug;
  }

  if (typeof updates.label === "string") {
    const nextLabel = updates.label.trim();
    if (!nextLabel) {
      throw new Error("Nama undangan tidak boleh kosong.");
    }
    patch.label = nextLabel;
  }

  if (updates.password === null) {
    patch.passwordHash = null;
  } else if (typeof updates.password === "string" && updates.password.trim()) {
    patch.passwordHash = hashPassword(updates.password.trim());
  }

  const db = getDb();
  const [updated] = await db
    .update(invitations)
    .set(patch)
    .where(eq(invitations.slug, normalizedCurrent))
    .returning();

  if (!updated) {
    return null;
  }

  return {
    id: updated.id,
    slug: updated.slug,
    label: updated.label,
    hasPassword: Boolean(updated.passwordHash),
    config: parseStoredConfig(updated.data),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteInvitationBySlug(slug: string): Promise<{
  id: number;
  slug: string;
  mediaUrls: string[];
} | null> {
  const normalizedSlug = normalizeInvitationSlug(slug);
  const db = getDb();

  const [existing] = await db
    .select({
      id: invitations.id,
      slug: invitations.slug,
      data: invitations.data,
    })
    .from(invitations)
    .where(eq(invitations.slug, normalizedSlug))
    .limit(1);

  if (!existing) {
    return null;
  }

  const dbMediaRows = await db
    .select({ url: media.url })
    .from(media)
    .where(eq(media.invitationId, existing.id));

  const parsedConfig = parseStoredConfig(existing.data);
  const urlSet = new Set<string>([
    ...dbMediaRows.map((row) => row.url),
    parsedConfig.media.heroPhotoUrl,
    parsedConfig.media.musicUrl,
    parsedConfig.couple.groom.photoUrl,
    parsedConfig.couple.bride.photoUrl,
    ...parsedConfig.media.galleryPhotoUrls,
    ...parsedConfig.story.items.map((item) => item.photoUrl ?? ""),
    parsedConfig.gift?.qris?.imageUrl ?? "",
  ]);
  urlSet.delete("");

  await db.delete(invitations).where(eq(invitations.id, existing.id));

  return {
    id: existing.id,
    slug: existing.slug,
    mediaUrls: Array.from(urlSet),
  };
}
