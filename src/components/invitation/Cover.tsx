"use client";

import { useSyncExternalStore } from "react";
import type { SiteConfig } from "@/lib/config-schema";
import {
  DEFAULT_GUEST_LABEL,
  formatEventDateShort,
  sanitizeGuestName,
} from "@/lib/format";
import { Ornament } from "./Ornament";

interface CoverProps {
  config: SiteConfig;
  isOpened: boolean;
  onOpen: () => void;
  previewMode?: boolean;
}

function subscribeToLocation(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getGuestNameFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return sanitizeGuestName(params.get("to"));
}

function getServerGuestName(): string {
  return DEFAULT_GUEST_LABEL;
}

export function Cover({
  config,
  isOpened,
  onOpen,
  previewMode = false,
}: CoverProps) {
  const urlGuestName = useSyncExternalStore(
    subscribeToLocation,
    getGuestNameFromUrl,
    getServerGuestName
  );
  const guestName = previewMode ? "Budi Santoso" : urlGuestName;

  const layout = config.theme.layout.cover;
  const formattedDate = formatEventDateShort(config.general.eventDate);

  const cardClass =
    layout === "framed"
      ? "border-2 px-6 py-10 shadow-md"
      : layout === "minimal"
        ? "px-4 py-8"
        : "border px-6 py-10 shadow-sm";

  const positionClass = previewMode
    ? "relative min-h-[620px] w-full"
    : `fixed inset-0 z-50 cover-curtain ${
        isOpened ? "cover-curtain-opened" : "translate-y-0 opacity-100"
      }`;

  return (
    <section
      aria-label="Sampul Undangan"
      aria-hidden={!previewMode && isOpened}
      className={`flex items-center justify-center overflow-y-auto px-5 py-10 ${positionClass}`}
      style={{
        backgroundColor: "var(--color-background)",
        backgroundImage:
          "radial-gradient(circle at top, color-mix(in srgb, var(--color-secondary) 85%, transparent), transparent 65%)",
      }}
    >
      <div
        className={`mx-auto flex w-full max-w-sm flex-col items-center rounded-3xl text-center ${cardClass}`}
        style={{
          backgroundColor:
            layout === "minimal"
              ? "transparent"
              : "color-mix(in srgb, var(--color-secondary) 75%, var(--color-background))",
          borderColor:
            layout === "minimal"
              ? "transparent"
              : "color-mix(in srgb, var(--color-primary) 55%, transparent)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.22em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Undangan Pernikahan
        </p>

        <Ornament enabled={config.theme.ornaments} className="my-4" />

        <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          <span>{config.couple.groom.nickname}</span>
          <span
            className="mx-2 inline-block font-normal"
            style={{ color: "var(--color-primary)" }}
          >
            &amp;
          </span>
          <span>{config.couple.bride.nickname}</span>
        </h1>

        <p className="mt-3 text-sm tracking-wide opacity-80">{formattedDate}</p>

        <div
          className="mt-8 w-full rounded-2xl border px-5 py-4"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          <p className="text-xs tracking-wider uppercase opacity-70">
            Kepada Yth.
          </p>
          <p className="mt-1.5 text-base font-medium break-words">
            {guestName}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          disabled={!previewMode && isOpened}
          className="mt-8 inline-flex min-h-11 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16v12H4z" />
            <path d="M4 7l8 6 8-6" />
          </svg>
          <span>Buka Undangan</span>
        </button>

        <p className="mt-4 text-xs opacity-65">
          Mohon maaf apabila ada kesalahan penulisan nama atau gelar
        </p>
      </div>
    </section>
  );
}
