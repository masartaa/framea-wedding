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
            <p
              className="text-[11px] font-medium tracking-[0.2em] uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Framea Admin
            </p>
            <p className="font-heading text-lg font-semibold">
              Dashboard Undangan
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-text)",
              }}
            >
              Lihat Undangan
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
