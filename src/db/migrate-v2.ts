import { existsSync } from "node:fs";
import { asc, eq, isNull } from "drizzle-orm";
import { getDb } from "./index.ts";
import { guests, invitations, media, siteConfig, wishes } from "./schema.ts";
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_ROW_ID,
  siteConfigSchema,
} from "../lib/config-schema.ts";
import { DEFAULT_INVITATION_SLUG } from "../lib/invitation-slug.ts";

function loadLocalEnv() {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

async function migrateV2() {
  loadLocalEnv();

  const db = getDb();

  let [primaryInvitation] = await db
    .select({
      id: invitations.id,
      slug: invitations.slug,
      label: invitations.label,
    })
    .from(invitations)
    .where(eq(invitations.slug, DEFAULT_INVITATION_SLUG))
    .limit(1);

  if (!primaryInvitation) {
    const [firstExisting] = await db
      .select({
        id: invitations.id,
        slug: invitations.slug,
        label: invitations.label,
      })
      .from(invitations)
      .orderBy(asc(invitations.id))
      .limit(1);

    if (firstExisting) {
      primaryInvitation = firstExisting;
      console.log(
        `Undangan awal sudah tersedia: "${primaryInvitation.slug}" (id=${primaryInvitation.id}).`
      );
    } else {
      // Baca konfigurasi lama dari site_config (id=1) tanpa menghapusnya
      const [legacyRow] = await db
        .select({
          data: siteConfig.data,
          updatedAt: siteConfig.updatedAt,
        })
        .from(siteConfig)
        .where(eq(siteConfig.id, SITE_CONFIG_ROW_ID))
        .limit(1);

      const parsed = legacyRow
        ? siteConfigSchema.safeParse(legacyRow.data)
        : null;
      const migratedConfig = parsed?.success
        ? parsed.data
        : siteConfigSchema.parse(DEFAULT_SITE_CONFIG);

      const derivedLabel = `${migratedConfig.couple.groom.nickname} & ${migratedConfig.couple.bride.nickname}`;
      const now = new Date();

      const [inserted] = await db
        .insert(invitations)
        .values({
          slug: DEFAULT_INVITATION_SLUG,
          label: derivedLabel.slice(0, 120),
          passwordHash: null,
          data: migratedConfig,
          createdAt: now,
          updatedAt: legacyRow?.updatedAt ?? now,
        })
        .returning({
          id: invitations.id,
          slug: invitations.slug,
          label: invitations.label,
        });

      primaryInvitation = inserted;
      console.log(
        `Data site_config lama berhasil dimigrasikan ke invitations slug="${primaryInvitation.slug}" (id=${primaryInvitation.id}, label="${primaryInvitation.label}").`
      );
    }
  } else {
    console.log(
      `Undangan "${primaryInvitation.slug}" sudah ada (id=${primaryInvitation.id}), tidak menduplikasi.`
    );
  }

  const [updatedGuests, updatedWishes, updatedMedia] = await Promise.all([
    db
      .update(guests)
      .set({ invitationId: primaryInvitation.id })
      .where(isNull(guests.invitationId))
      .returning({ id: guests.id }),
    db
      .update(wishes)
      .set({ invitationId: primaryInvitation.id })
      .where(isNull(wishes.invitationId))
      .returning({ id: wishes.id }),
    db
      .update(media)
      .set({ invitationId: primaryInvitation.id })
      .where(isNull(media.invitationId))
      .returning({ id: media.id }),
  ]);

  console.log(
    `Migrasi relasi selesai → guests: ${updatedGuests.length}, wishes: ${updatedWishes.length}, media: ${updatedMedia.length} dihubungkan ke "${primaryInvitation.slug}".`
  );
}

migrateV2().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Terjadi kesalahan saat migrasi Versi 2.";
  console.error(`Migrasi V2 gagal: ${message}`);
  process.exit(1);
});
