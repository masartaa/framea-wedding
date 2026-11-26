import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk Pemilik Undangan | Framea",
  description: "Halaman masuk untuk mengelola undangan pernikahan Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClientLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(session.role === "couple" ? `/admin/${session.slug}` : "/admin");
  }

  return (
    <div
      className="admin-monochrome grid min-h-dvh w-full grid-cols-1 lg:grid-cols-12"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <aside
        className="flex flex-col justify-between px-6 py-7 sm:px-10 lg:col-span-5 lg:px-12 lg:py-12"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-heading inline-flex min-h-11 items-center text-xl font-semibold tracking-tight text-white transition-opacity hover:opacity-80 focus-visible:outline-white"
          >
            Framea
          </Link>
          <span className="text-xs text-zinc-300">Portal Pemilik</span>
        </div>

        <div className="my-6 lg:my-auto lg:py-10">
          <div
            aria-hidden="true"
            className="mb-8 hidden aspect-[4/3] w-44 items-center justify-center rounded-t-full rounded-b-xl border border-zinc-700 p-2 lg:flex"
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-t-full rounded-b-lg border border-zinc-800 text-center">
              <span className="font-heading text-4xl font-semibold text-white">
                F
              </span>
              <span className="mt-1 text-[11px] text-zinc-300">
                Studio Undangan
              </span>
            </div>
          </div>

          <p className="font-heading text-2xl leading-snug font-semibold text-white sm:text-3xl">
            Atur detail hari bahagia Anda dari satu tempat.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300">
            Perbarui rangkaian acara, unggah foto galeri, pilih tema warna, dan
            kelola daftar tamu WhatsApp secara langsung.
          </p>
        </div>

        <p className="hidden text-xs text-zinc-300 lg:block">
          Akses privat khusus pemilik undangan Framea
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-9 sm:px-8 lg:col-span-7 lg:py-12">
        <div className="w-full max-w-md">
          <div
            className="border-b pb-5"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 16%, transparent)",
            }}
          >
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
              Masuk Pemilik Undangan
            </h1>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Masukkan slug tautan dan sandi yang diberikan untuk mulai mengedit
              undangan Anda.
            </p>
          </div>

          <LoginForm mode="couple" />

          <div
            className="mt-7 border-t pt-5 text-center"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 14%, transparent)",
            }}
          >
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm underline-offset-4 opacity-80 transition-opacity hover:underline hover:opacity-100"
            >
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
