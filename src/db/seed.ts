import { existsSync } from "node:fs";
import { eq } from "drizzle-orm";
import { getDb } from "./index.ts";
import { siteConfig } from "./schema.ts";
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_ROW_ID,
  siteConfigSchema,
} from "../lib/config-schema.ts";

function loadLocalEnv() {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

async function seed() {
  loadLocalEnv();

  const validatedConfig = siteConfigSchema.parse(DEFAULT_SITE_CONFIG);
  const db = getDb();

  await db
    .insert(siteConfig)
    .values({
      id: SITE_CONFIG_ROW_ID,
      data: validatedConfig,
    })
    .onConflictDoNothing({ target: siteConfig.id });

  const [saved] = await db
    .select({ id: siteConfig.id, updatedAt: siteConfig.updatedAt })
    .from(siteConfig)
    .where(eq(siteConfig.id, SITE_CONFIG_ROW_ID))
    .limit(1);

  if (!saved) {
    throw new Error("Gagal memverifikasi data site_config setelah seed.");
  }

  console.log(
    `Seed selesai: site_config (id=${saved.id}) siap di database (updated_at=${saved.updatedAt.toISOString()}).`
  );
}

seed().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Terjadi kesalahan saat seed.";
  console.error(`Seed gagal: ${message}`);
  process.exit(1);
});
