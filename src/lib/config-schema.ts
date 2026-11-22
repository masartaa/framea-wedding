import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("https://") ||
      value.startsWith("http://") ||
      value.startsWith("/"),
    "URL harus diawali https://, http://, atau /"
  );

export const themePresetIdSchema = z.enum([
  "putih-emas",
  "sage-green",
  "dusty-rose",
  "navy-gold",
  "terracotta",
  "custom",
]);

export const headingFontSchema = z.enum([
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
  "DM Serif Display",
  "Cinzel",
  "Plus Jakarta Sans",
]);

export const bodyFontSchema = z.enum([
  "Inter",
  "Plus Jakarta Sans",
  "Lato",
  "Source Sans 3",
  "Nunito Sans",
  "Lora",
]);

export const coverLayoutSchema = z.enum(["center", "minimal", "framed"]);
export const heroLayoutSchema = z.enum(["full-photo", "split", "centered"]);

export const sectionIdSchema = z.enum([
  "hero",
  "mempelai",
  "acara",
  "galeri",
  "ucapan",
]);

export const personSchema = z.object({
  nickname: z.string().trim().min(1).max(40),
  fullName: z.string().trim().min(1).max(120),
  fatherName: z.string().trim().max(120),
  motherName: z.string().trim().max(120),
  photoUrl: optionalUrlSchema,
});

export const siteConfigSchema = z.object({
  general: z.object({
    eventTitle: z.string().trim().min(1).max(80),
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    eventTimeStart: z.string().trim().min(1).max(20),
    eventTimeEnd: z.string().trim().min(1).max(20),
    eventTimezone: z.string().trim().min(1).max(10),
    venueName: z.string().trim().min(1).max(120),
    venueAddress: z.string().trim().min(1).max(300),
    mapsUrl: optionalUrlSchema,
    openingText: z.string().trim().max(500),
    closingText: z.string().trim().max(500),
  }),
  couple: z.object({
    introText: z.string().trim().max(300),
    groom: personSchema,
    bride: personSchema,
  }),
  media: z.object({
    heroPhotoUrl: optionalUrlSchema,
    galleryPhotoUrls: z.array(optionalUrlSchema).max(6),
    musicUrl: optionalUrlSchema,
    musicPreset: z.string().trim().max(60),
  }),
  theme: z.object({
    preset: themePresetIdSchema,
    colors: z.object({
      primary: z.string().regex(hexColorRegex, "Format warna hex tidak valid"),
      secondary: z.string().regex(hexColorRegex, "Format warna hex tidak valid"),
      background: z
        .string()
        .regex(hexColorRegex, "Format warna hex tidak valid"),
      text: z.string().regex(hexColorRegex, "Format warna hex tidak valid"),
      accent: z.string().regex(hexColorRegex, "Format warna hex tidak valid"),
    }),
    fonts: z.object({
      heading: headingFontSchema,
      body: bodyFontSchema,
    }),
    layout: z.object({
      cover: coverLayoutSchema,
      hero: heroLayoutSchema,
    }),
    ornaments: z.boolean(),
  }),
  sections: z
    .array(
      z.object({
        id: sectionIdSchema,
        enabled: z.boolean(),
      })
    )
    .min(1),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type ThemeColors = SiteConfig["theme"]["colors"];
export type SectionItem = SiteConfig["sections"][number];

export const SITE_CONFIG_ROW_ID = 1;

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  general: {
    eventTitle: "Resepsi Pernikahan",
    eventDate: "2027-01-03",
    eventTimeStart: "09.00",
    eventTimeEnd: "14.00",
    eventTimezone: "WIB",
    venueName: "Koffie Goen Tuntang",
    venueAddress: "Tuntang, Kabupaten Semarang, Jawa Tengah",
    mapsUrl: "https://maps.google.com/?q=Koffie+Goen+Tuntang",
    openingText:
      "Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara resepsi pernikahan kami.",
    closingText:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih.",
  },
  couple: {
    introText:
      "Segala puji bagi Tuhan yang telah mempertemukan dan mempersatukan kami dalam ikatan suci pernikahan.",
    groom: {
      nickname: "Mempelai Pria",
      fullName: "Nama Lengkap Mempelai Pria",
      fatherName: "Bapak Nama Ayah Pria",
      motherName: "Ibu Nama Ibu Pria",
      photoUrl: "",
    },
    bride: {
      nickname: "Mempelai Wanita",
      fullName: "Nama Lengkap Mempelai Wanita",
      fatherName: "Bapak Nama Ayah Wanita",
      motherName: "Ibu Nama Ibu Wanita",
      photoUrl: "",
    },
  },
  media: {
    heroPhotoUrl: "",
    galleryPhotoUrls: [],
    musicUrl: "",
    musicPreset: "",
  },
  theme: {
    preset: "putih-emas",
    colors: {
      primary: "#C9A24B",
      secondary: "#F5EFE0",
      background: "#FFFFFF",
      text: "#2B2B2B",
      accent: "#B8860B",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
    },
    layout: {
      cover: "center",
      hero: "full-photo",
    },
    ornaments: true,
  },
  sections: [
    { id: "hero", enabled: true },
    { id: "mempelai", enabled: true },
    { id: "acara", enabled: true },
    { id: "galeri", enabled: true },
    { id: "ucapan", enabled: true },
  ],
};
