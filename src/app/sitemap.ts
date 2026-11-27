import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/marketing";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_ORIGIN}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/contoh`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_ORIGIN}/syarat-ketentuan`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_ORIGIN}/privasi`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_ORIGIN}/pengembalian-dana`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
