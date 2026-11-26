"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  DEFAULT_SITE_CONFIG,
  ensureAllSections,
  getInvitationEvents,
  SECTION_LABELS,
  siteConfigSchema,
  syncPrimaryEventToGeneral,
  type EventItem,
  type SectionId,
  type SiteConfig,
} from "@/lib/config-schema";
import { formatEventDateFull } from "@/lib/format";
import { isVercelBlobUrl } from "@/lib/media-utils";
import { EventsManager } from "./EventsManager";
import { GuestsManager } from "./GuestsManager";
import { InvitationPreview } from "./InvitationPreview";
import { MediaManager } from "./MediaManager";
import { RsvpManager } from "./RsvpManager";
import { StoryManager } from "./StoryManager";
import { ThemeEditor } from "./ThemeEditor";
import { WishesModerator } from "./WishesModerator";

type ActiveTab =
  | "umum"
  | "acara"
  | "mempelai"
  | "kisah"
  | "media"
  | "section"
  | "tema"
  | "tamu"
  | "rsvp"
  | "ucapan"
  | "pratinjau";

interface ContentManagerProps {
  invitationSlug: string;
  invitationLabel: string;
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

const TABS: ReadonlyArray<{
  id: ActiveTab;
  label: string;
  sectionId?: SectionId;
}> = [
  { id: "umum", label: "Umum" },
  { id: "acara", label: "Acara", sectionId: "acara" },
  { id: "mempelai", label: "Mempelai", sectionId: "mempelai" },
  { id: "kisah", label: "Kisah", sectionId: "kisah" },
  { id: "media", label: "Media" },
  { id: "tema", label: "Tema" },
  { id: "section", label: "Section" },
  { id: "tamu", label: "Tamu" },
  { id: "rsvp", label: "RSVP", sectionId: "rsvp" },
  { id: "ucapan", label: "Ucapan", sectionId: "ucapan" },
  { id: "pratinjau", label: "Pratinjau" },
];

function normalizeConfigWithEvents(config: SiteConfig): SiteConfig {
  const events = getInvitationEvents(config);
  return {
    ...config,
    events,
    sections: ensureAllSections(config.sections),
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
  if (path.startsWith("story")) {
    return "kisah";
  }
  if (path.startsWith("rsvp")) {
    return "rsvp";
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
    path.includes(".motherName") ||
    path.includes(".instagram") ||
    path.includes(".showInstagram")
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
    ...config.story.items.map((item) => item.photoUrl ?? ""),
  ];
  return new Set(urls.filter((url) => isVercelBlobUrl(url)));
}

export function ContentManager({
  invitationSlug,
  invitationLabel,
  initialConfig,
  initialSource,
  initialUpdatedAt,
}: ContentManagerProps) {
  const encodedSlug = encodeURIComponent(invitationSlug);
  const configEndpoint = `/api/admin/invitations/${encodedSlug}/config`;
  const backupEndpoint = `/api/admin/invitations/${encodedSlug}/backup`;

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
  const tabButtonRefs = useRef<Partial<Record<ActiveTab, HTMLButtonElement | null>>>(
    {}
  );
  const panelTopRef = useRef<HTMLDivElement | null>(null);

  const sectionEnabledMap = new Map(
    draft.sections.map((section) => [section.id, section.enabled])
  );

  const isTabDisabled = (
    tabId: ActiveTab,
    sectionsSource: SiteConfig["sections"] = draft.sections
  ): boolean => {
    const tab = TABS.find((item) => item.id === tabId);
    if (!tab?.sectionId) {
      return false;
    }
    if (sectionsSource === draft.sections) {
      return sectionEnabledMap.get(tab.sectionId) === false;
    }
    return (
      sectionsSource.find((section) => section.id === tab.sectionId)
        ?.enabled === false
    );
  };

  const disabledTabCount = TABS.filter((tab) => isTabDisabled(tab.id)).length;
  const effectiveActiveTab: ActiveTab = isTabDisabled(activeTab)
    ? "umum"
    : activeTab;
  const isAcaraDisabled = isTabDisabled("acara");

  const selectTab = (nextTab: ActiveTab) => {
    if (isTabDisabled(nextTab)) {
      return;
    }
    setActiveTab(nextTab);
    tabButtonRefs.current[nextTab]?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
    });

    if (panelTopRef.current) {
      const rect = panelTopRef.current.getBoundingClientRect();
      if (rect.top < 16) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        panelTopRef.current.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    }
  };

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    tabId: ActiveTab
  ) => {
    const enabledTabs = TABS.filter((tab) => !isTabDisabled(tab.id));
    if (enabledTabs.length === 0) {
      return;
    }

    const currentEnabledIndex = enabledTabs.findIndex(
      (tab) => tab.id === tabId
    );
    let nextEnabledIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextEnabledIndex =
        currentEnabledIndex === -1
          ? 0
          : (currentEnabledIndex + 1) % enabledTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextEnabledIndex =
        currentEnabledIndex === -1
          ? enabledTabs.length - 1
          : (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (event.key === "Home") {
      nextEnabledIndex = 0;
    } else if (event.key === "End") {
      nextEnabledIndex = enabledTabs.length - 1;
    }

    if (nextEnabledIndex === null) {
      return;
    }

    event.preventDefault();
    const nextTab = enabledTabs[nextEnabledIndex];
    if (nextTab) {
      selectTab(nextTab.id);
      tabButtonRefs.current[nextTab.id]?.focus();
    }
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedConfig);
  const formattedUpdated = formatUpdatedAt(updatedAt);
  const activeSectionCount = draft.sections.filter((s) => s.enabled).length;
  const isDirectActionTab =
    effectiveActiveTab === "tamu" || effectiveActiveTab === "ucapan";

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
      const errorTab = getTabForFieldPath(firstPath);
      setActiveTab(
        isTabDisabled(errorTab, normalizedPayload.sections)
          ? "section"
          : errorTab
      );
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
      const response = await fetch(configEndpoint, {
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
          const errorTab = getTabForFieldPath(firstPath);
          setActiveTab(
            isTabDisabled(errorTab, normalizedPayload.sections)
              ? "section"
              : errorTab
          );
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

  const handleExportConfigJson = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(savedConfig, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `framea-${invitationSlug}-config-${dateStamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImportConfigJson = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setStatusBanner(null);
    try {
      const text = await file.text();
      const raw: unknown = JSON.parse(text);
      const candidate =
        typeof raw === "object" &&
        raw !== null &&
        "siteConfig" in raw &&
        typeof (raw as { siteConfig?: unknown }).siteConfig === "object"
          ? (raw as { siteConfig: unknown }).siteConfig
          : raw;

      const parsed = siteConfigSchema.safeParse(candidate);
      if (!parsed.success) {
        const firstIssue =
          parsed.error.issues[0]?.message ?? "Struktur JSON tidak sesuai.";
        setStatusBanner({
          type: "error",
          message: `Berkas cadangan tidak valid: ${firstIssue}`,
        });
        return;
      }

      const normalized = normalizeConfigWithEvents(parsed.data);
      setDraft(normalized);
      setFieldErrors({});
      setStatusBanner({
        type: "success",
        message:
          'Konfigurasi dari berkas JSON berhasil dimuat ke draft. Periksa di tab Pratinjau lalu klik "Simpan & Publikasikan" untuk menerapkannya.',
      });
    } catch {
      setStatusBanner({
        type: "error",
        message:
          "Berkas tidak dapat dibaca. Pastikan Anda memilih file cadangan JSON yang valid.",
      });
    }
  };

  const inputClassName =
    "mt-1.5 min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors";
  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 pb-28 sm:pb-24">
      <section
        className="rounded-2xl border px-5 py-5 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Undangan · /{invitationSlug}
            </p>
            <h1 className="font-heading mt-1 text-2xl font-semibold">
              {invitationLabel}
            </h1>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Link
              href={`/${invitationSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-opacity hover:opacity-85 active:opacity-75"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 45%, transparent)",
              }}
            >
              Buka /{invitationSlug}
            </Link>
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
                <p className="mt-0.5 opacity-75">
                  Terakhir disimpan: {formattedUpdated} WIB
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {disabledTabCount > 0 ? (
          <p
            className="mt-4 border-t pt-3 text-xs opacity-75"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 20%, transparent)",
            }}
          >
            Menu yang dicoret pada navigasi bawah sedang nonaktif mengikuti
            pengaturan di tab Section. Aktifkan kembali di tab Section untuk
            mengeditnya.
          </p>
        ) : null}
      </section>

      <div
        ref={panelTopRef}
        role="tabpanel"
        id={`panel-${effectiveActiveTab}`}
        aria-labelledby={`tab-${effectiveActiveTab}`}
        className="scroll-mt-4"
      >
      {effectiveActiveTab === "umum" ? (
        <section
          aria-label="Pengaturan Umum"
          className="space-y-5 rounded-2xl border px-5 py-6 sm:px-6"
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
                aria-invalid={
                  fieldErrors["couple.groom.nickname"] ? true : undefined
                }
                aria-describedby={
                  fieldErrors["couple.groom.nickname"]
                    ? "err-umum-groom-nickname"
                    : undefined
                }
                value={draft.couple.groom.nickname}
                onChange={(event) =>
                  updatePerson("groom", "nickname", event.target.value)
                }
                className={inputClassName}
                style={inputStyle}
              />
              <FieldError
                id="err-umum-groom-nickname"
                message={fieldErrors["couple.groom.nickname"]}
              />
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
                aria-invalid={
                  fieldErrors["couple.bride.nickname"] ? true : undefined
                }
                aria-describedby={
                  fieldErrors["couple.bride.nickname"]
                    ? "err-umum-bride-nickname"
                    : undefined
                }
                value={draft.couple.bride.nickname}
                onChange={(event) =>
                  updatePerson("bride", "nickname", event.target.value)
                }
                className={inputClassName}
                style={inputStyle}
              />
              <FieldError
                id="err-umum-bride-nickname"
                message={fieldErrors["couple.bride.nickname"]}
              />
            </div>
          </div>

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
                className="text-xs font-semibold"
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
              disabled={isAcaraDisabled}
              title={
                isAcaraDisabled
                  ? "Section Acara sedang nonaktif. Aktifkan di tab Section terlebih dahulu."
                  : undefined
              }
              onClick={() => selectTab("acara")}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-45 disabled:hover:bg-[var(--color-background)]"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-primary)",
              }}
            >
              {isAcaraDisabled ? "Section Acara Nonaktif" : "Atur Acara"}
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
              <span className="text-xs opacity-75">
                {draft.general.openingText.length}/500
              </span>
            </div>
            <textarea
              id="general-opening-text"
              rows={3}
              maxLength={500}
              aria-invalid={
                fieldErrors["general.openingText"] ? true : undefined
              }
              aria-describedby={
                fieldErrors["general.openingText"]
                  ? "err-general-opening-text"
                  : undefined
              }
              value={draft.general.openingText}
              onChange={(event) =>
                updateGeneral("openingText", event.target.value)
              }
              className={inputClassName}
              style={inputStyle}
            />
            <FieldError
              id="err-general-opening-text"
              message={fieldErrors["general.openingText"]}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="general-closing-text"
                className="block text-sm font-medium"
              >
                Kalimat Penutup
              </label>
              <span className="text-xs opacity-75">
                {draft.general.closingText.length}/500
              </span>
            </div>
            <textarea
              id="general-closing-text"
              rows={3}
              maxLength={500}
              aria-invalid={
                fieldErrors["general.closingText"] ? true : undefined
              }
              aria-describedby={
                fieldErrors["general.closingText"]
                  ? "err-general-closing-text"
                  : undefined
              }
              value={draft.general.closingText}
              onChange={(event) =>
                updateGeneral("closingText", event.target.value)
              }
              className={inputClassName}
              style={inputStyle}
            />
            <FieldError
              id="err-general-closing-text"
              message={fieldErrors["general.closingText"]}
            />
          </div>
        </section>
      ) : null}

      {effectiveActiveTab === "acara" ? (
        <EventsManager
          events={draft.events}
          fieldErrors={fieldErrors}
          onChangeEvents={updateEvents}
          onClearError={clearFieldError}
        />
      ) : null}

      {effectiveActiveTab === "mempelai" ? (
        <section
          aria-label="Pengaturan Mempelai"
          className="space-y-5 rounded-2xl border px-5 py-6 sm:px-6"
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
              <span className="text-xs opacity-75">
                {draft.couple.introText.length}/300
              </span>
            </div>
            <textarea
              id="couple-intro-text"
              rows={3}
              maxLength={300}
              aria-invalid={fieldErrors["couple.introText"] ? true : undefined}
              aria-describedby={
                fieldErrors["couple.introText"]
                  ? "err-couple-intro-text"
                  : undefined
              }
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
            <FieldError
              id="err-couple-intro-text"
              message={fieldErrors["couple.introText"]}
            />
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
                      aria-invalid={
                        fieldErrors[`couple.${key}.nickname`] ? true : undefined
                      }
                      aria-describedby={
                        fieldErrors[`couple.${key}.nickname`]
                          ? `err-couple-${key}-nickname`
                          : undefined
                      }
                      value={person.nickname}
                      onChange={(event) =>
                        updatePerson(key, "nickname", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      id={`err-couple-${key}-nickname`}
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
                      aria-invalid={
                        fieldErrors[`couple.${key}.fullName`] ? true : undefined
                      }
                      aria-describedby={
                        fieldErrors[`couple.${key}.fullName`]
                          ? `err-couple-${key}-fullname`
                          : undefined
                      }
                      value={person.fullName}
                      onChange={(event) =>
                        updatePerson(key, "fullName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      id={`err-couple-${key}-fullname`}
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
                      aria-invalid={
                        fieldErrors[`couple.${key}.fatherName`]
                          ? true
                          : undefined
                      }
                      aria-describedby={
                        fieldErrors[`couple.${key}.fatherName`]
                          ? `err-couple-${key}-father`
                          : undefined
                      }
                      value={person.fatherName}
                      onChange={(event) =>
                        updatePerson(key, "fatherName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      id={`err-couple-${key}-father`}
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
                      aria-invalid={
                        fieldErrors[`couple.${key}.motherName`]
                          ? true
                          : undefined
                      }
                      aria-describedby={
                        fieldErrors[`couple.${key}.motherName`]
                          ? `err-couple-${key}-mother`
                          : undefined
                      }
                      value={person.motherName}
                      onChange={(event) =>
                        updatePerson(key, "motherName", event.target.value)
                      }
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <FieldError
                      id={`err-couple-${key}-mother`}
                      message={fieldErrors[`couple.${key}.motherName`]}
                    />
                  </div>

                  <div
                    className="space-y-3 rounded-xl border p-3"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">Akun Instagram</p>
                        <p className="text-xs opacity-75">
                          Tampilkan tautan Instagram di kartu mempelai.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(person.showInstagram)}
                        aria-label={`Tampilkan akun Instagram ${title}`}
                        onClick={() =>
                          updatePerson(
                            key,
                            "showInstagram",
                            !person.showInstagram
                          )
                        }
                        className="inline-flex min-h-11 min-w-24 shrink-0 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                        style={{
                          backgroundColor: person.showInstagram
                            ? "var(--color-primary)"
                            : "var(--color-background)",
                          borderColor: "var(--color-primary)",
                          color: person.showInstagram
                            ? "var(--color-background)"
                            : "var(--color-text)",
                        }}
                      >
                        {person.showInstagram ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>

                    {person.showInstagram ? (
                      <div>
                        <label
                          htmlFor={`couple-${key}-instagram`}
                          className="block text-xs font-medium"
                        >
                          Username Instagram
                        </label>
                        <input
                          id={`couple-${key}-instagram`}
                          type="text"
                          maxLength={60}
                          placeholder="@namaakun"
                          aria-invalid={
                            fieldErrors[`couple.${key}.instagram`]
                              ? true
                              : undefined
                          }
                          aria-describedby={
                            fieldErrors[`couple.${key}.instagram`]
                              ? `err-couple-${key}-instagram`
                              : undefined
                          }
                          value={person.instagram ?? ""}
                          onChange={(event) =>
                            updatePerson(key, "instagram", event.target.value)
                          }
                          className={inputClassName}
                          style={inputStyle}
                        />
                        <FieldError
                          id={`err-couple-${key}-instagram`}
                          message={fieldErrors[`couple.${key}.instagram`]}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {effectiveActiveTab === "kisah" ? (
        <StoryManager
          invitationSlug={invitationSlug}
          story={draft.story}
          fieldErrors={fieldErrors}
          onChangeStory={(nextStory) =>
            setDraft((prev) => ({ ...prev, story: nextStory }))
          }
          onClearError={clearFieldError}
        />
      ) : null}

      {effectiveActiveTab === "media" ? (
        <MediaManager
          invitationSlug={invitationSlug}
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

      {effectiveActiveTab === "section" ? (
        <section
          aria-label="Pengaturan Section"
          className="space-y-4 rounded-2xl border px-5 py-6 sm:px-6"
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
              className="rounded-md px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-accent)",
              }}
            >
              {activeSectionCount} dari {draft.sections.length} aktif
            </span>
          </div>

          <FieldError id="err-sections" message={fieldErrors["sections"]} />

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
                    opacity: section.enabled ? 1 : 0.78,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
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
                      aria-label={`Aktifkan section ${meta.label}`}
                      onClick={() => toggleSection(index)}
                      className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
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
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
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
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
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

      {effectiveActiveTab === "tema" ? (
        <ThemeEditor
          theme={draft.theme}
          fieldErrors={fieldErrors}
          onChange={(nextTheme) =>
            setDraft((prev) => ({ ...prev, theme: nextTheme }))
          }
          onClearError={clearFieldError}
        />
      ) : null}

      {effectiveActiveTab === "tamu" ? (
        <GuestsManager invitationSlug={invitationSlug} config={savedConfig} />
      ) : null}

      {effectiveActiveTab === "rsvp" ? (
        <RsvpManager
          invitationSlug={invitationSlug}
          rsvpConfig={draft.rsvp}
          fieldErrors={fieldErrors}
          onChangeRsvpConfig={(nextRsvp) =>
            setDraft((prev) => ({ ...prev, rsvp: nextRsvp }))
          }
          onClearError={clearFieldError}
        />
      ) : null}

      {effectiveActiveTab === "ucapan" ? (
        <WishesModerator invitationSlug={invitationSlug} />
      ) : null}

      {effectiveActiveTab === "pratinjau" ? <InvitationPreview config={draft} /> : null}
      </div>

      {!isDirectActionTab ? (
        <section
          className="rounded-2xl border px-5 py-4 sm:px-6"
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
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
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
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-7 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
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
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
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
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
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

          <div
            className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 25%, transparent)",
            }}
          >
            <div>
              <p className="text-xs font-semibold">
                Cadangan &amp; Pulihkan Data (JSON)
              </p>
              <p className="text-[11px] opacity-75">
                Simpan salinan cadangan sebelum menyebar undangan atau pulihkan
                konfigurasi dari berkas JSON.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={backupEndpoint}
                download
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-opacity hover:opacity-85 active:opacity-75"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                }}
              >
                Cadangan Lengkap
              </a>

              <button
                type="button"
                onClick={handleExportConfigJson}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                }}
              >
                Ekspor Config
              </button>

              <label
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                }}
              >
                <span>Impor Config</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => void handleImportConfigJson(event)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </section>
      ) : isDirty ? (
        <div
          className="rounded-xl border px-4 py-3 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor: "var(--color-primary)",
          }}
        >
          Pengingat: Anda masih memiliki perubahan konten/acara/tema yang belum
          disimpan di tab lain.
        </div>
      ) : null}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-3 z-30 px-3 sm:bottom-4 sm:px-6"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
          {statusBanner ? (
            <div
              role={statusBanner.type === "error" ? "alert" : "status"}
              className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-xs font-medium shadow-md backdrop-blur-md sm:text-sm"
              style={{
                backgroundColor:
                  statusBanner.type === "success"
                    ? "var(--color-secondary)"
                    : "color-mix(in srgb, var(--color-accent) 14%, var(--color-background))",
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
              <span>{statusBanner.message}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                aria-label="Tutup pemberitahuan"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-opacity hover:opacity-80"
              >
                Tutup
              </button>
            </div>
          ) : null}

          <div
            className="pointer-events-auto flex w-full items-center gap-2 rounded-2xl border px-2 py-1.5 backdrop-blur-md sm:gap-3 sm:px-3"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-background) 94%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 38%, transparent)",
              boxShadow:
                "0 12px 32px -12px color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <div
              role="tablist"
              aria-label="Menu pengaturan undangan"
              className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 20%, transparent)",
              }}
            >
              {TABS.map((tab) => {
                const isDisabled = isTabDisabled(tab.id);
                const isActive = !isDisabled && effectiveActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabButtonRefs.current[tab.id] = el;
                    }}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    disabled={isDisabled}
                    aria-selected={isActive}
                    aria-disabled={isDisabled || undefined}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    title={
                      isDisabled
                        ? "Section ini sedang nonaktif. Aktifkan di tab Section untuk mengedit."
                        : undefined
                    }
                    onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                    onClick={() => selectTab(tab.id)}
                    className={`-mb-px inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-t-xl border-b-2 px-3 text-xs transition-colors sm:px-3.5 sm:text-sm ${
                      isActive
                        ? "font-semibold"
                        : "font-medium opacity-75 hover:bg-[var(--color-secondary)] hover:opacity-100"
                    } disabled:line-through disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:opacity-40`}
                    style={{
                      borderBottomColor: isActive
                        ? "var(--color-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {!isDirectActionTab || isDirty ? (
              <div
                className="shrink-0 border-l pl-2 sm:pl-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                }}
              >
                <button
                  type="submit"
                  disabled={isSaving}
                  aria-label={
                    isSaving
                      ? "Menyimpan perubahan"
                      : isDirty
                        ? "Simpan perubahan yang belum tersimpan"
                        : "Simpan dan publikasikan"
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 sm:px-4 sm:text-sm"
                  style={{
                    backgroundColor: isDirty
                      ? "var(--color-primary)"
                      : "var(--color-secondary)",
                    borderColor: isDirty
                      ? "var(--color-primary)"
                      : "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                    color: isDirty
                      ? "var(--color-background)"
                      : "var(--color-text)",
                  }}
                >
                  {isDirty ? (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "var(--color-secondary)" }}
                    />
                  ) : null}
                  <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-xs font-medium"
      style={{ color: "var(--color-accent)" }}
    >
      {message}
    </p>
  );
}
