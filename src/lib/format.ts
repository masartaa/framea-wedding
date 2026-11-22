import type { CSSProperties } from "react";
import type { ThemeColors } from "@/lib/config-schema";

export const DEFAULT_GUEST_LABEL = "Bapak/Ibu/Saudara/i";
export const MAX_GUEST_NAME_LENGTH = 60;

export function sanitizeGuestName(raw: string | null | undefined): string {
  if (!raw) {
    return DEFAULT_GUEST_LABEL;
  }

  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_GUEST_NAME_LENGTH)
    .trim();

  return cleaned.length > 0 ? cleaned : DEFAULT_GUEST_LABEL;
}

export function formatEventDateFull(isoDate: string): string {
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

export function formatEventDateShort(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getEventTargetTimestamp(
  isoDate: string,
  timeStart: string,
  timezone: string
): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return Date.now();
  }

  const timeMatch = timeStart.match(/(\d{1,2})[.:](\d{2})/);
  const hours = timeMatch ? Math.min(23, Number(timeMatch[1])) : 9;
  const minutes = timeMatch ? Math.min(59, Number(timeMatch[2])) : 0;

  const tzUpper = timezone.trim().toUpperCase();
  const offsetHours = tzUpper === "WIT" ? 9 : tzUpper === "WITA" ? 8 : 7;

  return Date.UTC(year, month - 1, day, hours - offsetHours, minutes, 0);
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "F";
  }
  return words[0].charAt(0).toUpperCase();
}

export function createThemeVariables(colors: ThemeColors): CSSProperties {
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-background": colors.background,
    "--color-text": colors.text,
    "--color-accent": colors.accent,
  } as CSSProperties;
}

export function isSafeExternalUrl(url: string): boolean {
  return url.startsWith("https://") || url.startsWith("http://");
}
