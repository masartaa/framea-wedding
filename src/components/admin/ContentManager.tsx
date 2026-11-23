"use client";

import { useState, type FormEvent } from "react";
import {
  DEFAULT_SITE_CONFIG,
  getInvitationEvents,
  SECTION_LABELS,
  siteConfigSchema,
  syncPrimaryEventToGeneral,
  type EventItem,
  type SiteConfig,
} from "@/lib/config-schema";
import { formatEventDateFull } from "@/lib/format";
import { isVercelBlobUrl } from "@/lib/media-utils";
import { EventsManager } from "./EventsManager";
import { GuestsManager } from "./GuestsManager";
import { InvitationPreview } from "./InvitationPreview";
import { MediaManager } from "./MediaManager";
import { ThemeEditor } from "./ThemeEditor";
import { WishesModerator } from "./WishesModerator";

type ActiveTab =
  | "umum"
  | "acara"
  | "mempelai"
  | "media"
  | "section"
  | "tema"
  | "tamu"
  | "ucapan"
  | "pratinjau";

interface ContentManagerProps {
  initialConfig: SiteConfig;
  initialSource: "database" | "default";
  initialUpdatedAt: string | null;
}

interface SaveResponseBody {
  ok?: boolean;
  config?: SiteConfig;
  updatedAt?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const TABS: ReadonlyArray<{ id: ActiveTab; label: string }> = [
  { id: "umum", label: "Umum" },
  { id: "acara", label: "Acara" },
  { id: "mempelai", label: "Mempelai" },
  { id: "media", label: "Media" },
  { id: "tema", label: "Tema" },
  { id: "section", label: "Section" },
  { id: "tamu", label: "Tamu" },
  { id: "ucapan", label: "Ucapan" },
  { id: "pratinjau", label: "Pratinjau" },
];

function normalizeConfigWithEvents(config: SiteConfig): SiteConfig {
  const events = getInvitationEvents(config);
  return {
    ...config,
    events,
    general: syncPrimaryEventToGeneral(events, config.general),
  };
}

function formatUpdatedAt(isoString: string | null): string | null {
  if (!isoString) {
    return null;
  }

  const parsedDate = new Date(isoString);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
}

function getTabForFieldPath(path: string): ActiveTab {
  if (
    path.startsWith("events") ||
    path.startsWith("general.event") ||
    path.startsWith("general.venue") ||
    path === "general.mapsUrl"
  ) {
    return "acara";
  }
  if (path.startsWith("media") || path.endsWith(".photoUrl")) {
    return "media";
  }
  if (path.startsWith("theme")) {
    return "tema";
  }
  if (path.startsWith("sections")) {
    return "section";
  }
  if (
    path.startsWith("couple.introText") ||
    path.includes(".fullName") ||
    path.includes(".fatherName") ||
    path.includes(".motherName")
  ) {
    return "mempelai";
  }
  return "umum";
}

function collectBlobUrls(config: SiteConfig): Set<string> {
  const urls = [
    config.media.heroPhotoUrl,
    config.media.musicUrl,
    config.couple.groom.photoUrl,
    config.couple.bride.photoUrl,
    ...config.media.galleryPhotoUrls,
  ];
  return new Set(urls.filter((url) => isVercelBlobUrl(url)));
}

export function ContentManager({
  initialConfig,
  initialSource,
  initialUpdatedAt,
}: ContentManagerProps) {
  const normalizedInitial = normalizeConfigWithEvents(initialConfig);

  const [activeTab, setActiveTab] = useState<ActiveTab>("umum");
  const [draft, setDraft] = useState<SiteConfig>(normalizedInitial);
  const [savedConfig, setSavedConfig] =
    useState<SiteConfig>(normalizedInitial);
  const [source, setSource] = useState<"database" | "default">(initialSource);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedConfig);
  const formattedUpdated = formatUpdatedAt(updatedAt);
  const activeSectionCount = draft.sections.filter((s) => s.enabled).length;
  const isDirectActionTab = activeTab === "tamu" || activeTab === "ucapan";

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!(key in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateGeneral = <K extends keyof SiteConfig["general"]>(
    key: K,
    value: SiteConfig["general"][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value,
      },
    }));
    clearFieldError(`general.${key}`);
  };

  const updateEvents = (nextEvents: EventItem[]) => {
    setDraft((prev) => ({
      ...prev,
      events: nextEvents,
      general: syncPrimaryEventToGeneral(nextEvents, prev.general),
    }));
  };

  const updatePerson = <K extends keyof SiteConfig["couple"]["groom"]>(
    who: "groom" | "bride",
    key: K,
    value: SiteConfig["couple"]["groom"][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        [who]: {
          ...prev.couple[who],
          [key]: value,
        },
      },
    }));
    clearFieldError(`couple.${who}.${key}`);
  };

  const toggleSection = (index: number) => {
    setDraft((prev) => {
      const target = prev.sections[index];
      if (!target) {
        return prev;
      }

      const currentlyEnabledCount = prev.sections.filter(
        (item) => item.enabled
      ).length;
      if (target.enabled && currentlyEnabledCount <= 1) {
        setStatusBanner({
          type: "error",
          message: "Minimal 1 section harus tetap aktif.",
        });
        return prev;
      }

      const nextSections = prev.sections.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item
      );
      return { ...prev, sections: nextSections };
    });
    clearFieldError("sections");
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    setDraft((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.sections.length) {
        return prev;
      }
      const nextSections = [...prev.sections];
      const [moved] = nextSections.splice(index, 1);
      if (!moved) {
        return prev;
      }
      nextSections.splice(targetIndex, 0, moved);
      return { ...prev, sections: nextSections };
    });
  };

  const cleanupRemovedBlobs = (previous: SiteConfig, next: SiteConfig) => {
    const prevUrls = collectBlobUrls(previous);
    const nextUrls = collectBlobUrls(next);

    for (const url of prevUrls) {
      if (!nextUrls.has(url)) {
        void fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }).catch(() => undefined);
      }
    }
  };

  const persistConfig = async (
    payload: SiteConfig,
    successMessage: string
  ) => {
    setStatusBanner(null);

    const normalizedPayload = normalizeConfigWithEvents(payload);
    const clientCheck = siteConfigSchema.safeParse(normalizedPayload);
    if (!clientCheck.success) {
      const errors: Record<string, string> = {};
      for (const issue of clientCheck.error.issues) {
        const pathKey = issue.path.map(String).join(".") || "form";
        if (!errors[pathKey]) {
          errors[pathKey] = issue.message;
        }
      }
      setFieldErrors(errors);
      const firstPath = Object.keys(errors)[0] ?? "";
      setActiveTab(getTabForFieldPath(firstPath));
      setStatusBanner({
        type: "error",
        message:
          clientCheck.error.issues[0]?.message ??
          "Mohon periksa kembali isian yang ditandai.",
      });
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientCheck.data),
      });

      const data = (await response.json()) as SaveResponseBody;

      if (!response.ok || !data.config) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          const firstPath = Object.keys(data.fieldErrors)[0] ?? "";
          setActiveTab(getTabForFieldPath(firstPath));
        }
        setStatusBanner({
          type: "error",
          message: data.error ?? "Gagal menyimpan perubahan. Silakan coba lagi.",
        });
        return;
      }

      const normalizedSaved = normalizeConfigWithEvents(data.config);
      cleanupRemovedBlobs(savedConfig, normalizedSaved);

      setDraft(normalizedSaved);
      setSavedConfig(normalizedSaved);
      setSource("database");
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setShowResetConfirm(false);
      setStatusBanner({
        type: "success",
        message: successMessage,
      });
    } catch {
      setStatusBanner({
        type: "error",
        message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persistConfig(
      draft,
      "Perubahan berhasil disimpan dan langsung dipublikasikan ke halaman undangan."
    );
  };

  const handleConfirmReset = async () => {
    await persistConfig(
      DEFAULT_SITE_CONFIG,
      "Konfigurasi berhasil dikembalikan ke pengaturan default (Putih & Emas)."
    );
  };

  const inputClassName =
    "mt-1.5 min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2";
  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section
        className="rounded-3xl border px-5 py-5 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium tracking-[0.18em] uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Pengelolaan Undangan
            </p>
            <h1 className="font-heading mt-1 text-2xl font-semibold">
              Dashboard Framea
            </h1>
          </div>

          <div className="text-left text-xs sm:text-right">
            <p className="opacity-75">
              Sumber:{" "}
              <span
                className="font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                {source === "database"
                  ? "Database Neon"
                  : "Default (belum tersimpan)"}
              </span>
            </p>
            {formattedUpdated ? (
              <p className="mt-0.5 opacity-70">
                Terakhir disimpan: {formattedUpdated} WIB
              </p>
            ) : null}
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Menu pengaturan undangan"
          className="mt-5 grid grid-cols-3 gap-2 rounded-2xl p-1.5 sm:grid-cols-5 lg:grid-cols-9"
          style={{
            backgroundColor: "var(--color-secondary)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="min-h-11 cursor-pointer rounded-xl px-2 text-xs font-medium transition-colors sm:text-sm"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-background)"
                    : "var(--color-text)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {statusBanner && !isDirectActionTab ? (
        <div
          role={statusBanner.type === "error" ? "alert" : "status"}
          className="rounded-2xl border px-4 py-3.5 text-sm font-medium"
          style={{
            backgroundColor:
              statusBanner.type === "success"
                ? "var(--color-secondary)"
                : "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
            borderColor:
              statusBanner.type === "success"
                ? "var(--color-primary)"
                : "var(--color-accent)",
            color:
              statusBanner.type === "success"
                ? "var(--color-text)"
                : "var(--color-accent)",
          }}
        >
          {statusBanner.message}
        </div>
      ) : null}

      {activeTab === "umum" ? (
        <section
          aria-label="Pengaturan Umum"
          className="space-y-5 rounded-3xl border px-5 py-6 sm:px-6"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Informasi Umum &amp; Sapaan
            </h2>
            <p className="mt-0.5 text-sm opacity-75">
              Mengatur nama panggilan di sampul/hero serta kalimat pembuka dan
              penutup undangan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="umum-groom-nickname"
                className="block text-sm font-medium"
              >
                Nama Panggilan Mempelai Pria
              </label>
              <input
                id="umum-groom-nickname"
                type="text"
                maxLength={40}
                value={draft.couple.groom.nickname}
                onChange={(event) =>
                  updatePerson("groom", "nickname", event.target.value)
                }
                className={inputClassName}
                style={inputStyle}
              />
              <FieldError message={fieldErrors["couple.groom.nickname"]} />
            </div>

            <div>
              <label
                htmlFor="umum-bride-nickname"
                className="block text-sm font-medium"
              >
                Nama Panggilan Mempelai Wanita
              </label>
              <input
                id="umum-bride-nickname"
                type="text"
                maxLength={40}
                value={draft.couple.bride.nickname}
                onChange={(event) =>
                  updatePerson("bride", "nickname", event.target.value)
                }
                className={inputClassName}
                style={inputStyle}
              />
              <FieldError message={fieldErrors["couple.bride.nickname"]} />
            </div>
          </div>

          {/* Ringkasan Jadwal Acara + Pintasan ke Tab Acara */}
          <div
            className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            <div>
              <p
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                Rangkaian Acara ({draft.events.length})
              </p>
              <p className="mt-1 text-sm font-medium">
                {draft.general.eventTitle} ·{" "}
                {formatEventDateFull(draft.general.eventDate)}
              </p>
              <p className="text-xs opacity-75">
                {draft.general.eventTimeStart}–{draft.general.eventTimeEnd}{" "}
                {draft.general.eventTimezone} · {draft.general.venueName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("acara")}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-semibold"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-primary)",
              }}
            >
              Atur / Tambah Acara →
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="general-opening-text"
                className="block text-sm font-medium"
              >
                Kalimat Pembuka
              </label>
              <span className="text-xs opacity-60">
                {draft.general.openingText.length}/500
              </span>
            </div>
            <textarea
              id="general-opening-text"
              rows={3}
              maxLength={500}
              value={draft.general.openingText}
              onChange={(event) =>
                updateGeneral("openingText", event.target.value)
              }
              className={inputClassName}
              style={inputStyle}
            />
            <FieldError message={fieldErrors["general.openingText"]} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="general-closing-text"
                className="block text-sm font-medium"
              >
                Kalimat Penutup
              </label>
              <span className="text-xs opacity-60">
                {draft.general.closingText.length}/500
              </span>
            </div>
            <textarea
              id="general-closing-text"
              rows={3}
              maxLength={500}
              value={draft.general.closingText}
              onChange={(event) =>
                updateGeneral("closingText", event.target.value)
              }
              className={inputClassName}
              style={inputStyle}
            />
            <FieldError message={fieldErrors["general.closingText"]} />
          </div>
        </section>
      ) : null}

      {activeTab === "acara" ? (
        <EventsManager
          events={draft.events}
          fieldErrors={fieldErrors}
          onChangeEvents={updateEvents}
          onClearError={clearFieldError}
        />
      ) : null}

      {activeTab === "mempelai" ? (
        <section
          aria-label="Pengaturan Mempelai"
          className="space-y-5 rounded-3xl border px-5 py-6 sm:px-6"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Data Kedua Mempelai
            </h2>
            <p className="mt-0.5 text-sm opacity-75">
              Mengatur teks pengantar, nama lengkap, dan nama orang tua. Untuk
              mengunggah foto mempelai, buka tab <strong>Media</strong>.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="couple-intro-text"
                className="block text-sm font-medium"
              >
                Teks Pengantar Mempelai
              </label>
              <span className="text-xs opacity-60">
                {draft.couple.introText.length}/300
              </span>
            </div>
            <textarea
              id="couple-intro-text"
              rows={3}
              maxLength={300}
              value={draft.couple.introText}
              onChange={(event) => {
                setDraft((prev) => ({
                  ...prev,
                  couple: { ...prev.couple, introText: event.target.value },
                }));
                clearFieldError("couple.introText");
              }}
              className={inputClassName}
              style={inputStyle}
            />
            <FieldError message={fieldErrors["couple.introText"]} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {(
              [
                { key: "groom", title: "Mempelai Pria" },
                { key: "bride", title: "Mempelai Wanita" },
              ] as const
            ).map(({ key, title }) => {
              const person = draft.couple[key];
              return (
                <div
                  key={key}
                  className="space-y-3.5 rounded-2xl border p-4"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                  }}
                >
                  <h3 className="font-heading text-base font-semibold">
                    {title}
                  </h3>

                  <div>
                    <label
                      htmlFor={`couple-${key}-nickname`}
                      className="block text-sm font-medium"
                    >
                      Nama Panggilan
                    </label>
                    <input
                      id={`couple-${key}-nickname`}
                      type="text"
                      maxLength={40}
                      value={person.nickname}
                      onChange={(event) =>
                        updatePerson(key, "nickname", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      message={fieldErrors[`couple.${key}.nickname`]}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`couple-${key}-fullname`}
                      className="block text-sm font-medium"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id={`couple-${key}-fullname`}
                      type="text"
                      maxLength={120}
                      value={person.fullName}
                      onChange={(event) =>
                        updatePerson(key, "fullName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      message={fieldErrors[`couple.${key}.fullName`]}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`couple-${key}-father`}
                      className="block text-sm font-medium"
                    >
                      Nama Ayah
                    </label>
                    <input
                      id={`couple-${key}-father`}
                      type="text"
                      maxLength={120}
                      value={person.fatherName}
                      onChange={(event) =>
                        updatePerson(key, "fatherName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      message={fieldErrors[`couple.${key}.fatherName`]}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`couple-${key}-mother`}
                      className="block text-sm font-medium"
                    >
                      Nama Ibu
                    </label>
                    <input
                      id={`couple-${key}-mother`}
                      type="text"
                      maxLength={120}
                      value={person.motherName}
                      onChange={(event) =>
                        updatePerson(key, "motherName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      message={fieldErrors[`couple.${key}.motherName`]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeTab === "media" ? (
        <MediaManager
          config={draft}
          onChangeHeroPhoto={(url) =>
            setDraft((prev) => ({
              ...prev,
              media: { ...prev.media, heroPhotoUrl: url },
            }))
          }
          onChangeCouplePhoto={(who, url) => updatePerson(who, "photoUrl", url)}
          onChangeGallery={(urls) =>
            setDraft((prev) => ({
              ...prev,
              media: { ...prev.media, galleryPhotoUrls: urls },
            }))
          }
          onChangeMusic={(musicUrl, musicPreset) =>
            setDraft((prev) => ({
              ...prev,
              media: { ...prev.media, musicUrl, musicPreset },
            }))
          }
        />
      ) : null}

      {activeTab === "section" ? (
        <section
          aria-label="Pengaturan Section"
          className="space-y-4 rounded-3xl border px-5 py-6 sm:px-6"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Urutan &amp; Tampilan Section
              </h2>
              <p className="mt-0.5 text-sm opacity-75">
                Aktif/nonaktifkan bagian yang tampil di undangan dan atur
                urutannya.
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-accent)",
              }}
            >
              {activeSectionCount} dari {draft.sections.length} aktif
            </span>
          </div>

          <FieldError message={fieldErrors["sections"]} />

          <div className="space-y-3">
            {draft.sections.map((section, index) => {
              const meta = SECTION_LABELS[section.id];
              const isFirst = index === 0;
              const isLast = index === draft.sections.length - 1;

              return (
                <div
                  key={section.id}
                  className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    backgroundColor: section.enabled
                      ? "color-mix(in srgb, var(--color-secondary) 40%, var(--color-background))"
                      : "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                    opacity: section.enabled ? 1 : 0.72,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{meta.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed opacity-75">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={section.enabled}
                      onClick={() => toggleSection(index)}
                      className="inline-flex min-h-11 min-w-24 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: section.enabled
                          ? "var(--color-primary)"
                          : "var(--color-background)",
                        borderColor: "var(--color-primary)",
                        color: section.enabled
                          ? "var(--color-background)"
                          : "var(--color-text)",
                      }}
                    >
                      {section.enabled ? "Aktif" : "Nonaktif"}
                    </button>

                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveSection(index, -1)}
                      aria-label={`Naikkan ${meta.label}`}
                      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border text-base font-medium disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveSection(index, 1)}
                      aria-label={`Turunkan ${meta.label}`}
                      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border text-base font-medium disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeTab === "tema" ? (
        <ThemeEditor
          theme={draft.theme}
          fieldErrors={fieldErrors}
          onChange={(nextTheme) =>
            setDraft((prev) => ({ ...prev, theme: nextTheme }))
          }
          onClearError={clearFieldError}
        />
      ) : null}

      {activeTab === "tamu" ? <GuestsManager config={savedConfig} /> : null}

      {activeTab === "ucapan" ? <WishesModerator /> : null}

      {activeTab === "pratinjau" ? <InvitationPreview config={draft} /> : null}

      {!isDirectActionTab ? (
        <section
          className="rounded-3xl border px-5 py-4 sm:px-6"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {isDirty ? (
                <p
                  className="font-medium"
                  style={{ color: "var(--color-accent)" }}
                >
                  Ada perubahan yang belum disimpan.
                </p>
              ) : (
                <p className="opacity-75">Semua perubahan sudah tersimpan.</p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowResetConfirm((prev) => !prev)}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 55%, transparent)",
                  color: "var(--color-text)",
                }}
              >
                Reset ke default
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-7 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan & Publikasikan"}
              </button>
            </div>
          </div>

          {showResetConfirm ? (
            <div
              className="mt-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor: "var(--color-primary)",
              }}
            >
              <p className="text-sm leading-relaxed">
                Yakin ingin mengembalikan seluruh konten, acara, media, urutan
                section, dan tema ke pengaturan default (Putih &amp; Emas)?
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowResetConfirm(false)}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmReset}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-background)",
                  }}
                >
                  {isSaving ? "Mereset..." : "Ya, Reset"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : isDirty ? (
        <div
          className="rounded-2xl border px-4 py-3 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor: "var(--color-primary)",
          }}
        >
          Pengingat: Anda masih memiliki perubahan konten/acara/tema yang belum
          disimpan di tab lain.
        </div>
      ) : null}
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="mt-1 text-xs font-medium"
      style={{ color: "var(--color-accent)" }}
    >
      {message}
    </p>
  );
}
