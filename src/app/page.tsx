import type { CSSProperties } from "react";
import { getSiteConfig } from "@/lib/site-config";
import type { ThemeColors } from "@/lib/config-schema";

function formatEventDateId(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function createThemeVariables(colors: ThemeColors): CSSProperties {
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-background": colors.background,
    "--color-text": colors.text,
    "--color-accent": colors.accent,
  } as CSSProperties;
}

export default async function HomePage() {
  const { config, source } = await getSiteConfig();
  const formattedDate = formatEventDateId(config.general.eventDate);
  const activeSectionsCount = config.sections.filter((s) => s.enabled).length;

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center"
      style={{
        ...createThemeVariables(config.theme.colors),
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <div
        className="w-full rounded-2xl border px-6 py-8 shadow-sm"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor: "var(--color-primary)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Framea Wedding Invitation
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {config.couple.groom.nickname} &amp; {config.couple.bride.nickname}
        </h1>

        <p className="mt-1 text-sm opacity-80">{config.general.eventTitle}</p>

        <dl
          className="mt-6 space-y-2 border-t pt-5 text-left text-sm"
          style={{ borderColor: "var(--color-primary)" }}
        >
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Tanggal</dt>
            <dd className="text-right font-medium">{formattedDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Waktu</dt>
            <dd className="text-right font-medium">
              {config.general.eventTimeStart}–{config.general.eventTimeEnd}{" "}
              {config.general.eventTimezone}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Tempat</dt>
            <dd className="text-right font-medium">
              {config.general.venueName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Tema</dt>
            <dd className="text-right font-medium">{config.theme.preset}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Section aktif</dt>
            <dd className="text-right font-medium">
              {activeSectionsCount} dari {config.sections.length}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Sumber config</dt>
            <dd
              className="text-right font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {source === "database"
                ? "Database Neon"
                : "Default (DB belum terhubung)"}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
