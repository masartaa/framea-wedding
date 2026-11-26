import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const isSuperAdmin = session.role === "superadmin";
  const publicPreviewHref =
    session.role === "couple" ? `/${session.slug}` : "/";
  const logoutRedirectTo =
    session.role === "couple"
      ? `/login?slug=${encodeURIComponent(session.slug)}`
      : "/admin/login";

  return (
    <div
      className="min-h-dvh w-full"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
        color: "var(--color-text)",
      }}
    >
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 35%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-semibold">Framea Admin</p>
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--color-accent)",
                }}
              >
                {isSuperAdmin ? "Super Admin" : `/${session.slug}`}
              </span>
            </div>
          </div>

          <nav
            aria-label="Navigasi admin"
            className="flex flex-wrap items-center gap-2"
          >
            {isSuperAdmin ? (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                }}
              >
                Daftar Undangan
              </Link>
            ) : null}

            <Link
              href={publicPreviewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-opacity hover:opacity-85 active:opacity-75"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-text)",
              }}
            >
              {session.role === "couple" ? "Lihat Undangan" : "Beranda"}
            </Link>
            <LogoutButton redirectTo={logoutRedirectTo} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
