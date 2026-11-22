"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

interface GallerySectionProps {
  photoUrls: string[];
  ornaments: boolean;
}

export function GallerySection({ photoUrls, ornaments }: GallerySectionProps) {
  const photos = photoUrls.filter((url) => url.trim().length > 0).slice(0, 6);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % photos.length
        );
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + photos.length) % photos.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, photos.length]);

  return (
    <section
      id="galeri"
      aria-labelledby="judul-galeri"
      className="px-5 py-14 text-center"
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
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
          <div className="mt-6 grid grid-cols-2 gap-3">
            {photos.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Lihat foto galeri ${index + 1}`}
                className="group relative aspect-[4/5] min-h-11 w-full cursor-pointer overflow-hidden rounded-2xl border transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                }}
              >
                <Image
                  src={url}
                  alt={`Foto galeri pernikahan ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </Reveal>

      {activeIndex !== null && photos[activeIndex] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto galeri"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-text) 90%, black)",
          }}
          onClick={() => setActiveIndex(null)}
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
                onClick={() => setActiveIndex(null)}
                aria-label="Tutup galeri"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border text-sm font-medium"
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
                  className="inline-flex min-h-11 min-w-24 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium"
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
                  className="inline-flex min-h-11 min-w-24 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium"
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
