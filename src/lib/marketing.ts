import type { SiteConfig } from "@/lib/config-schema";
import { THEME_PRESETS } from "@/lib/theme-presets";

const DEFAULT_ORDER_WHATSAPP = "6281215526343";
const DEFAULT_SITE_ORIGIN = "https://frameainvitation.my.id";

function normalizeSiteOrigin(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return DEFAULT_SITE_ORIGIN;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return DEFAULT_SITE_ORIGIN;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export const SITE_ORIGIN = normalizeSiteOrigin(
  process.env.NEXT_PUBLIC_SITE_URL
);

function normalizeWhatsAppNumber(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) {
    return DEFAULT_ORDER_WHATSAPP;
  }
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

export const ORDER_WHATSAPP_NUMBER = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_ORDER_WHATSAPP
);

export const CONTACT_INFO = {
  brandName: "Framea Wedding Invitation",
  email: "frameavisual.id@gmail.com",
  whatsappDisplay: "0812-1552-6343",
  country: "Indonesia",
} as const;

export const PACKAGE_PRICING = {
  originalFormatted: "Rp100.000",
  promoFormatted: "Rp67.000",
  savingsFormatted: "Rp33.000",
} as const;

export function buildWhatsAppOrderUrl(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encoded}`;
}

export const DEMO_INVITATION_CONFIG: SiteConfig = {
  general: {
    eventTitle: "Resepsi Pernikahan",
    eventDate: "2027-01-17",
    eventTimeStart: "11.00",
    eventTimeEnd: "14.00",
    eventTimezone: "WIB",
    venueName: "Pendopo Taman Contoh",
    venueAddress: "Jl. Contoh Acara No. 12, Semarang, Jawa Tengah",
    mapsUrl: "https://maps.google.com/?q=Semarang+Jawa+Tengah",
    openingText:
      "Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.",
    closingText:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih.",
  },
  events: [
    {
      id: "contoh-akad",
      title: "Akad Nikah",
      date: "2027-01-17",
      timeStart: "08.00",
      timeEnd: "09.30",
      timezone: "WIB",
      venueName: "Pendopo Taman Contoh",
      venueAddress: "Jl. Contoh Acara No. 12, Semarang, Jawa Tengah",
      mapsUrl: "https://maps.google.com/?q=Semarang+Jawa+Tengah",
      isPrimary: false,
    },
    {
      id: "contoh-resepsi",
      title: "Resepsi Pernikahan",
      date: "2027-01-17",
      timeStart: "11.00",
      timeEnd: "14.00",
      timezone: "WIB",
      venueName: "Pendopo Taman Contoh",
      venueAddress: "Jl. Contoh Acara No. 12, Semarang, Jawa Tengah",
      mapsUrl: "https://maps.google.com/?q=Semarang+Jawa+Tengah",
      isPrimary: true,
    },
  ],
  couple: {
    introText:
      "Segala puji bagi Tuhan yang telah mempertemukan dan mempersatukan kami dalam ikatan suci pernikahan. (Data contoh)",
    groom: {
      nickname: "Raka",
      fullName: "Raka Pratama (Contoh)",
      fatherName: "Bapak Hendra Wijaya",
      motherName: "Ibu Sri Rahayu",
      photoUrl: "",
      showInstagram: false,
      instagram: "",
    },
    bride: {
      nickname: "Nadya",
      fullName: "Nadya Lestari (Contoh)",
      fatherName: "Bapak Bambang Santoso",
      motherName: "Ibu Ratna Dewi",
      photoUrl: "",
      showInstagram: false,
      instagram: "",
    },
  },
  story: {
    title: "Kisah Kami",
    introText:
      "Runtutan singkat perjalanan kami menuju hari bahagia. (Contoh konten linimasa)",
    items: [
      {
        id: "contoh-kisah-1",
        period: "2022",
        title: "Awal Pertemuan",
        description:
          "Pertemuan sederhana di sebuah kegiatan komunitas membawa obrolan panjang yang tidak terasa waktunya.",
        photoUrl: "",
      },
      {
        id: "contoh-kisah-2",
        period: "2024",
        title: "Menjalani Bersama",
        description:
          "Kami belajar saling mendengarkan, mendukung rencana masing-masing, dan mulai mengenalkan kedua keluarga.",
        photoUrl: "",
      },
      {
        id: "contoh-kisah-3",
        period: "2026",
        title: "Menuju Pernikahan",
        description:
          "Dengan doa restu orang tua dan keluarga besar, kami memantapkan langkah menuju hari pernikahan.",
        photoUrl: "",
      },
    ],
  },
  rsvp: {
    title: "Konfirmasi Kehadiran",
    introText:
      "Coba kirim konfirmasi kehadiran di formulir ini. Data pada halaman contoh hanya tampil sebagai simulasi di browser Anda.",
    maxGuests: 5,
  },
  gift: {
    title: "Tanda Kasih",
    introText:
      "Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah bagi kami. Namun jika berkenan memberikan tanda kasih, dapat melalui rekening atau alamat contoh di bawah ini.",
    buttonLabel: "Kirim Tanda Kasih",
    accounts: [
      {
        id: "contoh-bca",
        bankName: "Bank BCA (Contoh)",
        accountNumber: "1234567890",
        accountHolder: "Raka Pratama (Contoh)",
      },
      {
        id: "contoh-ewallet",
        bankName: "GoPay / DANA (Contoh)",
        accountNumber: "081200000000",
        accountHolder: "Nadya Lestari (Contoh)",
      },
    ],
    qris: {
      imageUrl: "",
      label: "",
    },
    shipping: {
      recipientName: "Raka & Nadya (Contoh)",
      phone: "0812-0000-0000",
      address: "Jl. Contoh Pengiriman Kado No. 12, Semarang, Jawa Tengah",
      note: "Data alamat ini hanya contoh tampilan fitur kirim kado.",
    },
  },
  media: {
    heroPhotoUrl: "",
    galleryPhotoUrls: [],
    musicUrl: "",
    musicPreset: "piano-lembut",
  },
  theme: {
    preset: "putih-emas",
    colors: { ...THEME_PRESETS[0].colors },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
    },
    layout: {
      cover: "arch-photo",
      hero: "full-photo",
      heroShape: "arch",
      heroDecoration: "floral-corner",
      galleryTransition: "fade",
      backgroundPattern: "botanical-corners",
    },
    ornaments: true,
  },
  sections: [
    { id: "hero", enabled: true },
    { id: "mempelai", enabled: true },
    { id: "kisah", enabled: true },
    { id: "acara", enabled: true },
    { id: "galeri", enabled: true },
    { id: "hadiah", enabled: true },
    { id: "rsvp", enabled: true },
    { id: "ucapan", enabled: true },
  ],
};
