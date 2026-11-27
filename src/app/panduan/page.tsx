import type { Metadata } from "next";
import Link from "next/link";
import { ClientGuide } from "@/components/admin/ClientGuide";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "Panduan Pemilik Undangan | Framea Wedding Invitation",
  description:
    "Langkah singkat mengatur data mempelai, acara, foto, tema, tanda kasih, daftar tamu WhatsApp, RSVP, dan ucapan di dashboard Framea.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientGuidePage() {
  return (
    <div
      className="admin-monochrome flex min-h-dvh w-full flex-col"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <header
        className="border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 16%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="font-heading inline-flex min-h-11 items-center text-base leading-tight font-semibold tracking-tight transition-opacity hover:opacity-75 sm:text-xl"
          >
            Framea Wedding Invitation
          </Link>

          <Link
            href="/login"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 sm:text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            Masuk Pemilik
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            Panduan Pemilik Undangan
          </p>
          <h1 className="font-heading mt-1.5 text-2xl leading-tight font-semibold sm:text-3xl">
            Cara Mengelola &amp; Menyebar Undangan Framea
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-80">
            Simpan halaman ini sebagai rujukan cepat saat mengisi detail acara,
            mengunggah foto atau QRIS, membuat tautan nama tamu WhatsApp, serta
            memantau RSVP.
          </p>
        </div>

        <ClientGuide />
      </main>

      <SiteFooter />
    </div>
  );
}
