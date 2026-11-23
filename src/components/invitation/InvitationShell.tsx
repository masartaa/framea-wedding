"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SectionItem, SiteConfig } from "@/lib/config-schema";
import {
  createThemeVariables,
  formatEventDateFull,
  formatEventDateShort,
  getEventTargetTimestamp,
  getInitials,
  isSafeExternalUrl,
} from "@/lib/format";
import { Countdown } from "./Countdown";
import { Cover } from "./Cover";
import { GallerySection } from "./GallerySection";
import { MusicPlayer, type MusicPlayerHandle } from "./MusicPlayer";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

interface InvitationShellProps {
  config: SiteConfig;
  previewMode?: boolean;
  previewView?: "cover" | "content";
  onPreviewOpen?: () => void;
}

export function InvitationShell({
  config,
  previewMode = false,
  previewView = "content",
  onPreviewOpen,
}: InvitationShellProps) {
  const [isOpened, setIsOpened] = useState(false);
  const musicPlayerRef = useRef<MusicPlayerHandle | null>(null);

  useEffect(() => {
    if (previewMode) {
      return undefined;
    }

    if (!isOpened) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    return undefined;
  }, [isOpened, previewMode]);

  const handleOpen = () => {
    if (previewMode) {
      onPreviewOpen?.();
      return;
    }
    setIsOpened(true);
    musicPlayerRef.current?.start();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const targetTimestamp = getEventTargetTimestamp(
    config.general.eventDate,
    config.general.eventTimeStart,
    config.general.eventTimezone
  );
  const fullDate = formatEventDateFull(config.general.eventDate);
  const shortDate = formatEventDateShort(config.general.eventDate);
  const enabledSections = config.sections.filter((section) => section.enabled);

  const renderSection = (section: SectionItem) => {
    switch (section.id) {
      case "hero":
        return (
          <HeroSection
            key="hero"
            config={config}
            shortDate={shortDate}
            targetTimestamp={targetTimestamp}
          />
        );
      case "mempelai":
        return <CoupleSection key="mempelai" config={config} />;
      case "acara":
        return (
          <EventSection key="acara" config={config} fullDate={fullDate} />
        );
      case "galeri":
        return (
          <GallerySection
            key="galeri"
            photoUrls={config.media.galleryPhotoUrls}
            ornaments={config.theme.ornaments}
          />
        );
      case "ucapan":
        return (
          <WishesPlaceholderSection
            key="ucapan"
            ornaments={config.theme.ornaments}
          />
        );
    }
  };

  const themeVars = createThemeVariables(config.theme);

  return (
    <div
      className={previewMode ? "w-full" : "min-h-dvh w-full"}
      style={{
        ...themeVars,
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      {previewMode ? (
        previewView === "cover" ? (
          <Cover
            config={config}
            isOpened={false}
            onOpen={handleOpen}
            previewMode
          />
        ) : (
          <div
            className="mx-auto w-full max-w-lg shadow-sm"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            {enabledSections.map((section) => renderSection(section))}
            <ClosingSection config={config} />
          </div>
        )
      ) : (
        <>
          <Cover config={config} isOpened={isOpened} onOpen={handleOpen} />

          <main
            className="mx-auto min-h-dvh w-full max-w-lg shadow-sm"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            {enabledSections.map((section) => renderSection(section))}

            <ClosingSection config={config} />
          </main>

          <MusicPlayer
            ref={musicPlayerRef}
            musicUrl={config.media.musicUrl}
            musicPreset={config.media.musicPreset}
            isOpened={isOpened}
          />
        </>
      )}
    </div>
  );
}

interface HeroSectionProps {
  config: SiteConfig;
  shortDate: string;
  targetTimestamp: number;
}

function HeroSection({ config, shortDate, targetTimestamp }: HeroSectionProps) {
  const heroPhoto = config.media.heroPhotoUrl.trim();
  const layout = config.theme.layout.hero;

  return (
    <section
      id="hero"
      aria-label="Pembuka Undangan"
      className="px-5 pt-10 pb-14 text-center"
      style={{
        backgroundImage:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-secondary) 75%, var(--color-background)) 0%, var(--color-background) 100%)",
      }}
    >
      <div
        className={`relative mx-auto w-full overflow-hidden border ${
          layout === "centered"
            ? "aspect-square max-w-[260px] rounded-full"
            : layout === "split"
              ? "aspect-[4/3] rounded-3xl"
              : "aspect-[3/4] rounded-[2rem]"
        }`}
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 45%, transparent)",
        }}
      >
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={`Foto ${config.couple.groom.nickname} dan ${config.couple.bride.nickname}`}
            fill
            priority
            sizes="(max-width: 640px) 92vw, 472px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center px-6">
            <span
              className="font-heading text-5xl font-semibold tracking-wider opacity-85"
              style={{ color: "var(--color-primary)" }}
            >
              {getInitials(config.couple.groom.nickname)} &amp;{" "}
              {getInitials(config.couple.bride.nickname)}
            </span>
            <p className="mt-3 text-xs tracking-[0.2em] uppercase opacity-70">
              {shortDate}
            </p>
          </div>
        )}
      </div>

      <p
        className="mt-8 text-xs font-medium tracking-[0.22em] uppercase"
        style={{ color: "var(--color-accent)" }}
      >
        {config.general.eventTitle}
      </p>

      <h2 className="font-heading mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
        <span>{config.couple.groom.nickname}</span>
        <span
          className="mx-2 inline-block font-normal"
          style={{ color: "var(--color-primary)" }}
        >
          &amp;
        </span>
        <span>{config.couple.bride.nickname}</span>
      </h2>

      <p className="mt-2 text-sm tracking-wide opacity-80">{shortDate}</p>

      <Ornament enabled={config.theme.ornaments} className="my-5" />

      {config.general.openingText ? (
        <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-85">
          {config.general.openingText}
        </p>
      ) : null}

      <Countdown targetTimestamp={targetTimestamp} />
    </section>
  );
}

interface CoupleSectionProps {
  config: SiteConfig;
}

function CoupleSection({ config }: CoupleSectionProps) {
  const coupleList = [
    {
      role: "Putra dari",
      person: config.couple.groom,
    },
    {
      role: "Putri dari",
      person: config.couple.bride,
    },
  ];

  return (
    <section
      id="mempelai"
      aria-labelledby="judul-mempelai"
      className="px-5 py-14 text-center"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
      }}
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Mempelai
        </p>
        <h2
          id="judul-mempelai"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          Kedua Mempelai
        </h2>
        <Ornament enabled={config.theme.ornaments} className="my-4" />

        {config.couple.introText ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-85">
            {config.couple.introText}
          </p>
        ) : null}

        <div className="mt-8 space-y-6">
          {coupleList.map(({ role, person }) => {
            const parents = [person.fatherName, person.motherName]
              .map((value) => value.trim())
              .filter(Boolean)
              .join(" & ");

            return (
              <article
                key={role}
                className="rounded-3xl border px-6 py-7"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                }}
              >
                <div
                  className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  {person.photoUrl.trim() ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.fullName}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="font-heading flex h-full w-full items-center justify-center text-3xl font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {getInitials(person.fullName)}
                    </div>
                  )}
                </div>

                <h3 className="font-heading mt-4 text-xl font-semibold">
                  {person.fullName}
                </h3>

                {parents ? (
                  <p className="mt-2 text-sm leading-relaxed opacity-80">
                    <span className="block text-xs tracking-wide uppercase opacity-75">
                      {role}
                    </span>
                    <span className="mt-0.5 block">{parents}</span>
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

interface EventSectionProps {
  config: SiteConfig;
  fullDate: string;
}

function EventSection({ config, fullDate }: EventSectionProps) {
  const mapsUrl = config.general.mapsUrl.trim();
  const hasValidMapsUrl = isSafeExternalUrl(mapsUrl);

  return (
    <section
      id="acara"
      aria-labelledby="judul-acara"
      className="px-5 py-14 text-center"
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Detail Acara
        </p>
        <h2
          id="judul-acara"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          {config.general.eventTitle}
        </h2>
        <Ornament enabled={config.theme.ornaments} className="my-4" />

        <div
          className="mt-6 rounded-3xl border px-6 py-8"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary) 65%, var(--color-background))",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 45%, transparent)",
          }}
        >
          <div className="space-y-5">
            <div>
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                Hari &amp; Tanggal
              </p>
              <p className="font-heading mt-1 text-lg font-semibold">
                {fullDate}
              </p>
            </div>

            <div
              className="mx-auto h-px w-16 opacity-40"
              style={{ backgroundColor: "var(--color-primary)" }}
            />

            <div>
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                Waktu
              </p>
              <p className="mt-1 text-base font-medium">
                {config.general.eventTimeStart}–{config.general.eventTimeEnd}{" "}
                {config.general.eventTimezone}
              </p>
            </div>

            <div
              className="mx-auto h-px w-16 opacity-40"
              style={{ backgroundColor: "var(--color-primary)" }}
            />

            <div>
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                Lokasi
              </p>
              <p className="font-heading mt-1 text-lg font-semibold">
                {config.general.venueName}
              </p>
              <p className="mt-1 text-sm leading-relaxed opacity-80">
                {config.general.venueAddress}
              </p>
            </div>
          </div>

          {hasValidMapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
                <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" />
                <circle cx="12" cy="11" r="2.2" />
              </svg>
              <span>Buka Google Maps</span>
            </a>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

interface WishesPlaceholderSectionProps {
  ornaments: boolean;
}

function WishesPlaceholderSection({
  ornaments,
}: WishesPlaceholderSectionProps) {
  return (
    <section
      id="ucapan"
      aria-labelledby="judul-ucapan"
      className="px-5 py-14 text-center"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
      }}
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Doa &amp; Harapan
        </p>
        <h2
          id="judul-ucapan"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          Ucapan Tamu
        </h2>
        <Ornament enabled={ornaments} className="my-4" />

        <div
          className="mt-6 rounded-2xl border border-dashed px-6 py-8 text-sm opacity-80"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 45%, transparent)",
          }}
        >
          Kolom kirim ucapan dan daftar doa restu tamu akan diaktifkan pada
          tahap berikutnya.
        </div>
      </Reveal>
    </section>
  );
}

interface ClosingSectionProps {
  config: SiteConfig;
}

function ClosingSection({ config }: ClosingSectionProps) {
  return (
    <footer className="px-5 pt-14 pb-16 text-center">
      <Reveal>
        <Ornament enabled={config.theme.ornaments} className="mb-6" />

        {config.general.closingText ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-85">
            {config.general.closingText}
          </p>
        ) : null}

        <p className="mt-6 text-xs tracking-[0.2em] uppercase opacity-70">
          Kami yang berbahagia
        </p>
        <p className="font-heading mt-2 text-2xl font-semibold">
          {config.couple.groom.nickname}{" "}
          <span style={{ color: "var(--color-primary)" }}>&amp;</span>{" "}
          {config.couple.bride.nickname}
        </p>
      </Reveal>
    </footer>
  );
}
