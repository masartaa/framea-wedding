import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import { getInitials } from "@/lib/format";

interface HeroPhotoFrameProps {
  photoUrl: string;
  groomNickname: string;
  brideNickname: string;
  shortDate: string;
  layout: SiteConfig["theme"]["layout"];
}

function getShapeClasses(layout: SiteConfig["theme"]["layout"]): {
  wrapperClass: string;
  radiusClass: string;
} {
  const shape = layout.heroShape ?? "rounded";

  if (shape === "circle") {
    return {
      wrapperClass: "aspect-square max-w-[260px]",
      radiusClass: "rounded-full",
    };
  }

  if (shape === "oval") {
    return {
      wrapperClass: "aspect-[3/4] max-w-[270px]",
      radiusClass: "rounded-[50%]",
    };
  }

  if (shape === "arch") {
    return {
      wrapperClass: "aspect-[3/4] max-w-[300px]",
      radiusClass: "rounded-t-full rounded-b-2xl",
    };
  }

  if (shape === "square") {
    return {
      wrapperClass: "aspect-square max-w-[300px]",
      radiusClass: "rounded-2xl",
    };
  }

  // shape === "rounded": ikuti proporsi layout hero
  if (layout.hero === "split") {
    return {
      wrapperClass: "aspect-[4/3] max-w-full",
      radiusClass: "rounded-3xl",
    };
  }
  if (layout.hero === "centered") {
    return {
      wrapperClass: "aspect-square max-w-[270px]",
      radiusClass: "rounded-3xl",
    };
  }
  return {
    wrapperClass: "aspect-[3/4] max-w-[330px]",
    radiusClass: "rounded-[2rem]",
  };
}

export function HeroPhotoFrame({
  photoUrl,
  groomNickname,
  brideNickname,
  shortDate,
  layout,
}: HeroPhotoFrameProps) {
  const trimmedPhoto = photoUrl.trim();
  const decoration = layout.heroDecoration ?? "floral-corner";
  const { wrapperClass, radiusClass } = getShapeClasses(layout);

  return (
    <div className="relative mx-auto flex w-full items-center justify-center py-2">
      <div className={`relative w-full ${wrapperClass}`}>
        {/* Dekorasi Pendar Lembut di belakang foto */}
        {decoration === "soft-glow" ? (
          <>
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-3 opacity-55 blur-xl ${radiusClass}`}
              style={{
                background:
                  "radial-gradient(circle, var(--color-primary) 0%, var(--color-secondary) 60%, transparent 100%)",
              }}
            />
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute -top-2 -right-1 z-20"
              style={{ color: "var(--color-primary)" }}
            >
              <path
                d="M12 2L14 9.5L21.5 11.5L14 13.5L12 21L10 13.5L2.5 11.5L10 9.5L12 2Z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute -bottom-1 -left-1 z-20"
              style={{ color: "var(--color-accent)" }}
            >
              <path
                d="M12 2L14 9.5L21.5 11.5L14 13.5L12 21L10 13.5L2.5 11.5L10 9.5L12 2Z"
                fill="currentColor"
                opacity="0.85"
              />
            </svg>
          </>
        ) : null}

        {/* Dekorasi Bingkai Ganda */}
        {decoration === "double-frame" ? (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-2.5 border ${radiusClass}`}
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 65%, transparent)",
            }}
          />
        ) : null}

        {/* Bingkai Utama Foto */}
        <div
          className={`relative z-10 h-full w-full overflow-hidden border-2 shadow-sm ${radiusClass}`}
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor:
              decoration === "none"
                ? "color-mix(in srgb, var(--color-primary) 35%, transparent)"
                : "var(--color-primary)",
          }}
        >
          {trimmedPhoto ? (
            <Image
              src={trimmedPhoto}
              alt={`Foto ${groomNickname} dan ${brideNickname}`}
              fill
              priority
              sizes="(max-width: 640px) 88vw, 360px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-6">
              <span
                className="font-heading text-5xl font-semibold tracking-wider opacity-85"
                style={{ color: "var(--color-primary)" }}
              >
                {getInitials(groomNickname)} &amp; {getInitials(brideNickname)}
              </span>
              <p className="mt-3 text-xs tracking-[0.2em] uppercase opacity-70">
                {shortDate}
              </p>
            </div>
          )}

          {decoration === "double-frame" ? (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-2 border ${radiusClass}`}
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-background) 70%, transparent)",
              }}
            />
          ) : null}
        </div>

        {/* Dekorasi Ornamen Daun & Bunga di sudut atas-kiri dan bawah-kanan */}
        {decoration === "floral-corner" ? (
          <>
            <FloralCornerSvg className="pointer-events-none absolute -top-4 -left-4 z-20 h-20 w-20" />
            <FloralCornerSvg className="pointer-events-none absolute -right-4 -bottom-4 z-20 h-20 w-20 rotate-180" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function FloralCornerSvg({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <path
        d="M14 82C16 52 34 26 78 16"
        stroke="var(--color-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M26 56C14 48 12 36 22 28C32 34 34 46 26 56Z"
        fill="var(--color-secondary)"
        stroke="var(--color-primary)"
        strokeWidth="1.4"
      />
      <path
        d="M44 34C38 20 46 10 60 12C62 24 54 32 44 34Z"
        fill="var(--color-secondary)"
        stroke="var(--color-primary)"
        strokeWidth="1.4"
      />
      <path
        d="M34 44C46 42 54 48 52 58C42 58 34 52 34 44Z"
        fill="var(--color-primary)"
        opacity="0.28"
      />
      <circle
        cx="27"
        cy="31"
        r="5.5"
        fill="var(--color-background)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      <circle cx="27" cy="31" r="2.2" fill="var(--color-accent)" />
      <circle cx="68" cy="19" r="2.4" fill="var(--color-primary)" />
      <circle cx="18" cy="70" r="2.2" fill="var(--color-primary)" />
    </svg>
  );
}
