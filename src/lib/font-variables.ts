import type { SiteConfig } from "@/lib/config-schema";

type HeadingFont = SiteConfig["theme"]["fonts"]["heading"];
type BodyFont = SiteConfig["theme"]["fonts"]["body"];

export const HEADING_FONT_CSS_MAP: Record<HeadingFont, string> = {
  "Playfair Display": "var(--font-playfair-display), Georgia, serif",
  "Cormorant Garamond": "var(--font-cormorant-garamond), Georgia, serif",
  Lora: "var(--font-lora), Georgia, serif",
  "DM Serif Display": "var(--font-dm-serif-display), Georgia, serif",
  Cinzel: "var(--font-cinzel), Georgia, serif",
  "Plus Jakarta Sans": "var(--font-plus-jakarta-sans), system-ui, sans-serif",
};

export const BODY_FONT_CSS_MAP: Record<BodyFont, string> = {
  Inter: "var(--font-inter), system-ui, sans-serif",
  "Plus Jakarta Sans": "var(--font-plus-jakarta-sans), system-ui, sans-serif",
  Lato: "var(--font-lato), system-ui, sans-serif",
  "Source Sans 3": "var(--font-source-sans-3), system-ui, sans-serif",
  "Nunito Sans": "var(--font-nunito-sans), system-ui, sans-serif",
  Lora: "var(--font-lora), Georgia, serif",
};
