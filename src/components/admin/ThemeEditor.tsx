"use client";

import type { SiteConfig, ThemeColors } from "@/lib/config-schema";
import {
  BODY_FONT_CSS_MAP,
  HEADING_FONT_CSS_MAP,
} from "@/lib/font-variables";
import {
  BACKGROUND_PATTERN_OPTIONS,
  BODY_FONT_OPTIONS,
  COLOR_FIELD_META,
  COVER_LAYOUT_OPTIONS,
  detectMatchingPreset,
  FONT_PAIRINGS,
  GALLERY_TRANSITION_OPTIONS,
  getThemeContrastWarnings,
  HEADING_FONT_OPTIONS,
  HERO_DECORATION_OPTIONS,
  HERO_LAYOUT_OPTIONS,
  HERO_SHAPE_OPTIONS,
  THEME_PRESETS,
  type BackgroundPatternOption,
  type BodyFontOption,
  type CoverLayoutOption,
  type GalleryTransitionOption,
  type HeadingFontOption,
  type HeroDecorationOption,
  type HeroLayoutOption,
  type HeroShapeOption,
  type ThemePresetDefinition,
} from "@/lib/theme-presets";

interface ThemeEditorProps {
  theme: SiteConfig["theme"];
  fieldErrors: Record<string, string>;
  onChange: (nextTheme: SiteConfig["theme"]) => void;
  onClearError: (key: string) => void;
}

function normalizeColorForPicker(value: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#C9A24B";
}

export function ThemeEditor({
  theme,
  fieldErrors,
  onChange,
  onClearError,
}: ThemeEditorProps) {
  const contrastWarnings = getThemeContrastWarnings(theme.colors);

  const applyPreset = (preset: ThemePresetDefinition) => {
    onChange({
      ...theme,
      preset: preset.id,
      colors: { ...preset.colors },
    });
    for (const meta of COLOR_FIELD_META) {
      onClearError(`theme.colors.${meta.key}`);
    }
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const nextColors: ThemeColors = {
      ...theme.colors,
      [key]: value,
    };
    onChange({
      ...theme,
      preset: detectMatchingPreset(nextColors),
      colors: nextColors,
    });
    onClearError(`theme.colors.${key}`);
  };

  const updateFonts = (
    heading: HeadingFontOption,
    body: BodyFontOption
  ) => {
    onChange({
      ...theme,
      fonts: { heading, body },
    });
  };

  const updateCoverLayout = (cover: CoverLayoutOption) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, cover },
    });
  };

  const updateHeroLayout = (hero: HeroLayoutOption) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, hero },
    });
  };

  const updateHeroShape = (heroShape: HeroShapeOption) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, heroShape },
    });
  };

  const updateHeroDecoration = (heroDecoration: HeroDecorationOption) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, heroDecoration },
    });
  };

  const updateGalleryTransition = (
    galleryTransition: GalleryTransitionOption
  ) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, galleryTransition },
    });
  };

  const updateBackgroundPattern = (
    backgroundPattern: BackgroundPatternOption
  ) => {
    onChange({
      ...theme,
      layout: { ...theme.layout, backgroundPattern },
    });
  };

  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <section
      aria-label="Pengaturan Tema"
      className="space-y-6 rounded-2xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Palet Warna &amp; Preset
        </h2>
        <p className="mt-0.5 text-sm opacity-75">
          Pilih salah satu dari 5 preset warna atau sesuaikan setiap warna
          secara manual.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = theme.preset === preset.id;
            const swatches = [
              preset.colors.background,
              preset.colors.secondary,
              preset.colors.primary,
              preset.colors.accent,
              preset.colors.text,
            ];

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={isSelected}
                className="flex min-h-11 flex-col items-start rounded-2xl border p-3.5 text-left transition-opacity duration-150 hover:opacity-90 active:opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-secondary)"
                    : "var(--color-background)",
                  borderColor: isSelected
                    ? "var(--color-primary)"
                    : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  borderWidth: isSelected ? "2px" : "1px",
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{preset.name}</span>
                  {isSelected ? (
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                      }}
                    >
                      Aktif
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-75">
                  {preset.description}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  {swatches.map((hex, index) => (
                    <span
                      key={`${preset.id}-${index}`}
                      aria-hidden="true"
                      className="h-5 w-5 rounded-full border"
                      style={{
                        backgroundColor: hex,
                        borderColor:
                          "color-mix(in srgb, var(--color-text) 20%, transparent)",
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Kustomisasi Warna Manual</h3>
            <span className="text-xs opacity-75">
              Mode:{" "}
              <strong className="font-medium">
                {theme.preset === "custom" ? "Kustom" : theme.preset}
              </strong>
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELD_META.map((item) => {
              const currentValue = theme.colors[item.key];
              const error = fieldErrors[`theme.colors.${item.key}`];

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border p-3.5"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <label
                    htmlFor={`color-${item.key}`}
                    className="block text-sm font-medium"
                  >
                    {item.label}
                  </label>
                  <p className="text-xs opacity-75">{item.hint}</p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      aria-label={`Pilih ${item.label}`}
                      type="color"
                      value={normalizeColorForPicker(currentValue)}
                      onChange={(event) =>
                        updateColor(item.key, event.target.value.toUpperCase())
                      }
                      className="h-11 w-12 shrink-0 rounded-xl border p-1"
                      style={inputStyle}
                    />
                    <input
                      id={`color-${item.key}`}
                      type="text"
                      maxLength={7}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={
                        error ? `err-color-${item.key}` : undefined
                      }
                      value={currentValue}
                      onChange={(event) =>
                        updateColor(item.key, event.target.value)
                      }
                      placeholder="#FFFFFF"
                      className="min-h-11 w-full rounded-xl border px-3 font-mono text-sm uppercase"
                      style={inputStyle}
                    />
                  </div>
                  {error ? (
                    <p
                      id={`err-color-${item.key}`}
                      role="alert"
                      className="mt-1 text-xs font-medium"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {contrastWarnings.length > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border px-4 py-3.5 text-sm"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
              borderColor: "var(--color-accent)",
              color: "var(--color-text)",
            }}
          >
            <p
              className="font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              Peringatan Kontras Warna
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              {contrastWarnings.map((warning) => (
                <li key={warning.id}>{warning.message}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-xs opacity-75">
            Kontras teks dan latar saat ini sudah memenuhi standar keterbacaan.
          </p>
        )}
      </div>

      <div
        className="border-t pt-6"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 25%, transparent)",
        }}
      >
        <h2 className="font-heading text-lg font-semibold">Pasangan Font</h2>
        <p className="mt-0.5 text-sm opacity-75">
          Pilih pasangan font kurasi yang ringan atau atur font judul dan teks
          isi secara terpisah.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FONT_PAIRINGS.map((pair) => {
            const isSelected =
              theme.fonts.heading === pair.heading &&
              theme.fonts.body === pair.body;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => updateFonts(pair.heading, pair.body)}
                aria-pressed={isSelected}
                className="flex min-h-11 flex-col items-start rounded-2xl border p-3.5 text-left transition-opacity hover:opacity-90 active:opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-secondary)"
                    : "var(--color-background)",
                  borderColor: isSelected
                    ? "var(--color-primary)"
                    : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  borderWidth: isSelected ? "2px" : "1px",
                }}
              >
                <span className="text-xs font-medium opacity-75">
                  {pair.name}
                </span>
                <span
                  className="mt-1 text-lg font-semibold"
                  style={{ fontFamily: HEADING_FONT_CSS_MAP[pair.heading] }}
                >
                  Nama Mempelai
                </span>
                <span
                  className="mt-0.5 text-xs opacity-75"
                  style={{ fontFamily: BODY_FONT_CSS_MAP[pair.body] }}
                >
                  {pair.heading} + {pair.body}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="theme-font-heading"
              className="block text-sm font-medium"
            >
              Font Judul (Heading)
            </label>
            <select
              id="theme-font-heading"
              value={theme.fonts.heading}
              onChange={(event) =>
                updateFonts(
                  event.target.value as HeadingFontOption,
                  theme.fonts.body
                )
              }
              className="mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm"
              style={inputStyle}
            >
              {HEADING_FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="theme-font-body"
              className="block text-sm font-medium"
            >
              Font Teks Isi (Body)
            </label>
            <select
              id="theme-font-body"
              value={theme.fonts.body}
              onChange={(event) =>
                updateFonts(
                  theme.fonts.heading,
                  event.target.value as BodyFontOption
                )
              }
              className="mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm"
              style={inputStyle}
            >
              {BODY_FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        className="border-t pt-6"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 25%, transparent)",
        }}
      >
        <h2 className="font-heading text-lg font-semibold">
          Varian Layout &amp; Ornamen
        </h2>

        <div className="mt-4 space-y-5">
          <div>
            <p className="text-sm font-medium">Layout Sampul (Cover)</p>
            <p className="mt-0.5 text-xs opacity-75">
              Pilih 1 dari 5 variasi tampilan sampul yang dilihat tamu sebelum
              menekan Buka Undangan.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {COVER_LAYOUT_OPTIONS.map((option) => {
                const isSelected = theme.layout.cover === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateCoverLayout(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 flex-col items-start rounded-2xl border p-3 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <CoverLayoutIcon variant={option.id} />
                    <span className="mt-2 text-xs font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-0.5 text-[11px] leading-snug opacity-75">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Layout Hero</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {HERO_LAYOUT_OPTIONS.map((option) => {
                const isSelected = theme.layout.hero === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateHeroLayout(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 flex-col items-start rounded-2xl border p-3.5 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <span className="text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed opacity-75">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Bentuk Foto Hero</p>
            <p className="mt-0.5 text-xs opacity-75">
              Menentukan bentuk bingkai foto utama (oval, lingkaran, lengkung
              kubah, atau persegi).
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {HERO_SHAPE_OPTIONS.map((option) => {
                const currentShape = theme.layout.heroShape ?? "rounded";
                const isSelected = currentShape === option.id;
                const shapePreviewClass =
                  option.id === "circle"
                    ? "h-8 w-8 rounded-full"
                    : option.id === "oval"
                      ? "h-9 w-7 rounded-[50%]"
                      : option.id === "arch"
                        ? "h-9 w-7 rounded-t-full rounded-b-sm"
                        : option.id === "square"
                          ? "h-8 w-8 rounded-md"
                          : "h-9 w-7 rounded-xl";

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateHeroShape(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 flex-col items-start rounded-2xl border p-3 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={`mb-2 border-2 ${shapePreviewClass}`}
                      style={{
                        borderColor: "var(--color-primary)",
                        backgroundColor:
                          "color-mix(in srgb, var(--color-primary) 18%, var(--color-background))",
                      }}
                    />
                    <span className="text-xs font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-0.5 text-[11px] leading-snug opacity-75">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Dekorasi Foto Hero</p>
            <p className="mt-0.5 text-xs opacity-75">
              Tambahkan bingkai ganda, ornamen daun &amp; bunga, atau bingkai
              sudut di sekitar foto Hero.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HERO_DECORATION_OPTIONS.map((option) => {
                const currentDecoration =
                  theme.layout.heroDecoration ?? "floral-corner";
                const isSelected = currentDecoration === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateHeroDecoration(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 flex-col items-start rounded-2xl border p-3.5 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <span className="text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed opacity-75">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Transisi Galeri Foto</p>
            <p className="mt-0.5 text-xs opacity-75">
              Pilih gaya perpindahan slide pada bagian Galeri Foto. Bisa diuji
              langsung di tab Pratinjau.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GALLERY_TRANSITION_OPTIONS.map((option) => {
                const currentTransition =
                  theme.layout.galleryTransition ?? "fade";
                const isSelected = currentTransition === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateGalleryTransition(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 flex-col items-start rounded-2xl border p-3.5 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                      {isSelected ? (
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-background)",
                          }}
                        >
                          Aktif
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-1 text-xs leading-relaxed opacity-75">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Dekorasi Latar Undangan</p>
            <p className="mt-0.5 text-xs opacity-75">
              Tambahkan motif halus di latar belakang undangan agar tidak polos.
              Warna motif otomatis menyesuaikan palet tema aktif.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BACKGROUND_PATTERN_OPTIONS.map((option) => {
                const currentPattern = theme.layout.backgroundPattern ?? "none";
                const isSelected = currentPattern === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateBackgroundPattern(option.id)}
                    aria-pressed={isSelected}
                    className="flex min-h-11 items-start gap-3 rounded-2xl border p-3.5 text-left transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-secondary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <BackgroundPatternIcon variant={option.id} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                        {isSelected ? (
                          <span
                            className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: "var(--color-primary)",
                              color: "var(--color-background)",
                            }}
                          >
                            Aktif
                          </span>
                        ) : null}
                      </div>
                      <span className="mt-1 block text-xs leading-relaxed opacity-75">
                        {option.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-secondary) 40%, var(--color-background))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <div>
              <p className="text-sm font-semibold">Ornamen Pemisah</p>
              <p className="mt-0.5 text-xs opacity-75">
                Menampilkan garis dan ikon pemisah dekoratif di setiap section.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme.ornaments}
              aria-label="Aktifkan ornamen pemisah"
              onClick={() =>
                onChange({ ...theme, ornaments: !theme.ornaments })
              }
              className="inline-flex min-h-11 min-w-28 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                backgroundColor: theme.ornaments
                  ? "var(--color-primary)"
                  : "var(--color-background)",
                borderColor: "var(--color-primary)",
                color: theme.ornaments
                  ? "var(--color-background)"
                  : "var(--color-text)",
              }}
            >
              {theme.ornaments ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverLayoutIcon({ variant }: { variant: CoverLayoutOption }) {
  const baseStyle = {
    borderColor: "var(--color-primary)",
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 12%, var(--color-background))",
  };

  if (variant === "minimal") {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-8 flex-col items-center justify-center gap-1 rounded-md border border-dashed"
        style={baseStyle}
      >
        <span
          className="h-2.5 w-px"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <span
          className="h-0.5 w-4 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
        <span
          className="h-0.5 w-3 rounded-full opacity-60"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </span>
    );
  }

  if (variant === "framed") {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-8 items-center justify-center rounded-md border-2 p-0.5"
        style={baseStyle}
      >
        <span
          className="h-full w-full rounded-sm border"
          style={{ borderColor: "var(--color-primary)" }}
        />
      </span>
    );
  }

  if (variant === "arch-photo") {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-8 flex-col items-center justify-center gap-1 rounded-md border p-1"
        style={baseStyle}
      >
        <span
          className="h-5 w-4 rounded-t-full rounded-b-[2px] border"
          style={{
            borderColor: "var(--color-primary)",
            backgroundColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        />
        <span
          className="h-0.5 w-4 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      </span>
    );
  }

  if (variant === "full-bleed") {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-8 flex-col justify-end overflow-hidden rounded-md border"
        style={{
          borderColor: "var(--color-primary)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, var(--color-background) 85%)",
        }}
      >
        <span
          className="mx-auto mb-1.5 h-0.5 w-4 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-8 flex-col items-center justify-center gap-1 rounded-md border p-1"
      style={baseStyle}
    >
      <span
        className="h-0.5 w-4 rounded-full"
        style={{ backgroundColor: "var(--color-accent)" }}
      />
      <span
        className="h-2.5 w-5 rounded-[3px] border"
        style={{ borderColor: "var(--color-primary)" }}
      />
    </span>
  );
}

function BackgroundPatternIcon({
  variant,
}: {
  variant: BackgroundPatternOption;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border"
      style={{
        borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
        backgroundColor: "var(--color-background)",
        color: "var(--color-primary)",
      }}
    >
      {variant === "botanical-corners" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="none">
          <path
            d="M2 2C10 6 14 12 18 19"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M8 7C5 11 5 15 8 17C11 15 12 11 11 8"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M30 38C22 34 18 28 14 21"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ) : variant === "paper-linen" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="none">
          <path
            d="M0 10H32M0 20H32M0 30H32M8 0V40M16 0V40M24 0V40"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="2 3"
            opacity="0.75"
          />
        </svg>
      ) : variant === "editorial-frame" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="none">
          <rect
            x="3"
            y="3"
            width="26"
            height="34"
            rx="2"
            stroke="currentColor"
            strokeWidth="1"
          />
          <rect
            x="6"
            y="6"
            width="20"
            height="28"
            rx="1"
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.7"
          />
        </svg>
      ) : variant === "kawung-classic" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="none">
          <ellipse cx="16" cy="12" rx="3.5" ry="6.5" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="16" cy="28" rx="3.5" ry="6.5" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="8" cy="20" rx="6.5" ry="3.5" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="24" cy="20" rx="6.5" ry="3.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="16" cy="20" r="1.4" fill="currentColor" />
        </svg>
      ) : variant === "layered-arch" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="none">
          <path
            d="M5 36V16C5 9 10 4 16 4C22 4 27 9 27 16V36"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <path
            d="M8.5 36V17C8.5 11.5 11.8 7.5 16 7.5C20.2 7.5 23.5 11.5 23.5 17V36"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </svg>
      ) : variant === "celestial-dots" ? (
        <svg viewBox="0 0 32 40" className="h-full w-full" fill="currentColor">
          <path d="M11 8L12 11L15 12L12 13L11 16L10 13L7 12L10 11Z" />
          <path d="M22 24L22.8 26.2L25 27L22.8 27.8L22 30L21.2 27.8L19 27L21.2 26.2Z" />
          <circle cx="23" cy="11" r="1.2" opacity="0.7" />
          <circle cx="10" cy="29" r="1.2" opacity="0.7" />
          <circle cx="16" cy="20" r="1" opacity="0.55" />
        </svg>
      ) : (
        <span className="h-2 w-2 rounded-full opacity-25" style={{ backgroundColor: "currentColor" }} />
      )}
    </span>
  );
}
