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

export const coverLayoutSchema = z.enum([
  "center",
  "minimal",
  "framed",
  "arch-photo",
  "full-bleed",
]);
export const heroLayoutSchema = z.enum(["full-photo", "split", "centered"]);
export const heroShapeSchema = z.enum([
  "rounded",
  "square",
  "arch",
  "oval",
  "circle",
]);
export const heroDecorationSchema = z.enum([
  "none",
  "double-frame",
  "floral-corner",
  "soft-glow",
]);

export const sectionIdSchema = z.enum([
  "hero",
  "mempelai",
  "kisah",
  "acara",
  "galeri",
  "rsvp",
  "ucapan",
]);

export const storyItemSchema = z.object({
  id: z.string().trim().min(1).max(40),
  period: z
    .string()
    .trim()
    .min(1, "Periode atau tahun wajib diisi.")
    .max(40, "Periode maksimal 40 karakter."),
  title: z
    .string()
    .trim()
    .min(1, "Judul momen wajib diisi.")
    .max(80, "Judul momen maksimal 80 karakter."),
  description: z
    .string()
    .trim()
    .min(1, "Cerita momen wajib diisi.")
    .max(400, "Cerita momen maksimal 400 karakter."),
});

export const DEFAULT_STORY_CONFIG = {
  title: "Kisah Kami",
  introText:
    "Setiap langkah dan pertemuan sederhana menjadi awal dari perjalanan panjang menuju hari bahagia kami.",
  items: [
    {
      id: "kisah-1",
      period: "Tahap 1",
      title: "Awal Pertemuan",
      description:
        "Ceritakan secara singkat bagaimana kalian pertama kali bertemu dan saling mengenal.",
    },
    {
      id: "kisah-2",
      period: "Tahap 2",
      title: "Menjalani Bersama",
      description:
        "Bagikan momen penting yang membuat kalian semakin yakin untuk melangkah bersama.",
    },
    {
      id: "kisah-3",
      period: "Tahap 3",
      title: "Menuju Pernikahan",
      description:
        "Dengan doa restu kedua keluarga, kami memantapkan hati menuju ikatan pernikahan.",
    },
  ],
};

export const DEFAULT_RSVP_CONFIG = {
  title: "Konfirmasi Kehadiran",
  introText:
    "Mohon konfirmasi kehadiran Bapak/Ibu/Saudara/i agar kami dapat mempersiapkan penyambutan dengan baik.",
  maxGuests: 5,
};

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

export const eventItemSchema = z.object({
  id: z.string().trim().min(1).max(40),
  title: z
    .string()
    .trim()
    .min(1, "Nama acara wajib diisi.")
    .max(80, "Nama acara maksimal 80 karakter."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
  timeStart: z
    .string()
    .trim()
    .min(1, "Jam mulai wajib diisi.")
    .max(20, "Jam mulai maksimal 20 karakter."),
  timeEnd: z
    .string()
    .trim()
    .min(1, "Jam selesai wajib diisi.")
    .max(20, "Jam selesai maksimal 20 karakter."),
  timezone: z
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
  isPrimary: z.boolean().optional().default(false),
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
  events: z
    .array(eventItemSchema)
    .max(6, "Maksimal 6 rangkaian acara.")
    .optional()
    .default([]),
  couple: z.object({
    introText: z
      .string()
      .trim()
      .max(300, "Teks pengantar mempelai maksimal 300 karakter."),
    groom: personSchema,
    bride: personSchema,
  }),
  story: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Judul kisah wajib diisi.")
        .max(80, "Judul kisah maksimal 80 karakter."),
      introText: z
        .string()
        .trim()
        .max(300, "Teks pengantar kisah maksimal 300 karakter."),
      items: z
        .array(storyItemSchema)
        .max(8, "Maksimal 8 momen kisah."),
    })
    .optional()
    .default(DEFAULT_STORY_CONFIG),
  rsvp: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Judul RSVP wajib diisi.")
        .max(80, "Judul RSVP maksimal 80 karakter."),
      introText: z
        .string()
        .trim()
        .max(300, "Teks pengantar RSVP maksimal 300 karakter."),
      maxGuests: z
        .number()
        .int("Batas tamu harus berupa angka bulat.")
        .min(1, "Minimal 1 tamu.")
        .max(400, "Maksimal 400 tamu per konfirmasi."),
    })
    .optional()
    .default(DEFAULT_RSVP_CONFIG),
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
      heroShape: heroShapeSchema.optional().default("rounded"),
      heroDecoration: heroDecorationSchema.optional().default("floral-corner"),
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
export type EventItem = z.infer<typeof eventItemSchema>;
export type StoryItem = z.infer<typeof storyItemSchema>;
export type ThemeColors = SiteConfig["theme"]["colors"];
export type SectionItem = SiteConfig["sections"][number];
export type SectionId = SectionItem["id"];

export const ALL_SECTION_IDS: ReadonlyArray<SectionId> = [
  "hero",
  "mempelai",
  "kisah",
  "acara",
  "galeri",
  "rsvp",
  "ucapan",
];

export function ensureAllSections(sections: SectionItem[]): SectionItem[] {
  const existingIds = new Set(sections.map((item) => item.id));
  const result = [...sections];

  for (const sectionId of ALL_SECTION_IDS) {
    if (!existingIds.has(sectionId)) {
      result.push({ id: sectionId, enabled: true });
    }
  }

  return result;
}

export function getInvitationEvents(config: SiteConfig): EventItem[] {
  if (Array.isArray(config.events) && config.events.length > 0) {
    return config.events;
  }

  return [
    {
      id: "acara-utama",
      title: config.general.eventTitle,
      date: config.general.eventDate,
      timeStart: config.general.eventTimeStart,
      timeEnd: config.general.eventTimeEnd,
      timezone: config.general.eventTimezone,
      venueName: config.general.venueName,
      venueAddress: config.general.venueAddress,
      mapsUrl: config.general.mapsUrl,
      isPrimary: true,
    },
  ];
}

export function syncPrimaryEventToGeneral(
  events: EventItem[],
  general: SiteConfig["general"]
): SiteConfig["general"] {
  const primary = events.find((item) => item.isPrimary) ?? events[0];
  if (!primary) {
    return general;
  }

  return {
    ...general,
    eventTitle: primary.title,
    eventDate: primary.date,
    eventTimeStart: primary.timeStart,
    eventTimeEnd: primary.timeEnd,
    eventTimezone: primary.timezone,
    venueName: primary.venueName,
    venueAddress: primary.venueAddress,
    mapsUrl: primary.mapsUrl,
  };
}

export const SECTION_LABELS: Record<
  SectionId,
  { label: string; description: string }
> = {
  hero: {
    label: "Hero & Hitung Mundur",
    description:
      "Foto utama, nama panggilan mempelai, kalimat pembuka, dan hitung mundur.",
  },
  mempelai: {
    label: "Profil Mempelai",
    description:
      "Teks pengantar, foto, nama lengkap, dan nama orang tua kedua mempelai.",
  },
  kisah: {
    label: "Our Story (Kisah Kami)",
    description:
      "Runtutan perjalanan kisah calon pengantin dalam format linimasa.",
  },
  acara: {
    label: "Detail Acara & Peta",
    description:
      "Rangkaian acara (Akad, Resepsi, Ngunduh Mantu), tanggal, jam, lokasi, dan Google Maps.",
  },
  galeri: {
    label: "Galeri Slideshow",
    description: "Koleksi maksimal 6 foto dalam slideshow interaktif dan lightbox.",
  },
  rsvp: {
    label: "Konfirmasi Kehadiran (RSVP)",
    description:
      "Formulir konfirmasi kehadiran tamu beserta perkiraan jumlah tamu yang hadir.",
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
  events: [
    {
      id: "resepsi-utama",
      title: "Resepsi Pernikahan",
      date: "2027-01-03",
      timeStart: "09.00",
      timeEnd: "14.00",
      timezone: "WIB",
      venueName: "Koffie Goen Tuntang",
      venueAddress: "Tuntang, Kabupaten Semarang, Jawa Tengah",
      mapsUrl: "https://maps.google.com/?q=Koffie+Goen+Tuntang",
      isPrimary: true,
    },
  ],
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
  story: DEFAULT_STORY_CONFIG,
  rsvp: DEFAULT_RSVP_CONFIG,
  media: {
    heroPhotoUrl: "",
    galleryPhotoUrls: [],
    musicUrl: "",
    musicPreset: "",
  },
  theme: {
    preset: "putih-emas",
    colors: {
      primary: "#856217",
      secondary: "#F5EFE0",
      background: "#FFFFFF",
      text: "#2B2B2B",
      accent: "#735310",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
    },
    layout: {
      cover: "center",
      hero: "full-photo",
      heroShape: "rounded",
      heroDecoration: "floral-corner",
    },
    ornaments: true,
  },
  sections: [
    { id: "hero", enabled: true },
    { id: "mempelai", enabled: true },
    { id: "kisah", enabled: true },
    { id: "acara", enabled: true },
    { id: "galeri", enabled: true },
    { id: "rsvp", enabled: true },
    { id: "ucapan", enabled: true },
  ],
};
