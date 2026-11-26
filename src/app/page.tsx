import type { Metadata } from "next";
import Link from "next/link";

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
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200"
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

          <div
            aria-hidden="true"
            className="flex justify-center md:col-span-5 md:justify-end"
          >
            <div
              className="w-full max-w-[300px] rounded-2xl border p-5 sm:p-6"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 16%, transparent)",
              }}
            >
              <div
                className="relative flex aspect-[3/4] flex-col items-center justify-between rounded-t-full rounded-b-xl border px-6 py-8 text-center"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-primary)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-2 rounded-t-full rounded-b-lg border"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 24%, transparent)",
                  }}
                />

                <span
                  className="h-7 w-px"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                  }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-heading text-5xl leading-none font-semibold">
                    F
                  </span>
                  <div
                    className="my-4 h-px w-10"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                    }}
                  />
                  <p className="font-heading text-base leading-snug font-semibold">
                    Framea Wedding Invitation
                  </p>
                  <p className="mt-1 text-xs opacity-75">
                    Undangan Pernikahan Digital
                  </p>
                </div>

                <div className="relative z-10 w-full border-t pt-3 text-[11px] opacity-75"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                  }}
                >
                  Akses Privat via Tautan
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="panel-pemilik-heading"
          className="flex flex-col gap-5 rounded-2xl px-6 py-7 sm:px-8 sm:py-8 md:flex-row md:items-center md:justify-between"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          <div className="max-w-xl">
            <h2
              id="panel-pemilik-heading"
              className="font-heading text-2xl leading-tight font-semibold"
            >
              Kelola undangan Anda
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Masuk menggunakan slug dan sandi undangan untuk memperbarui teks,
              foto, tema, dan daftar tamu kapan saja.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 active:bg-zinc-300 focus-visible:outline-white"
          >
            Masuk Pemilik Undangan
          </Link>
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
