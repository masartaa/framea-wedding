"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import {
  DEFAULT_GUEST_LABEL,
  formatEventDateShort,
  getInitials,
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
  const heroPhoto = config.media.heroPhotoUrl.trim();
  const groomNick = config.couple.groom.nickname;
  const brideNick = config.couple.bride.nickname;

  const positionClass = previewMode
    ? "relative min-h-[640px] w-full"
    : `fixed inset-0 z-50 cover-curtain ${
        isOpened ? "cover-curtain-opened" : "translate-y-0 opacity-100"
      }`;

  const openButton = (
    <button
      type="button"
      onClick={onOpen}
      disabled={!previewMode && isOpened}
      className="mt-7 inline-flex min-h-11 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
  );

  // Variasi 5: Foto Penuh (Full-Bleed Backdrop)
  if (layout === "full-bleed") {
    return (
      <section
        aria-label="Sampul Undangan"
        aria-hidden={!previewMode && isOpened}
        className={`flex flex-col justify-end overflow-y-auto px-5 py-10 ${positionClass}`}
        style={{
          backgroundColor: "var(--color-background)",
          backgroundImage: heroPhoto
            ? undefined
            : "linear-gradient(180deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-primary) 22%, var(--color-background)) 48%, var(--color-background) 100%)",
        }}
      >
        {heroPhoto ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Image
              src={heroPhoto}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-background) 12%, transparent) 0%, color-mix(in srgb, var(--color-background) 70%, transparent) 52%, var(--color-background) 82%)",
              }}
            />
          </div>
        ) : null}

        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-sm flex-col items-center pt-32 text-center">
          <p
            className="text-xs font-medium tracking-[0.22em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Undangan Pernikahan
          </p>

          <h1 className="font-heading mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            <span>{groomNick}</span>
            <span
              className="mx-2 inline-block font-normal"
              style={{ color: "var(--color-primary)" }}
            >
              &amp;
            </span>
            <span>{brideNick}</span>
          </h1>

          <p className="mt-2 text-sm tracking-wide opacity-85">
            {formattedDate}
          </p>

          <Ornament enabled={config.theme.ornaments} className="my-4" />

          <div
            className="w-full rounded-2xl border px-5 py-4 shadow-sm"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-background) 90%, var(--color-secondary))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            <p className="text-xs tracking-wider uppercase opacity-70">
              Kepada Yth.
            </p>
            <p className="mt-1.5 text-base font-medium break-words">
              {guestName}
            </p>
          </div>

          {openButton}

          <p className="mt-4 text-xs opacity-70">
            Mohon maaf apabila ada kesalahan penulisan nama atau gelar
          </p>
        </div>
      </section>
    );
  }

  // Variasi 4: Kubah Foto (Arch Photo)
  if (layout === "arch-photo") {
    return (
      <section
        aria-label="Sampul Undangan"
        aria-hidden={!previewMode && isOpened}
        className={`flex items-center justify-center overflow-y-auto px-5 py-10 ${positionClass}`}
        style={{
          backgroundColor: "var(--color-background)",
          backgroundImage:
            "radial-gradient(circle at top, color-mix(in srgb, var(--color-secondary) 85%, transparent), transparent 70%)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-sm flex-col items-center rounded-3xl border px-6 py-8 text-center shadow-sm"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary) 60%, var(--color-background))",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 45%, transparent)",
          }}
        >
          <p
            className="text-xs font-medium tracking-[0.22em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Undangan Pernikahan
          </p>

          <div
            className="relative mt-5 aspect-[3/4] w-40 overflow-hidden rounded-t-full rounded-b-xl border-2 shadow-sm"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor: "var(--color-primary)",
            }}
          >
            {heroPhoto ? (
              <Image
                src={heroPhoto}
                alt={`Foto ${groomNick} dan ${brideNick}`}
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span
                  className="font-heading text-3xl font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {getInitials(groomNick)} &amp; {getInitials(brideNick)}
                </span>
              </div>
            )}
          </div>

          <h1 className="font-heading mt-5 text-3xl leading-tight font-semibold tracking-tight">
            <span>{groomNick}</span>
            <span
              className="mx-2 inline-block font-normal"
              style={{ color: "var(--color-primary)" }}
            >
              &amp;
            </span>
            <span>{brideNick}</span>
          </h1>

          <p className="mt-2 text-sm tracking-wide opacity-80">
            {formattedDate}
          </p>

          <Ornament enabled={config.theme.ornaments} className="my-4" />

          <div
            className="w-full rounded-2xl border px-5 py-3.5"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            <p className="text-xs tracking-wider uppercase opacity-70">
              Kepada Yth.
            </p>
            <p className="mt-1 text-base font-medium break-words">
              {guestName}
            </p>
          </div>

          {openButton}

          <p className="mt-4 text-xs opacity-65">
            Mohon maaf apabila ada kesalahan penulisan nama atau gelar
          </p>
        </div>
      </section>
    );
  }

  // Variasi 1 (center), 2 (minimal), dan 3 (framed)
  const isMinimal = layout === "minimal";
  const isFramed = layout === "framed";

  const cardClass = isFramed
    ? "relative border-2 px-7 py-11 shadow-md"
    : isMinimal
      ? "px-4 py-10"
      : "border px-6 py-10 shadow-sm";

  return (
    <section
      aria-label="Sampul Undangan"
      aria-hidden={!previewMode && isOpened}
      className={`flex items-center justify-center overflow-y-auto px-5 py-10 ${positionClass}`}
      style={{
        backgroundColor: "var(--color-background)",
        backgroundImage: isMinimal
          ? "none"
          : "radial-gradient(circle at top, color-mix(in srgb, var(--color-secondary) 85%, transparent), transparent 65%)",
      }}
    >
      <div
        className={`mx-auto flex w-full max-w-sm flex-col items-center rounded-3xl text-center ${cardClass}`}
        style={{
          backgroundColor: isMinimal
            ? "transparent"
            : "color-mix(in srgb, var(--color-secondary) 75%, var(--color-background))",
          borderColor: isMinimal
            ? "transparent"
            : isFramed
              ? "var(--color-primary)"
              : "color-mix(in srgb, var(--color-primary) 55%, transparent)",
        }}
      >
        {isFramed ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 rounded-[1.2rem] border"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          />
        ) : null}

        {isMinimal ? (
          <span
            aria-hidden="true"
            className="mb-5 h-10 w-px opacity-70"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
        ) : null}

        <p
          className="text-xs font-medium tracking-[0.22em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Undangan Pernikahan
        </p>

        <Ornament enabled={config.theme.ornaments} className="my-4" />

        <h1
          className={`font-heading leading-tight font-semibold tracking-tight ${
            isMinimal ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
          }`}
        >
          <span>{groomNick}</span>
          <span
            className="mx-2 inline-block font-normal"
            style={{ color: "var(--color-primary)" }}
          >
            &amp;
          </span>
          <span>{brideNick}</span>
        </h1>

        <p className="mt-3 text-sm tracking-wide opacity-80">{formattedDate}</p>

        <div
          className={`mt-8 w-full px-5 py-4 ${
            isMinimal ? "border-y" : "rounded-2xl border"
          }`}
          style={{
            backgroundColor: isMinimal
              ? "transparent"
              : "var(--color-background)",
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

        {openButton}

        <p className="mt-4 text-xs opacity-65">
          Mohon maaf apabila ada kesalahan penulisan nama atau gelar
        </p>
      </div>
    </section>
  );
}
