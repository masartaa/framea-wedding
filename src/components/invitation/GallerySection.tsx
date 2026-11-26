"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

type GalleryTransition = SiteConfig["theme"]["layout"]["galleryTransition"];

interface GallerySectionProps {
  photoUrls: string[];
  ornaments: boolean;
  transition?: GalleryTransition;
}

interface SlideState {
  current: number;
  previous: number | null;
  direction: 1 | -1;
  step: number;
}

const AUTOPLAY_INTERVAL_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;

export function GallerySection({
  photoUrls,
  ornaments,
  transition = "fade",
}: GallerySectionProps) {
  const photos = photoUrls.filter((url) => url.trim().length > 0).slice(0, 6);
  const [slideState, setSlideState] = useState<SlideState>({
    current: 0,
    previous: null,
    direction: 1,
    step: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const swipeStartXRef = useRef<number | null>(null);

  const safeSlideIndex =
    photos.length > 0 ? slideState.current % photos.length : 0;
  const safePrevIndex =
    slideState.previous !== null && photos.length > 0
      ? slideState.previous % photos.length
      : null;

  const goToSlide = (nextIndex: number, explicitDirection?: 1 | -1) => {
    if (photos.length === 0) {
      return;
    }
    setSlideState((prev) => {
      const current = prev.current % photos.length;
      const target = (nextIndex + photos.length) % photos.length;
      if (target === current) {
        return prev;
      }
      const direction: 1 | -1 =
        explicitDirection ?? (target > current ? 1 : -1);
      return {
        current: target,
        previous: current,
        direction,
        step: prev.step + 1,
      };
    });
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    const trigger = lastTriggerRef.current;
    lastTriggerRef.current = null;
    if (trigger) {
      requestAnimationFrame(() => trigger.focus());
    }
  };

  useEffect(() => {
    if (photos.length <= 1 || isPaused || activeIndex !== null) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setSlideState((prev) => {
        const current = prev.current % photos.length;
        return {
          current: (current + 1) % photos.length,
          previous: current,
          direction: 1,
          step: prev.step + 1,
        };
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused, photos.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % photos.length
        );
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + photos.length) % photos.length
        );
      } else if (event.key === "Tab" && dialog) {
        const list = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (list.length === 0) {
          return;
        }
        const first = list[0];
        const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, photos.length]);

  const handleSlidePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = event.clientX;
  };

  const handleSlidePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const startX = swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (startX === null || photos.length <= 1) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      setIsPaused(true);
      if (deltaX < 0) {
        goToSlide(safeSlideIndex + 1, 1);
      } else {
        goToSlide(safeSlideIndex - 1, -1);
      }
    }
  };

  return (
    <section
      id="galeri"
      aria-labelledby="judul-galeri"
      className="px-5 py-14 text-center"
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-wider"
          style={{ color: "var(--color-accent)" }}
        >
          Momen Bahagia
        </p>
        <h2
          id="judul-galeri"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          Galeri Foto
        </h2>
        <Ornament enabled={ornaments} className="my-4" />

        {photos.length === 0 ? (
          <div
            className="mt-6 rounded-2xl border border-dashed px-6 py-10 text-sm opacity-75"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 50%, transparent)",
            }}
          >
            Foto galeri akan segera ditampilkan di sini.
          </div>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Slideshow galeri foto pernikahan"
            className="mt-6 space-y-3"
          >
            <div
              onPointerDown={handleSlidePointerDown}
              onPointerUp={handleSlidePointerUp}
              onPointerCancel={() => {
                swipeStartXRef.current = null;
              }}
              className="relative overflow-hidden rounded-3xl border touch-pan-y"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 38%, transparent)",
              }}
            >
              <button
                type="button"
                onClick={(event) => {
                  lastTriggerRef.current = event.currentTarget;
                  setActiveIndex(safeSlideIndex);
                }}
                aria-label={`Perbesar foto ${safeSlideIndex + 1} dari ${photos.length}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden"
              >
                {transition === "slide" ? (
                  <div
                    className="flex h-full w-full transition-transform duration-500 ease-out"
                    style={{
                      transform: `translate3d(-${safeSlideIndex * 100}%, 0, 0)`,
                    }}
                  >
                    {photos.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        aria-hidden={index !== safeSlideIndex}
                        className="relative h-full w-full shrink-0"
                      >
                        <Image
                          src={url}
                          alt={`Foto galeri pernikahan ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 90vw, 448px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  photos.map((url, index) => {
                    const isActive = index === safeSlideIndex;
                    const isPrevious =
                      safePrevIndex !== null &&
                      index === safePrevIndex &&
                      safePrevIndex !== safeSlideIndex;

                    let wrapperClass = "absolute inset-0";
                    let wrapperStyle: CSSProperties = {};
                    let imageClass =
                      "object-cover transition-transform duration-500 group-hover:scale-[1.02]";
                    let imageStyle: CSSProperties | undefined;

                    if (transition === "fade") {
                      wrapperClass =
                        "absolute inset-0 transition-opacity duration-700 ease-out";
                      wrapperStyle = {
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 20 : 10,
                      };
                    } else if (transition === "ken-burns") {
                      wrapperClass =
                        "absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out";
                      wrapperStyle = {
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 20 : 10,
                      };
                      imageClass = isActive
                        ? slideState.step % 2 === 0
                          ? "object-cover gallery-ken-burns-a"
                          : "object-cover gallery-ken-burns-b"
                        : "object-cover";
                      imageStyle = isActive
                        ? {
                            animationPlayState: isPaused
                              ? "paused"
                              : "running",
                          }
                        : undefined;
                    } else if (transition === "card-depth") {
                      const offsetX =
                        index < safeSlideIndex
                          ? "-18%"
                          : index > safeSlideIndex
                            ? "18%"
                            : "0%";
                      wrapperClass =
                        "absolute inset-0 transition-[transform,opacity] duration-500 ease-out";
                      wrapperStyle = {
                        opacity: isActive ? 1 : 0,
                        transform: isActive
                          ? "translate3d(0, 0, 0) scale(1)"
                          : `translate3d(${offsetX}, 0, 0) scale(0.92)`,
                        zIndex: isActive ? 20 : isPrevious ? 15 : 10,
                      };
                    } else if (transition === "curtain") {
                      const shouldAnimateCurtain =
                        isActive && slideState.step > 0;
                      const curtainAnimClass = shouldAnimateCurtain
                        ? slideState.direction === 1
                          ? slideState.step % 2 === 0
                            ? "gallery-curtain-next-a"
                            : "gallery-curtain-next-b"
                          : slideState.step % 2 === 0
                            ? "gallery-curtain-prev-a"
                            : "gallery-curtain-prev-b"
                        : "";
                      wrapperClass = `absolute inset-0 ${curtainAnimClass}`;
                      wrapperStyle = {
                        opacity: isActive || isPrevious ? 1 : 0,
                        zIndex: isActive ? 20 : isPrevious ? 15 : 10,
                      };
                    }

                    return (
                      <div
                        key={`${url}-${index}`}
                        aria-hidden={!isActive}
                        className={wrapperClass}
                        style={wrapperStyle}
                      >
                        <Image
                          src={url}
                          alt={`Foto galeri pernikahan ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 90vw, 448px"
                          className={imageClass}
                          style={imageStyle}
                        />
                      </div>
                    );
                  })
                )}
                <span
                  className="pointer-events-none absolute right-3 bottom-3 z-30 rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text)",
                  }}
                >
                  {safeSlideIndex + 1} / {photos.length} · Perbesar
                </span>
              </button>
            </div>

            {photos.length > 1 ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaused(true);
                      goToSlide(safeSlideIndex - 1, -1);
                    }}
                    aria-label="Foto sebelumnya"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3.5 text-xs font-semibold transition-opacity hover:opacity-85 active:opacity-75"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                      color: "var(--color-text)",
                    }}
                  >
                    ← Sebelumnya
                  </button>

                  <button
                    type="button"
                    aria-pressed={isPaused}
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-label={
                      isPaused ? "Putar slideshow otomatis" : "Jeda slideshow otomatis"
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-opacity hover:opacity-85 active:opacity-75"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                      color: "var(--color-text)",
                    }}
                  >
                    {isPaused ? "Putar" : "Jeda"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPaused(true);
                      goToSlide(safeSlideIndex + 1, 1);
                    }}
                    aria-label="Foto berikutnya"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-3.5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-background)",
                    }}
                  >
                    Berikutnya →
                  </button>
                </div>

                <div
                  role="group"
                  aria-label="Pilih foto slideshow"
                  className="grid grid-cols-6 gap-2"
                >
                  {photos.map((url, index) => {
                    const isCurrent = index === safeSlideIndex;
                    return (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        aria-label={`Tampilkan foto ${index + 1}`}
                        aria-current={isCurrent ? "true" : undefined}
                        onClick={() => {
                          setIsPaused(true);
                          goToSlide(index);
                        }}
                        className="relative aspect-square min-h-11 w-full overflow-hidden rounded-xl border transition-opacity hover:opacity-95"
                        style={{
                          borderColor: isCurrent
                            ? "var(--color-primary)"
                            : "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                          borderWidth: isCurrent ? "2px" : "1px",
                          opacity: isCurrent ? 1 : 0.7,
                        }}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail foto ${index + 1}`}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        )}
      </Reveal>

      {activeIndex !== null && photos[activeIndex] ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto galeri"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-text) 90%, black)",
          }}
          onClick={closeLightbox}
        >
          <div
            className="relative flex w-full max-w-md flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between">
              <span
                className="text-xs font-medium tracking-wider"
                style={{ color: "var(--color-background)" }}
              >
                {activeIndex + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Tutup galeri"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border text-sm font-medium transition-opacity hover:opacity-90 active:opacity-75"
                style={{
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-text)",
                }}
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Image
                src={photos[activeIndex]}
                alt={`Foto galeri pernikahan ${activeIndex + 1}`}
                fill
                sizes="(max-width: 640px) 92vw, 448px"
                className="object-contain"
              />
            </div>

            {photos.length > 1 ? (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      (activeIndex - 1 + photos.length) % photos.length
                    )
                  }
                  className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-full px-4 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-text)",
                  }}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((activeIndex + 1) % photos.length)
                  }
                  className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-full px-4 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  }}
                >
                  Berikutnya
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
