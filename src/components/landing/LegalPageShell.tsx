import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { CONTACT_INFO } from "@/lib/marketing";

interface LegalPageShellProps {
  categoryLabel: string;
  title: string;
  updatedDate: string;
  summary: string;
  children: ReactNode;
}

export function LegalPageShell({
  categoryLabel,
  title,
  updatedDate,
  summary,
  children,
}: LegalPageShellProps) {
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
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="font-heading inline-flex min-h-11 items-center text-base leading-tight font-semibold tracking-tight transition-opacity hover:opacity-75 sm:text-xl"
          >
            {CONTACT_INFO.brandName}
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 sm:text-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 34%, transparent)",
              color: "var(--color-text)",
            }}
          >
            ← Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div
          className="border-b pb-6"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 18%, transparent)",
          }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            {categoryLabel}
          </p>
          <h1 className="font-heading mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed opacity-80">{summary}</p>
          <p className="mt-3 text-xs opacity-75">
            Terakhir diperbarui: {updatedDate}
          </p>
        </div>

        <article className="mt-8 space-y-7 text-sm leading-relaxed">
          {children}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
