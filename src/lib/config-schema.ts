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
  nickname: z
    .string()
    .trim()
    .min(1, "Nama panggilan wajib diisi.")
    .max(40, "Nama panggilan maksimal 40 karakter."),
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi.")
    .max(120, "Nama lengkap maksimal 120 karakter."),
  fatherName: z
    .string()
    .trim()
    .max(120, "Nama ayah maksimal 120 karakter."),
  motherName: z
    .string()
    .trim()
    .max(120, "Nama ibu maksimal 120 karakter."),
  photoUrl: optionalUrlSchema,
});

export const siteConfigSchema = z.object({
  general: z.object({
    eventTitle: z
      .string()
      .trim()
      .min(1, "Judul acara wajib diisi.")
      .max(80, "Judul acara maksimal 80 karakter."),
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
    eventTimeStart: z
      .string()
      .trim()
      .min(1, "Jam mulai wajib diisi.")
      .max(20, "Jam mulai maksimal 20 karakter."),
    eventTimeEnd: z
      .string()
      .trim()
      .min(1, "Jam selesai wajib diisi.")
      .max(20, "Jam selesai maksimal 20 karakter."),
    eventTimezone: z
      .string()
      .trim()
      .min(1, "Zona waktu wajib diisi.")
      .max(10, "Zona waktu maksimal 10 karakter."),
    venueName: z
      .string()
      .trim()
      .min(1, "Nama tempat wajib diisi.")
      .max(120, "Nama tempat maksimal 120 karakter."),
    venueAddress: z
      .string()
      .trim()
      .min(1, "Alamat lengkap wajib diisi.")
      .max(300, "Alamat maksimal 300 karakter."),
    mapsUrl: optionalUrlSchema,
    openingText: z
      .string()
      .trim()
      .max(500, "Kalimat pembuka maksimal 500 karakter."),
    closingText: z
      .string()
      .trim()
      .max(500, "Kalimat penutup maksimal 500 karakter."),
  }),
  couple: z.object({
    introText: z
      .string()
      .trim()
      .max(300, "Teks pengantar mempelai maksimal 300 karakter."),
    groom: personSchema,
    bride: personSchema,
  }),
  media: z.object({
    heroPhotoUrl: optionalUrlSchema,
    galleryPhotoUrls: z
      .array(optionalUrlSchema)
      .max(6, "Galeri maksimal 6 foto."),
    musicUrl: optionalUrlSchema,
    musicPreset: z.string().trim().max(60),
  }),
  theme: z.object({
    preset: themePresetIdSchema,
    colors: z.object({
      primary: z.string().regex(hexColorRegex, "Format warna hex tidak valid."),
      secondary: z
        .string()
        .regex(hexColorRegex, "Format warna hex tidak valid."),
      background: z
        .string()
        .regex(hexColorRegex, "Format warna hex tidak valid."),
      text: z.string().regex(hexColorRegex, "Format warna hex tidak valid."),
      accent: z.string().regex(hexColorRegex, "Format warna hex tidak valid."),
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
    .min(1, "Minimal harus ada 1 section.")
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      "Urutan section tidak boleh memiliki ID duplikat."
    )
    .refine(
      (items) => items.some((item) => item.enabled),
      "Minimal 1 section harus dalam keadaan aktif."
    ),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type ThemeColors = SiteConfig["theme"]["colors"];
export type SectionItem = SiteConfig["sections"][number];
export type SectionId = SectionItem["id"];

export const SECTION_LABELS: Record<
  SectionId,
  { label: string; description: string }
> = {
  hero: {
    label: "Hero & Hitung Mundur",
    description: "Foto utama, nama panggilan mempelai, kalimat pembuka, dan hitung mundur.",
  },
  mempelai: {
    label: "Profil Mempelai",
    description: "Teks pengantar, foto, nama lengkap, dan nama orang tua kedua mempelai.",
  },
  acara: {
    label: "Detail Acara & Peta",
    description: "Hari, tanggal, jam, lokasi resepsi, alamat, dan tombol Google Maps.",
  },
  galeri: {
    label: "Galeri Foto",
    description: "Koleksi maksimal 6 foto dengan tampilan lightbox.",
  },
  ucapan: {
    label: "Ucapan Tamu",
    description: "Kolom doa dan daftar ucapan dari tamu undangan.",
  },
};

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
