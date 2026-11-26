import { useId } from "react";
import type { SiteConfig } from "@/lib/config-schema";

export type BackgroundPatternVariant =
  SiteConfig["theme"]["layout"]["backgroundPattern"];

interface BackgroundDecorationProps {
  variant?: BackgroundPatternVariant;
}

function BotanicalCornerSpray({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 180"
      fill="none"
      className={className}
    >
      <path
        d="M8 8C42 22 68 50 96 92C112 116 130 142 162 166"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M34 24C22 40 20 56 26 70C42 62 50 48 52 34"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 44C72 34 90 32 106 38C96 54 80 62 64 62"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M72 64C54 78 46 96 48 114C66 108 80 96 86 80"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M94 90C114 82 132 82 146 90C134 104 118 110 102 108"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M116 120C102 134 98 148 102 162C118 156 128 144 132 130"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="116" cy="40" r="2.2" fill="currentColor" />
      <circle cx="46" cy="126" r="2" fill="currentColor" />
      <circle cx="156" cy="96" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function BackgroundDecoration({
  variant = "none",
}: BackgroundDecorationProps) {
  const patternId = useId();

  if (variant === "none") {
    return null;
  }

  if (variant === "botanical-corners") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ color: "var(--color-primary)" }}
      >
        <BotanicalCornerSpray className="absolute top-0 left-0 h-44 w-44 opacity-[0.17]" />
        <BotanicalCornerSpray className="absolute top-0 right-0 h-44 w-44 -scale-x-100 opacity-[0.17]" />
        <BotanicalCornerSpray className="absolute top-[36%] -left-8 h-40 w-40 rotate-45 opacity-[0.11]" />
        <BotanicalCornerSpray className="absolute top-[66%] -right-8 h-40 w-40 -scale-x-100 rotate-45 opacity-[0.11]" />
        <BotanicalCornerSpray className="absolute bottom-0 left-0 h-44 w-44 -scale-y-100 opacity-[0.17]" />
        <BotanicalCornerSpray className="absolute right-0 bottom-0 h-44 w-44 -scale-x-100 -scale-y-100 opacity-[0.17]" />
      </div>
    );
  }

  if (variant === "paper-linen") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ color: "var(--color-primary)" }}
      >
        <svg className="h-full w-full opacity-[0.09]">
          <defs>
            <pattern
              id={patternId}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 12H48M0 24H48M0 36H48M12 0V48M24 0V48M36 0V48"
                stroke="currentColor"
                strokeWidth="0.45"
                strokeDasharray="3 5"
              />
              <circle cx="6" cy="6" r="0.65" fill="currentColor" />
              <circle cx="30" cy="18" r="0.55" fill="currentColor" />
              <circle cx="18" cy="42" r="0.6" fill="currentColor" />
              <circle cx="42" cy="30" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    );
  }

  if (variant === "editorial-frame") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ color: "var(--color-primary)" }}
      >
        <div
          className="absolute inset-2.5 rounded-2xl border opacity-[0.22]"
          style={{ borderColor: "currentColor" }}
        />
        <div
          className="absolute inset-4 rounded-xl border opacity-[0.13]"
          style={{ borderColor: "currentColor" }}
        />
        <svg
          viewBox="0 0 24 24"
          className="absolute top-3.5 left-3.5 h-3.5 w-3.5 opacity-[0.3]"
          fill="currentColor"
        >
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className="absolute top-3.5 right-3.5 h-3.5 w-3.5 opacity-[0.3]"
          fill="currentColor"
        >
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className="absolute bottom-3.5 left-3.5 h-3.5 w-3.5 opacity-[0.3]"
          fill="currentColor"
        >
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className="absolute right-3.5 bottom-3.5 h-3.5 w-3.5 opacity-[0.3]"
          fill="currentColor"
        >
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
      </div>
    );
  }

  if (variant === "kawung-classic") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ color: "var(--color-primary)" }}
      >
        <svg className="h-full w-full opacity-[0.1]">
          <defs>
            <pattern
              id={patternId}
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <ellipse
                cx="28"
                cy="14"
                rx="6.5"
                ry="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <ellipse
                cx="28"
                cy="42"
                rx="6.5"
                ry="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <ellipse
                cx="14"
                cy="28"
                rx="12"
                ry="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <ellipse
                cx="42"
                cy="28"
                rx="12"
                ry="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <path
                d="M28 24.5L31.5 28L28 31.5L24.5 28Z"
                fill="currentColor"
                opacity="0.7"
              />
              <circle cx="28" cy="14" r="1.2" fill="currentColor" />
              <circle cx="28" cy="42" r="1.2" fill="currentColor" />
              <circle cx="14" cy="28" r="1.2" fill="currentColor" />
              <circle cx="42" cy="28" r="1.2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    );
  }

  if (variant === "layered-arch") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ color: "var(--color-primary)" }}
      >
        <svg
          viewBox="0 0 400 260"
          fill="none"
          className="absolute top-0 left-1/2 w-full max-w-lg -translate-x-1/2 opacity-[0.16]"
        >
          <path
            d="M36 260V144C36 68 109 16 200 16C291 16 364 68 364 144V260"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M52 260V150C52 84 118 34 200 34C282 34 348 84 348 150V260"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="4 4"
          />
          <path
            d="M200 8L204 16L200 24L196 16Z"
            fill="currentColor"
          />
        </svg>

        <div
          className="absolute top-64 bottom-64 left-5 w-px opacity-[0.11]"
          style={{ backgroundColor: "currentColor" }}
        />
        <div
          className="absolute top-64 right-5 bottom-64 w-px opacity-[0.11]"
          style={{ backgroundColor: "currentColor" }}
        />

        <svg
          viewBox="0 0 400 260"
          fill="none"
          className="absolute bottom-0 left-1/2 w-full max-w-lg -translate-x-1/2 -scale-y-100 opacity-[0.16]"
        >
          <path
            d="M36 260V144C36 68 109 16 200 16C291 16 364 68 364 144V260"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M52 260V150C52 84 118 34 200 34C282 34 348 84 348 150V260"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="4 4"
          />
          <path
            d="M200 8L204 16L200 24L196 16Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ color: "var(--color-primary)" }}
    >
      <svg className="h-full w-full opacity-[0.17]">
        <defs>
          <pattern
            id={patternId}
            width="92"
            height="92"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M22 14L23.6 18.4L28 20L23.6 21.6L22 26L20.4 21.6L16 20L20.4 18.4Z"
              fill="currentColor"
            />
            <path
              d="M70 60L71.2 63.3L74.5 64.5L71.2 65.7L70 69L68.8 65.7L65.5 64.5L68.8 63.3Z"
              fill="currentColor"
              opacity="0.75"
            />
            <circle cx="64" cy="24" r="1.4" fill="currentColor" opacity="0.65" />
            <circle cx="16" cy="70" r="1.6" fill="currentColor" opacity="0.55" />
            <circle cx="46" cy="46" r="1.1" fill="currentColor" opacity="0.5" />
            <circle cx="82" cy="12" r="1" fill="currentColor" opacity="0.45" />
            <circle cx="42" cy="82" r="1.2" fill="currentColor" opacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
