import type { Metadata } from "next";
import { DemoInvitationExperience } from "@/components/invitation/DemoInvitationExperience";

export const metadata: Metadata = {
  title: "Contoh Undangan Pernikahan Digital | Framea",
  description:
    "Coba langsung contoh undangan pernikahan digital Framea dengan 5 pilihan preset warna, sampul personal, rangkaian acara, musik latar, simulasi RSVP, dan ucapan tamu.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Contoh Undangan Pernikahan Digital | Framea",
    description:
      "Rasakan langsung tampilan undangan pernikahan digital Framea di HP Anda, lengkap dengan ganti tema, hitung mundur, Google Maps, RSVP, dan ucapan.",
    type: "website",
    locale: "id_ID",
  },
};

export default function DemoInvitationPage() {
  return <DemoInvitationExperience />;
}
