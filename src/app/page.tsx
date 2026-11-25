import type { Metadata } from "next";
import Link from "next/link";
import { Ornament } from "@/components/invitation/Ornament";

export const metadata: Metadata = {
  title: "Framea — Undangan Pernikahan Digital",
  description:
    "Platform undangan pernikahan digital yang ringan, modern, dan personal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FrameaLandingPage() {
  return (
    <main
      className="flex min-h-dvh w-full items-center justify-center px-5 py-12"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
        color: "var(--color-text)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border px-6 py-10 text-center shadow-sm sm:px-8"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 45%, transparent)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.22em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Framea Wedding Invitation
        </p>

        <Ornament enabled className="my-5" />

        <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight">
          Undangan Pernikahan Digital
        </h1>

        <p className="mt-3 text-sm leading-relaxed opacity-80">
          Untuk melihat undangan, silakan buka tautan personal yang telah
          dibagikan oleh mempelai atau keluarga.
        </p>

        <div
          className="mt-8 border-t pt-6"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          <p className="text-xs opacity-70">Pemilik undangan?</p>
          <Link
            href="/login"
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full px-7 text-sm font-medium tracking-wide transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            Masuk Pemilik Undangan
          </Link>
        </div>
      </div>
    </main>
  );
}
