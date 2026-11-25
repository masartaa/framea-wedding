import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession, isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
        color: "var(--color-text)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl border px-6 py-8 shadow-sm"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="text-center">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Framea Super Admin
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">
            Masuk Super Admin
          </h1>
          <p className="mt-1.5 text-sm opacity-75">
            Khusus pengelola utama untuk membuat dan mengatur seluruh undangan.
          </p>
        </div>

        {!configured ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border px-4 py-3 text-sm leading-relaxed"
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
            className="inline-flex min-h-11 items-center justify-center px-3 text-sm underline-offset-4 opacity-75 transition-opacity hover:underline hover:opacity-100"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
