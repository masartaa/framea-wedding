"use client";

import { useState, type CSSProperties } from "react";
import { Ornament } from "@/components/invitation/Ornament";
import { THEME_PRESETS, type ThemePresetKey } from "@/lib/theme-presets";

type PreviewCoverVariant = "center" | "arch" | "minimal";

const COVER_VARIANTS: ReadonlyArray<{
  id: PreviewCoverVariant;
  label: string;
}> = [
  { id: "center", label: "Kartu" },
  { id: "arch", label: "Kubah" },
  { id: "minimal", label: "Minimalis" },
];

export function LandingShowcase() {
  const [presetId, setPresetId] = useState<ThemePresetKey>("putih-emas");
  const [coverVariant, setCoverVariant] =
    useState<PreviewCoverVariant>("arch");
  const [isOpened, setIsOpened] = useState(false);

  const activePreset =
    THEME_PRESETS.find((item) => item.id === presetId) ?? THEME_PRESETS[0];
  const { colors } = activePreset;

  const phoneVars = {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-background": colors.background,
    "--color-text": colors.text,
    "--color-accent": colors.accent,
  } as CSSProperties;

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="w-full max-w-[330px] rounded-2xl border p-3.5 sm:p-4"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 22%, transparent)",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-semibold">Pratinjau Interaktif</span>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: "var(--color-background)",
              color: "var(--color-accent)",
            }}
          >
            {activePreset.name}
          </span>
        </div>

        <div
          style={phoneVars}
          className="overflow-hidden rounded-[1.75rem] border-2"
        >
          <div
            className="flex items-center justify-between border-b px-4 py-2 text-[11px] font-medium"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 24%, transparent)",
              color: "var(--color-text)",
            }}
          >
            <span>Pratinjau HP</span>
            <span>{isOpened ? "Isi Undangan" : "Sampul"}</span>
          </div>

          <div
            className="flex min-h-[370px] flex-col justify-center px-4 py-6 text-center transition-colors duration-200"
            style={{
              backgroundColor: "var(--color-background)",
              color: "var(--color-text)",
            }}
          >
            {isOpened ? (
              <div className="flex flex-col items-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  <span
                    className="font-heading text-xl font-semibold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    P &amp; W
                  </span>
                </div>

                <p
                  className="mt-4 text-[11px] font-medium tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  Resepsi Pernikahan
                </p>

                <p className="font-heading mt-1 text-xl leading-tight font-semibold">
                  Nama Pria{" "}
                  <span style={{ color: "var(--color-primary)" }}>&amp;</span>{" "}
                  Nama Wanita
                </p>

                <Ornament enabled className="my-3" />

                <div
                  className="w-full rounded-xl border px-3.5 py-3 text-center"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Jadwal &amp; Lokasi Acara
                  </p>
                  <p className="mt-1 text-xs font-medium">
                    Hari, Tanggal Acara · Jam Acara
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-75">
                    Nama Tempat &amp; Tautan Google Maps
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpened(false)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-opacity hover:opacity-85 active:opacity-75"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-text)",
                  }}
                >
                  Kembali ke Sampul
                </button>
              </div>
            ) : (
              <div
                className={
                  coverVariant === "minimal"
                    ? "flex flex-col items-center px-2 py-2"
                    : "flex flex-col items-center rounded-2xl border px-4 py-5"
                }
                style={
                  coverVariant === "minimal"
                    ? undefined
                    : {
                        backgroundColor:
                          "color-mix(in srgb, var(--color-secondary) 70%, var(--color-background))",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 42%, transparent)",
                      }
                }
              >
                {coverVariant === "minimal" ? (
                  <span
                    aria-hidden="true"
                    className="mb-3 h-7 w-px opacity-75"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                ) : null}

                <p
                  className="text-[11px] font-medium tracking-wider"
                  style={{ color: "var(--color-accent)" }}
                >
                  Undangan Pernikahan
                </p>

                {coverVariant === "arch" ? (
                  <div
                    className="mt-3 flex aspect-[3/4] w-24 items-center justify-center rounded-t-full rounded-b-lg border-2"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: "var(--color-primary)",
                    }}
                  >
                    <span
                      className="font-heading text-lg font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      P &amp; W
                    </span>
                  </div>
                ) : (
                  <Ornament enabled className="my-3" />
                )}

                <p className="font-heading mt-3 text-xl leading-tight font-semibold">
                  Nama Pria{" "}
                  <span style={{ color: "var(--color-primary)" }}>&amp;</span>{" "}
                  Nama Wanita
                </p>

                <div
                  className={`mt-4 w-full px-3 py-2.5 ${
                    coverVariant === "minimal"
                      ? "border-y"
                      : "rounded-xl border"
                  }`}
                  style={{
                    backgroundColor:
                      coverVariant === "minimal"
                        ? "transparent"
                        : "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <p className="text-[11px] opacity-75">Kepada Yth.</p>
                  <p className="mt-0.5 text-xs font-semibold">
                    Nama Tamu (Pratinjau)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpened(true)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  }}
                >
                  Buka Undangan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3.5 space-y-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-medium opacity-80">
              Coba palet warna undangan
            </p>
            <div
              role="group"
              aria-label="Pilih palet warna pratinjau"
              className="flex flex-wrap items-center gap-2"
            >
              {THEME_PRESETS.map((preset) => {
                const isSelected = preset.id === activePreset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={`Tema ${preset.name}`}
                    aria-pressed={isSelected}
                    title={preset.name}
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
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium opacity-80">
              Coba gaya sampul
            </p>
            <div
              role="group"
              aria-label="Pilih gaya sampul pratinjau"
              className="grid grid-cols-3 gap-1.5"
            >
              {COVER_VARIANTS.map((variant) => {
                const isSelected = coverVariant === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setCoverVariant(variant.id);
                      setIsOpened(false);
                    }}
                    className="min-h-11 rounded-xl border px-2 text-xs font-medium transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-primary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                      color: isSelected
                        ? "var(--color-on-primary)"
                        : "var(--color-text)",
                    }}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
