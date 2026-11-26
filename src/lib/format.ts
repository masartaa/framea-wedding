import type { CSSProperties } from "react";
import type { EventItem, SiteConfig } from "@/lib/config-schema";
import {
  BODY_FONT_CSS_MAP,
  HEADING_FONT_CSS_MAP,
} from "@/lib/font-variables";

export function getInvitationEvents(config: SiteConfig): EventItem[] {
  if (Array.isArray(config.events) && config.events.length > 0) {
    return config.events;
  }

  return [
    {
      id: "acara-utama",
      title: config.general.eventTitle,
      date: config.general.eventDate,
      timeStart: config.general.eventTimeStart,
      timeEnd: config.general.eventTimeEnd,
      timezone: config.general.eventTimezone,
      venueName: config.general.venueName,
      venueAddress: config.general.venueAddress,
      mapsUrl: config.general.mapsUrl,
      isPrimary: true,
    },
  ];
}

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

export function createThemeVariables(
  theme: SiteConfig["theme"]
): CSSProperties {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-background": theme.colors.background,
    "--color-text": theme.colors.text,
    "--color-accent": theme.colors.accent,
    "--font-heading": HEADING_FONT_CSS_MAP[theme.fonts.heading],
    "--font-body": BODY_FONT_CSS_MAP[theme.fonts.body],
  } as CSSProperties;
}

export function isSafeExternalUrl(url: string): boolean {
  if (!url || url.length > 2048) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeInstagramHandle(raw: string): string {
  let value = raw.trim();
  if (!value) {
    return "";
  }

  value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  value = value.replace(/^(www\.)?instagram\.com\//i, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/^@+/, "").trim();

  if (!/^[A-Za-z0-9._]{1,30}$/.test(value)) {
    return "";
  }

  return value;
}
