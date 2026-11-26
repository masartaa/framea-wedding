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
    <div className="admin-monochrome min-h-dvh">
      <main
        className="flex min-h-dvh w-full items-center justify-center px-5 py-10"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
          color: "var(--color-text)",
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl border px-6 py-8 sm:px-8"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          }}
        >
          <div
            className="border-b pb-5"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 16%, transparent)",
            }}
          >
            <p
              className="text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Framea
            </p>
            <h1 className="font-heading mt-1.5 text-2xl font-semibold">
              Masuk Pemilik Undangan
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed opacity-80">
              Masukkan slug dan sandi undangan Anda untuk mengatur konten, tema,
              foto, dan daftar tamu.
            </p>
          </div>

          <LoginForm mode="couple" />

          <div className="mt-6 text-center">
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
