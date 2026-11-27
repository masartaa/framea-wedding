"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import type { SiteConfig } from "@/lib/config-schema";
import {
  buildWhatsAppOrderUrl,
  DEMO_INVITATION_CONFIG,
  PACKAGE_PRICING,
} from "@/lib/marketing";
import { THEME_PRESETS, type ThemePresetKey } from "@/lib/theme-presets";

export function DemoInvitationExperience() {
  const [presetId, setPresetId] = useState<ThemePresetKey>("putih-emas");

  const activePreset =
    THEME_PRESETS.find((item) => item.id === presetId) ?? THEME_PRESETS[0];

  const activeConfig = useMemo<SiteConfig>(
    () => ({
      ...DEMO_INVITATION_CONFIG,
      theme: {
        ...DEMO_INVITATION_CONFIG.theme,
        preset: activePreset.id,
        colors: { ...activePreset.colors },
      },
    }),
    [activePreset]
  );

  const whatsappHref = buildWhatsAppOrderUrl(
    `Halo Framea, saya baru melihat halaman contoh undangan dengan tema ${activePreset.name}. Saya ingin memesan paket undangan promo ${PACKAGE_PRICING.promoFormatted}.`
  );

  return (
    <div className="min-h-dvh w-full">
      <div
        role="region"
        aria-label="Kontrol halaman contoh undangan"
        className="admin-monochrome sticky top-0 z-[60] border-b"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 20%, transparent)",
          color: "var(--color-text)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 34%, transparent)",
                color: "var(--color-text)",
              }}
            >
              ← Beranda
            </Link>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-xs font-semibold">
                Mode Contoh Undangan
              </p>
              <p className="truncate text-[11px] opacity-75">
                Tema aktif: {activePreset.name}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            {/* Mobile compact selector so top bar stays single-row on 375 px */}
            <div className="sm:hidden">
              <label htmlFor="demo-theme-select" className="sr-only">
                Pilih tema warna undangan
              </label>
              <select
                id="demo-theme-select"
                value={presetId}
                onChange={(event) =>
                  setPresetId(event.target.value as ThemePresetKey)
                }
                className="h-11 max-w-[140px] rounded-xl border px-2.5 py-2 text-xs leading-none font-medium"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 34%, transparent)",
                  color: "var(--color-text)",
                }}
              >
                {THEME_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tablet/Desktop 5 preset swatches */}
            <div
              role="group"
              aria-label="Pilih preset warna halaman contoh"
              className="hidden items-center gap-1.5 sm:flex"
            >
              {THEME_PRESETS.map((preset) => {
                const isSelected = preset.id === activePreset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.name}
                    aria-label={`Tema ${preset.name}`}
                    aria-pressed={isSelected}
                    onClick={() => setPresetId(preset.id)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 rounded-full border"
                      style={{
                        backgroundColor: preset.colors.primary,
                        borderColor:
                          "color-mix(in srgb, var(--color-text) 20%, transparent)",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-3.5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 sm:px-4"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              <span className="sm:hidden">Pesan WA</span>
              <span className="hidden sm:inline">Pesan Tema Ini</span>
            </a>
          </div>
        </div>
      </div>

      <InvitationShell config={activeConfig} demoMode />
    </div>
  );
}
