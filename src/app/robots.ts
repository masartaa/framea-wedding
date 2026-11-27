import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/marketing";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/$",
        "/contoh",
        "/syarat-ketentuan",
        "/privasi",
        "/pengembalian-dana",
        "/opengraph-image",
        "/sitemap.xml",
        "/icon.svg",
        "/apple-icon",
      ],
      disallow: "/",
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
