import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Framea: Undangan Pernikahan Digital",
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
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="font-heading text-lg font-semibold tracking-tight">
            Framea
          </span>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              color: "var(--color-text)",
            }}
          >
            Masuk Pemilik
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Undangan Pernikahan Digital
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed opacity-80 sm:text-base">
              Untuk membuka undangan, gunakan tautan personal yang dibagikan
              langsung oleh mempelai atau keluarga.
            </p>
          </div>

          <section
            aria-labelledby="panel-pemilik-heading"
            className="rounded-2xl border p-6 md:col-span-5"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            }}
          >
            <h2
              id="panel-pemilik-heading"
              className="font-heading text-lg font-semibold"
            >
              Kelola undangan Anda
            </h2>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Masuk memakai slug dan sandi undangan untuk memperbarui detail
              acara, foto, tema, serta daftar tamu WhatsApp.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              Masuk Pemilik Undangan
            </Link>
          </section>
        </div>
      </main>

      <footer
        className="border-t"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 14%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4 text-xs opacity-75 sm:px-8">
          <span>Framea Wedding Invitation</span>
          <span>Tautan undangan bersifat privat</span>
        </div>
      </footer>
    </div>
  );
}
