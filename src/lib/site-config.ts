import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { siteConfig } from "@/db/schema";
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_ROW_ID,
  siteConfigSchema,
  type SiteConfig,
} from "@/lib/config-schema";

export const SITE_CONFIG_CACHE_TAG = "site-config";

export interface SiteConfigResult {
  config: SiteConfig;
  source: "database" | "default";
  updatedAt: string | null;
}

async function fetchSiteConfigFromDb(): Promise<SiteConfigResult> {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        data: siteConfig.data,
        updatedAt: siteConfig.updatedAt,
      })
      .from(siteConfig)
      .where(eq(siteConfig.id, SITE_CONFIG_ROW_ID))
      .limit(1);

    if (!row) {
      return {
        config: DEFAULT_SITE_CONFIG,
        source: "default",
        updatedAt: null,
      };
    }

    const parsed = siteConfigSchema.safeParse(row.data);
    if (!parsed.success) {
      console.warn(
        "Data site_config di database tidak valid, menggunakan konfigurasi default."
      );
      return {
        config: DEFAULT_SITE_CONFIG,
        source: "default",
        updatedAt: null,
      };
    }

    return {
      config: parsed.data,
      source: "database",
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.warn(`Gagal membaca site_config dari database: ${message}`);
    return {
      config: DEFAULT_SITE_CONFIG,
      source: "default",
      updatedAt: null,
    };
  }
}

const getCachedSiteConfig = unstable_cache(
  fetchSiteConfigFromDb,
  ["site-config-row"],
  {
    revalidate: 300,
    tags: [SITE_CONFIG_CACHE_TAG],
  }
);

export async function getSiteConfig(): Promise<SiteConfigResult> {
  if (!process.env.DATABASE_URL) {
    return {
      config: DEFAULT_SITE_CONFIG,
      source: "default",
      updatedAt: null,
    };
  }

  return getCachedSiteConfig();
}

export async function getSiteConfigFresh(): Promise<SiteConfigResult> {
  if (!process.env.DATABASE_URL) {
    return {
      config: DEFAULT_SITE_CONFIG,
      source: "default",
      updatedAt: null,
    };
  }

  return fetchSiteConfigFromDb();
}

export async function saveSiteConfig(
  input: SiteConfig
): Promise<{ config: SiteConfig; updatedAt: string }> {
  const validated = siteConfigSchema.parse(input);
  const db = getDb();
  const now = new Date();

  const [saved] = await db
    .insert(siteConfig)
    .values({
      id: SITE_CONFIG_ROW_ID,
      data: validated,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: siteConfig.id,
      set: {
        data: validated,
        updatedAt: now,
      },
    })
    .returning({ updatedAt: siteConfig.updatedAt });

  return {
    config: validated,
    updatedAt: (saved?.updatedAt ?? now).toISOString(),
  };
}
