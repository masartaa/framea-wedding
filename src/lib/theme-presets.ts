import type { SiteConfig, ThemeColors } from "@/lib/config-schema";

export type ThemePresetKey = Exclude<SiteConfig["theme"]["preset"], "custom">;
export type HeadingFontOption = SiteConfig["theme"]["fonts"]["heading"];
export type BodyFontOption = SiteConfig["theme"]["fonts"]["body"];
export type CoverLayoutOption = SiteConfig["theme"]["layout"]["cover"];
export type HeroLayoutOption = SiteConfig["theme"]["layout"]["hero"];
export type HeroShapeOption = SiteConfig["theme"]["layout"]["heroShape"];
export type HeroDecorationOption =
  SiteConfig["theme"]["layout"]["heroDecoration"];

export interface ThemePresetDefinition {
  id: ThemePresetKey;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ReadonlyArray<ThemePresetDefinition> = [
  {
    id: "putih-emas",
    name: "Putih & Emas",
    description: "Elegan klasik dengan aksen emas lembut (default).",
    colors: {
      primary: "#C9A24B",
      secondary: "#F5EFE0",
      background: "#FFFFFF",
      text: "#2B2B2B",
      accent: "#B8860B",
    },
  },
  {
    id: "sage-green",
    name: "Sage Green",
    description: "Nuansa hijau natural yang tenang dan modern.",
    colors: {
      primary: "#5F7A61",
      secondary: "#EEF3EE",
      background: "#FAFBF9",
      text: "#263327",
      accent: "#445E46",
    },
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    description: "Romantis lembut dengan sentuhan mawar pastel.",
    colors: {
      primary: "#B56E78",
      secondary: "#F8ECEE",
      background: "#FFFDFD",
      text: "#362528",
      accent: "#944E58",
    },
  },
  {
    id: "navy-gold",
    name: "Navy & Gold",
    description: "Formal berkelas dengan biru dongker dan emas.",
    colors: {
      primary: "#1F365C",
      secondary: "#EDF1F7",
      background: "#FFFFFF",
      text: "#1B2433",
      accent: "#9A7426",
    },
  },
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Hangat, intim, dan bernuansa bumi.",
    colors: {
      primary: "#B86B4B",
      secondary: "#F6ECE6",
      background: "#FFFDFB",
      text: "#33251F",
      accent: "#944F32",
    },
  },
];

export interface FontPairingDefinition {
  id: string;
  name: string;
  heading: HeadingFontOption;
  body: BodyFontOption;
}

export const FONT_PAIRINGS: ReadonlyArray<FontPairingDefinition> = [
  {
    id: "klasik-elegan",
    name: "Klasik Elegan",
    heading: "Playfair Display",
    body: "Inter",
  },
  {
    id: "romantis-halus",
    name: "Romantis Halus",
    heading: "Cormorant Garamond",
    body: "Lato",
  },
  {
    id: "editorial-hangat",
    name: "Editorial Hangat",
    heading: "Lora",
    body: "Source Sans 3",
  },
  {
    id: "modern-tegas",
    name: "Modern Tegas",
    heading: "DM Serif Display",
    body: "Plus Jakarta Sans",
  },
  {
    id: "formal-megah",
    name: "Formal Megah",
    heading: "Cinzel",
    body: "Nunito Sans",
  },
  {
    id: "minimalis-bersih",
    name: "Minimalis Bersih",
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
];

export const HEADING_FONT_OPTIONS: ReadonlyArray<HeadingFontOption> = [
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
  "DM Serif Display",
  "Cinzel",
  "Plus Jakarta Sans",
];

export const BODY_FONT_OPTIONS: ReadonlyArray<BodyFontOption> = [
  "Inter",
  "Plus Jakarta Sans",
  "Lato",
  "Source Sans 3",
  "Nunito Sans",
  "Lora",
];

export const COVER_LAYOUT_OPTIONS: ReadonlyArray<{
  id: CoverLayoutOption;
  label: string;
  description: string;
}> = [
  {
    id: "center",
    label: "Kartu Tengah",
    description: "Kartu lembut di tengah dengan garis tipis elegan.",
  },
  {
    id: "minimal",
    label: "Minimalis",
    description: "Bersih tanpa kotak kartu, fokus pada tipografi.",
  },
  {
    id: "framed",
    label: "Berbingkai",
    description: "Bingkai tegas dengan bayangan lembut.",
  },
];

export const HERO_LAYOUT_OPTIONS: ReadonlyArray<{
  id: HeroLayoutOption;
  label: string;
  description: string;
}> = [
  {
    id: "full-photo",
    label: "Potret Penuh",
    description: "Proporsi foto vertikal 3:4 menonjol di bagian atas.",
  },
  {
    id: "split",
    label: "Proporsional",
    description: "Proporsi foto 4:3 ringkas agar judul segera terlihat.",
  },
  {
    id: "centered",
    label: "Ringkas Tengah",
    description: "Bingkai terpusat yang seimbang dan klasik.",
  },
];

export const HERO_SHAPE_OPTIONS: ReadonlyArray<{
  id: HeroShapeOption;
  label: string;
  description: string;
}> = [
  {
    id: "rounded",
    label: "Sudut Lembut",
    description: "Persegi panjang elegan bersudut melengkung.",
  },
  {
    id: "square",
    label: "Persegi 1:1",
    description: "Kotak simetris modern dan rapi.",
  },
  {
    id: "arch",
    label: "Lengkung Kubah",
    description: "Melengkung di atas (arch), sangat populer untuk undangan.",
  },
  {
    id: "oval",
    label: "Oval Vertikal",
    description: "Bentuk elips vertikal yang lembut dan romantis.",
  },
  {
    id: "circle",
    label: "Lingkaran",
    description: "Bulat penuh 1:1 berfokus pada kedua mempelai.",
  },
];

export const HERO_DECORATION_OPTIONS: ReadonlyArray<{
  id: HeroDecorationOption;
  label: string;
  description: string;
}> = [
  {
    id: "none",
    label: "Polos",
    description: "Bersih tanpa ornamen bingkai tambahan.",
  },
  {
    id: "double-frame",
    label: "Bingkai Ganda",
    description: "Garis bingkai rangkap tipis mengikuti bentuk foto.",
  },
  {
    id: "floral-corner",
    label: "Daun & Bunga",
    description: "Ornamen ranting daun & kelopak halus di sudut bingkai.",
  },
  {
    id: "soft-glow",
    label: "Pendar & Bintang",
    description: "Cahaya lembut di belakang foto dengan aksen bintang kecil.",
  },
];

export const COLOR_FIELD_META: ReadonlyArray<{
  key: keyof ThemeColors;
  label: string;
  hint: string;
}> = [
  { key: "primary", label: "Warna Utama", hint: "Tombol & garis bingkai" },
  { key: "secondary", label: "Warna Sekunder", hint: "Latar kartu & section" },
  { key: "background", label: "Warna Latar", hint: "Latar utama halaman" },
  { key: "text", label: "Warna Teks", hint: "Judul & paragraf utama" },
  { key: "accent", label: "Warna Aksen", hint: "Label kecil & angka hitung mundur" },
];

function parseHexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9A-Fa-f]{6})$/.exec(hex.trim());
  if (!match) {
    return null;
  }
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function getRelativeLuminance(hex: string): number | null {
  const rgb = parseHexToRgb(hex);
  if (!rgb) {
    return null;
  }

  const [r, g, b] = rgb.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hexA: string, hexB: string): number | null {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  if (lumA === null || lumB === null) {
    return null;
  }

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastWarning {
  id: string;
  message: string;
  ratio: number;
}

export function getThemeContrastWarnings(
  colors: ThemeColors
): ContrastWarning[] {
  const warnings: ContrastWarning[] = [];

  const textVsBg = getContrastRatio(colors.text, colors.background);
  if (textVsBg !== null && textVsBg < 4.5) {
    warnings.push({
      id: "text-bg",
      ratio: textVsBg,
      message: `Kontras Warna Teks terhadap Warna Latar terlalu rendah (${textVsBg.toFixed(1)}:1, disarankan minimal 4,5:1).`,
    });
  }

  const textVsSecondary = getContrastRatio(colors.text, colors.secondary);
  if (textVsSecondary !== null && textVsSecondary < 4.5) {
    warnings.push({
      id: "text-secondary",
      ratio: textVsSecondary,
      message: `Kontras Warna Teks terhadap Warna Sekunder rendah (${textVsSecondary.toFixed(1)}:1, disarankan minimal 4,5:1).`,
    });
  }

  const primaryVsBg = getContrastRatio(colors.primary, colors.background);
  if (primaryVsBg !== null && primaryVsBg < 2.2) {
    warnings.push({
      id: "primary-bg",
      ratio: primaryVsBg,
      message: `Kontras teks tombol (Warna Latar di atas Warna Utama) rendah (${primaryVsBg.toFixed(1)}:1); gelapkan Warna Utama atau terangkan Warna Latar.`,
    });
  }

  const accentVsBg = getContrastRatio(colors.accent, colors.background);
  if (accentVsBg !== null && accentVsBg < 3) {
    warnings.push({
      id: "accent-bg",
      ratio: accentVsBg,
      message: `Kontras Warna Aksen terhadap Warna Latar rendah (${accentVsBg.toFixed(1)}:1, disarankan minimal 3,0:1).`,
    });
  }

  return warnings;
}

export function detectMatchingPreset(
  colors: ThemeColors
): SiteConfig["theme"]["preset"] {
  const normalized = (hex: string) => hex.trim().toUpperCase();
  for (const preset of THEME_PRESETS) {
    if (
      normalized(preset.colors.primary) === normalized(colors.primary) &&
      normalized(preset.colors.secondary) === normalized(colors.secondary) &&
      normalized(preset.colors.background) === normalized(colors.background) &&
      normalized(preset.colors.text) === normalized(colors.text) &&
      normalized(preset.colors.accent) === normalized(colors.accent)
    ) {
      return preset.id;
    }
  }
  return "custom";
}
