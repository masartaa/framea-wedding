"use client";

import { useState } from "react";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import type { SiteConfig } from "@/lib/config-schema";

interface InvitationPreviewProps {
  config: SiteConfig;
}

type ViewportMode = "mobile" | "desktop";
type PreviewView = "cover" | "content";

export function InvitationPreview({ config }: InvitationPreviewProps) {
  const [viewport, setViewport] = useState<ViewportMode>("mobile");
  const [view, setView] = useState<PreviewView>("cover");

  return (
    <section
      aria-label="Pratinjau Undangan"
      className="space-y-4 rounded-3xl border px-4 py-5 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Pratinjau Langsung
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed opacity-75">
            Menampilkan hasil perubahan teks, urutan section, warna, font, dan
            layout sebelum disimpan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Pilih ukuran layar pratinjau"
            className="inline-flex rounded-xl p-1"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-pressed={viewport === "mobile"}
              className="min-h-11 cursor-pointer rounded-lg px-3.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  viewport === "mobile"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  viewport === "mobile"
                    ? "var(--color-background)"
                    : "var(--color-text)",
              }}
            >
              HP (375 px)
            </button>
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-pressed={viewport === "desktop"}
              className="min-h-11 cursor-pointer rounded-lg px-3.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  viewport === "desktop"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  viewport === "desktop"
                    ? "var(--color-background)"
                    : "var(--color-text)",
              }}
            >
              Desktop
            </button>
          </div>

          <div
            role="group"
            aria-label="Pilih tampilan pratinjau"
            className="inline-flex rounded-xl p-1"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            <button
              type="button"
              onClick={() => setView("cover")}
              aria-pressed={view === "cover"}
              className="min-h-11 cursor-pointer rounded-lg px-3.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  view === "cover" ? "var(--color-primary)" : "transparent",
                color:
                  view === "cover"
                    ? "var(--color-background)"
                    : "var(--color-text)",
              }}
            >
              Sampul
            </button>
            <button
              type="button"
              onClick={() => setView("content")}
              aria-pressed={view === "content"}
              className="min-h-11 cursor-pointer rounded-lg px-3.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  view === "content" ? "var(--color-primary)" : "transparent",
                color:
                  view === "content"
                    ? "var(--color-background)"
                    : "var(--color-text)",
              }}
            >
              Isi Undangan
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex justify-center overflow-x-auto rounded-2xl border p-3 sm:p-5"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 25%, transparent)",
        }}
      >
        <div
          className={`overflow-hidden rounded-[2rem] border-4 shadow-md transition-all duration-300 ${
            viewport === "mobile"
              ? "w-[375px] max-w-full"
              : "w-full max-w-[780px]"
          }`}
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-text) 20%, transparent)",
            backgroundColor: "var(--color-background)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-2 text-[11px] opacity-70"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 25%, transparent)",
            }}
          >
            <span>
              {viewport === "mobile"
                ? "Pratinjau HP · 375 px"
                : "Pratinjau Desktop"}
            </span>
            <span>{view === "cover" ? "Sampul" : "Isi Undangan"}</span>
          </div>

          <div className="max-h-[72vh] overflow-y-auto">
            <InvitationShell
              config={config}
              previewMode
              previewView={view}
              onPreviewOpen={() => setView("content")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
