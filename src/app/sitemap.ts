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
  ];
}
