import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession, isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk Super Admin | Framea",
  description: "Halaman masuk pengelola utama Framea Wedding Invitation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(session.role === "couple" ? `/admin/${session.slug}` : "/admin");
  }

  const configured = isAuthConfigured();

  return (
    <main
      className="flex min-h-dvh w-full items-center justify-center px-5 py-10"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-t-4 px-6 py-8"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          borderTopColor: "var(--color-primary)",
        }}
      >
        <div>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            Akses Pengelola Utama
          </p>
          <h1 className="font-heading mt-1.5 text-2xl font-semibold">
            Masuk Super Admin
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed opacity-80">
            Kelola seluruh undangan, slug tautan, dan sandi akses klien dari
            satu tempat.
          </p>
        </div>

        {!configured ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border px-4 py-3 text-sm leading-relaxed"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor: "var(--color-primary)",
              color: "var(--color-text)",
            }}
          >
            Variabel lingkungan{" "}
            <code className="font-mono text-xs">ADMIN_PASSWORD</code> dan{" "}
            <code className="font-mono text-xs">SESSION_SECRET</code> belum
            diatur. Silakan atur terlebih dahulu di{" "}
            <code className="font-mono text-xs">.env.local</code> atau Vercel.
          </div>
        ) : null}

        <LoginForm mode="superadmin" />

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
  );
}
