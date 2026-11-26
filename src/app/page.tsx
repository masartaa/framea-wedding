import type { Metadata } from "next";
import Link from "next/link";
import {
  BotanicalCorner,
  BotanicalSprig,
  EnvelopeSealIllustration,
} from "@/components/landing/EditorialArtwork";
import { LandingShowcase } from "@/components/landing/LandingShowcase";

export const metadata: Metadata = {
  title: "Framea Wedding Invitation",
  description:
    "Platform undangan pernikahan digital yang ringan, modern, dan personal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FrameaLandingPage() {
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
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="font-heading inline-flex min-h-11 items-center text-base leading-tight font-semibold tracking-tight transition-opacity hover:opacity-75 sm:text-xl"
          >
            Framea Wedding Invitation
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 32%, transparent)",
              color: "var(--color-text)",
            }}
          >
            Masuk Pemilik
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-5 py-8 sm:gap-12 sm:px-8 sm:py-12 lg:py-16">
        <section
          aria-labelledby="hero-framea-title"
          className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10"
        >
          <div className="md:col-span-7">
            <BotanicalSprig
              className="mb-3 h-7 w-32 opacity-75"
            />

            <h1
              id="hero-framea-title"
              className="font-heading text-[clamp(2.25rem,5vw,3.65rem)] leading-[1.08] font-semibold tracking-tight"
            >
              Undangan Pernikahan Digital
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-80 sm:text-base">
              Dirancang ringkas agar nyaman dibuka tamu dari WhatsApp di layar
              ponsel, dengan tautan personal untuk setiap pasangan.
            </p>

            <div
              className="mt-7 grid grid-cols-1 gap-5 border-t pt-6 sm:grid-cols-2"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 18%, transparent)",
              }}
            >
              <div>
                <h2 className="text-sm font-semibold">Untuk Tamu Undangan</h2>
                <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                  Buka tautan personal yang dibagikan oleh mempelai atau
                  keluarga. Setiap undangan memiliki alamat tersendiri dan tidak
                  ditampilkan di daftar publik.
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold">Untuk Pemilik Undangan</h2>
                <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                  Atur rangkaian acara, potong foto hero dan galeri, sesuaikan
                  palet warna, serta buat pesan WhatsApp tamu dari satu panel.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center overflow-hidden p-2 md:col-span-5 md:justify-end">
            <BotanicalCorner className="pointer-events-none absolute top-0 left-0 h-20 w-20 opacity-45" />
            <BotanicalCorner className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rotate-180 opacity-45" />
            <div className="relative z-10 w-full">
              <LandingShowcase />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="panel-pemilik-heading"
          className="relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
        >
          <BotanicalCorner className="pointer-events-none absolute -top-3 -right-3 h-24 w-24 rotate-90 opacity-20" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div
                className="hidden shrink-0 sm:block"
                style={{ color: "var(--color-on-primary-muted)" }}
              >
                <EnvelopeSealIllustration className="h-20 w-28" />
              </div>

              <div className="max-w-lg">
                <h2
                  id="panel-pemilik-heading"
                  className="font-heading text-2xl leading-tight font-semibold"
                >
                  Kelola undangan Anda
                </h2>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--color-on-primary-muted)" }}
                >
                  Masuk menggunakan slug dan sandi undangan untuk memperbarui
                  teks, foto, tema, dan daftar tamu kapan saja.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-85 focus-visible:outline-[var(--color-on-primary)]"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-primary)",
              }}
            >
              Masuk Pemilik Undangan
            </Link>
          </div>
        </section>
      </main>

      <footer
        className="border-t"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 14%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-xs opacity-75 sm:px-8">
          <span>Framea Wedding Invitation</span>
          <span>Tautan undangan bersifat privat</span>
        </div>
      </footer>
    </div>
  );
}
