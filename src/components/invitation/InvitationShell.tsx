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
  getInvitationEvents,
  isSafeExternalUrl,
} from "@/lib/format";
import { Countdown } from "./Countdown";
import { Cover } from "./Cover";
import { GallerySection } from "./GallerySection";
import { HeroPhotoFrame } from "./HeroPhotoFrame";
import { MusicPlayer, type MusicPlayerHandle } from "./MusicPlayer";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";
import { WishesSection } from "./WishesSection";

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
  const shortDate = formatEventDateShort(config.general.eventDate);
  const enabledSections = config.sections.filter((section) => section.enabled);

  const renderSection = (section: SectionItem) => {
    switch (section.id) {
      case "hero":
        return (
          <HeroSection
            key={isOpened ? "hero-opened" : "hero-closed"}
            config={config}
            shortDate={shortDate}
            targetTimestamp={targetTimestamp}
            animateEntrance={previewMode || isOpened}
          />
        );
      case "mempelai":
        return <CoupleSection key="mempelai" config={config} />;
      case "acara":
        return <EventSection key="acara" config={config} />;
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
          <WishesSection
            key="ucapan"
            ornaments={config.theme.ornaments}
            previewMode={previewMode}
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
  animateEntrance: boolean;
}

function HeroSection({
  config,
  shortDate,
  targetTimestamp,
  animateEntrance,
}: HeroSectionProps) {
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
      <div className={animateEntrance ? "hero-enter-photo" : "opacity-0"}>
        <HeroPhotoFrame
          photoUrl={config.media.heroPhotoUrl}
          groomNickname={config.couple.groom.nickname}
          brideNickname={config.couple.bride.nickname}
          shortDate={shortDate}
          layout={config.theme.layout}
        />
      </div>

      <div className={animateEntrance ? "hero-enter-title" : "opacity-0"}>
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
      </div>

      <div className={animateEntrance ? "hero-enter-meta" : "opacity-0"}>
        <p className="mt-2 text-sm tracking-wide opacity-80">{shortDate}</p>

        <Ornament enabled={config.theme.ornaments} className="my-5" />

        {config.general.openingText ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-85">
            {config.general.openingText}
          </p>
        ) : null}
      </div>

      <div className={animateEntrance ? "hero-enter-countdown" : "opacity-0"}>
        <Countdown targetTimestamp={targetTimestamp} />
      </div>
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
}

function EventSection({ config }: EventSectionProps) {
  const events = getInvitationEvents(config);
  const isMultiple = events.length > 1;

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
          {isMultiple ? "Rangkaian Acara" : (events[0]?.title ?? config.general.eventTitle)}
        </h2>
        <Ornament enabled={config.theme.ornaments} className="my-4" />

        <div className="mt-6 space-y-5">
          {events.map((eventItem) => {
            const mapsUrl = eventItem.mapsUrl.trim();
            const hasValidMapsUrl = isSafeExternalUrl(mapsUrl);
            const formattedDate = formatEventDateFull(eventItem.date);

            return (
              <article
                key={eventItem.id}
                className="rounded-3xl border px-6 py-8"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 65%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                }}
              >
                {isMultiple ? (
                  <h3
                    className="font-heading mb-5 text-xl font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {eventItem.title}
                  </h3>
                ) : null}

                <div className="space-y-5">
                  <div>
                    <p
                      className="text-xs font-medium tracking-wider uppercase"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Hari &amp; Tanggal
                    </p>
                    <p className="font-heading mt-1 text-lg font-semibold">
                      {formattedDate}
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
                      {eventItem.timeStart}–{eventItem.timeEnd}{" "}
                      {eventItem.timezone}
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
                      {eventItem.venueName}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed opacity-80">
                      {eventItem.venueAddress}
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
              </article>
            );
          })}
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
