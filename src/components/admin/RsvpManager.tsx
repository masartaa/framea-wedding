"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteConfig } from "@/lib/config-schema";

type AttendanceStatus = "hadir" | "tidak_hadir" | "ragu";
type FilterMode = "all" | AttendanceStatus;

interface AdminRsvpItem {
  id: number;
  name: string;
  attendance: AttendanceStatus;
  guestCount: number;
  note: string;
  createdAt: string;
}

interface AdminRsvpSummary {
  totalResponses: number;
  attendingCount: number;
  attendingGuestsTotal: number;
  notAttendingCount: number;
  maybeCount: number;
}

interface AdminRsvpGetResponse {
  rsvps?: AdminRsvpItem[];
  summary?: AdminRsvpSummary;
  error?: string;
}

interface RsvpManagerProps {
  invitationSlug: string;
  rsvpConfig: SiteConfig["rsvp"];
  fieldErrors: Record<string, string>;
  onChangeRsvpConfig: (nextRsvp: SiteConfig["rsvp"]) => void;
  onClearError: (key: string) => void;
}

function formatRsvpDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getAttendanceLabel(status: AttendanceStatus): string {
  if (status === "hadir") {
    return "Hadir";
  }
  if (status === "tidak_hadir") {
    return "Tidak Hadir";
  }
  return "Masih Ragu";
}

export function RsvpManager({
  invitationSlug,
  rsvpConfig,
  fieldErrors,
  onChangeRsvpConfig,
  onClearError,
}: RsvpManagerProps) {
  const apiEndpoint = `/api/admin/invitations/${encodeURIComponent(invitationSlug)}/rsvp`;
  const [items, setItems] = useState<AdminRsvpItem[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);

  const handleReload = useCallback(async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      const response = await fetch(apiEndpoint, { cache: "no-store" });
      const data = (await response.json()) as AdminRsvpGetResponse;
      if (!response.ok) {
        setNotice({
          type: "error",
          message: data.error ?? "Gagal memuat data RSVP.",
        });
        return;
      }
      setItems(Array.isArray(data.rsvps) ? data.rsvps : []);
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    let cancelled = false;

    fetch(apiEndpoint, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as AdminRsvpGetResponse;
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          setNotice({
            type: "error",
            message: data.error ?? "Gagal memuat data RSVP.",
          });
          return;
        }
        setItems(Array.isArray(data.rsvps) ? data.rsvps : []);
      })
      .catch(() => {
        if (!cancelled) {
          setNotice({
            type: "error",
            message: "Tidak dapat terhubung ke server.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiEndpoint]);

  const summary = useMemo<AdminRsvpSummary>(() => {
    let attendingCount = 0;
    let attendingGuestsTotal = 0;
    let notAttendingCount = 0;
    let maybeCount = 0;

    for (const item of items) {
      if (item.attendance === "hadir") {
        attendingCount += 1;
        attendingGuestsTotal += item.guestCount;
      } else if (item.attendance === "tidak_hadir") {
        notAttendingCount += 1;
      } else {
        maybeCount += 1;
      }
    }

    return {
      totalResponses: items.length,
      attendingCount,
      attendingGuestsTotal,
      notAttendingCount,
      maybeCount,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return items;
    }
    return items.filter((item) => item.attendance === filter);
  }, [filter, items]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setNotice(null);
    try {
      const response = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setNotice({
          type: "error",
          message: data.error ?? "Gagal menghapus konfirmasi RSVP.",
        });
        return;
      }

      setItems((prev) => prev.filter((row) => row.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setDeletingId(null);
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
    <section
      aria-label="Pengaturan dan Daftar RSVP"
      className="space-y-6 rounded-2xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Konfirmasi Kehadiran (RSVP)
        </h2>
        <p className="mt-0.5 text-sm opacity-75">
          Atur teks formulir RSVP (simpan dengan tombol Simpan &amp; Publikasikan
          di bawah) dan pantau rekap kehadiran tamu yang sudah mengisi.
        </p>
      </div>

      <div
        className="space-y-4 rounded-2xl border p-4"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-secondary) 35%, var(--color-background))",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <p className="text-xs font-semibold">Pengaturan Formulir RSVP</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="rsvp-config-title"
              className="block text-sm font-medium"
            >
              Judul Section RSVP
            </label>
            <input
              id="rsvp-config-title"
              type="text"
              maxLength={80}
              aria-invalid={fieldErrors["rsvp.title"] ? true : undefined}
              aria-describedby={
                fieldErrors["rsvp.title"] ? "err-rsvp-title" : undefined
              }
              value={rsvpConfig.title}
              onChange={(event) => {
                onChangeRsvpConfig({
                  ...rsvpConfig,
                  title: event.target.value,
                });
                onClearError("rsvp.title");
              }}
              className={inputClassName}
              style={inputStyle}
            />
            {fieldErrors["rsvp.title"] ? (
              <p
                id="err-rsvp-title"
                role="alert"
                className="mt-1 text-xs font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                {fieldErrors["rsvp.title"]}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="rsvp-config-max-guests"
              className="block text-sm font-medium"
            >
              Maksimal Jumlah Tamu per Konfirmasi
            </label>
            <input
              id="rsvp-config-max-guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={400}
              step={1}
              aria-invalid={fieldErrors["rsvp.maxGuests"] ? true : undefined}
              aria-describedby={
                fieldErrors["rsvp.maxGuests"]
                  ? "err-rsvp-max-guests"
                  : undefined
              }
              value={rsvpConfig.maxGuests}
              onChange={(event) => {
                const raw = Number.parseInt(event.target.value, 10);
                const nextValue = Number.isNaN(raw)
                  ? 1
                  : Math.max(1, Math.min(400, raw));
                onChangeRsvpConfig({
                  ...rsvpConfig,
                  maxGuests: nextValue,
                });
                onClearError("rsvp.maxGuests");
              }}
              className={inputClassName}
              style={inputStyle}
            />
            <p className="mt-1 text-xs opacity-75">
              Rentang yang diizinkan: 1 sampai 400 orang per konfirmasi.
            </p>
            {fieldErrors["rsvp.maxGuests"] ? (
              <p
                id="err-rsvp-max-guests"
                role="alert"
                className="mt-1 text-xs font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                {fieldErrors["rsvp.maxGuests"]}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="rsvp-config-intro"
              className="block text-sm font-medium"
            >
              Teks Pengantar RSVP
            </label>
            <span className="text-xs opacity-75">
              {rsvpConfig.introText.length}/300
            </span>
          </div>
          <textarea
            id="rsvp-config-intro"
            rows={2}
            maxLength={300}
            value={rsvpConfig.introText}
            onChange={(event) => {
              onChangeRsvpConfig({
                ...rsvpConfig,
                introText: event.target.value,
              });
              onClearError("rsvp.introText");
            }}
            className={inputClassName}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            Rekap &amp; Daftar Tamu RSVP ({summary.totalResponses})
          </h3>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void handleReload()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            {isLoading ? "Memuat..." : "Muat Ulang"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className="rounded-xl border p-3.5"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 28%, transparent)",
            }}
          >
            <p className="text-xs opacity-75">Konfirmasi Hadir</p>
            <p className="font-heading mt-1 text-xl font-semibold">
              {summary.attendingCount}
            </p>
          </div>

          <div
            className="rounded-xl border p-3.5"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 28%, transparent)",
            }}
          >
            <p className="text-xs opacity-75">Perkiraan Total Orang</p>
            <p className="font-heading mt-1 text-xl font-semibold">
              {summary.attendingGuestsTotal}
            </p>
          </div>

          <div
            className="rounded-xl border p-3.5"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 28%, transparent)",
            }}
          >
            <p className="text-xs opacity-75">Tidak Hadir</p>
            <p className="font-heading mt-1 text-xl font-semibold">
              {summary.notAttendingCount}
            </p>
          </div>

          <div
            className="rounded-xl border p-3.5"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 28%, transparent)",
            }}
          >
            <p className="text-xs opacity-75">Masih Ragu</p>
            <p className="font-heading mt-1 text-xl font-semibold">
              {summary.maybeCount}
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter status kehadiran RSVP"
          className="grid grid-cols-2 gap-2 rounded-2xl p-1.5 sm:grid-cols-4"
          style={{ backgroundColor: "var(--color-secondary)" }}
        >
          {(
            [
              { id: "all", label: `Semua (${summary.totalResponses})` },
              { id: "hadir", label: `Hadir (${summary.attendingCount})` },
              {
                id: "tidak_hadir",
                label: `Tidak Hadir (${summary.notAttendingCount})`,
              },
              { id: "ragu", label: `Ragu (${summary.maybeCount})` },
            ] as const
          ).map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setFilter(tab.id)}
                className="min-h-11 rounded-xl px-2 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-primary)"
                    : "transparent",
                  color: isSelected
                    ? "var(--color-background)"
                    : "var(--color-text)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {notice ? (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className="rounded-xl border px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor:
                notice.type === "info"
                  ? "var(--color-secondary)"
                  : "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
              borderColor:
                notice.type === "info"
                  ? "var(--color-primary)"
                  : "var(--color-accent)",
              color:
                notice.type === "info"
                  ? "var(--color-text)"
                  : "var(--color-accent)",
            }}
          >
            {notice.message}
          </div>
        ) : null}

        {isLoading ? (
          <div
            className="rounded-2xl border px-4 py-8 text-center text-sm opacity-75"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            Memuat data konfirmasi kehadiran...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm opacity-75"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            Belum ada konfirmasi kehadiran pada kategori ini.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isConfirming = confirmDeleteId === item.id;
              const isBusy = deletingId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-secondary) 28%, var(--color-background))",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold break-words">
                        {item.name}
                      </h4>
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor:
                            item.attendance === "hadir"
                              ? "var(--color-primary)"
                              : "var(--color-secondary)",
                          color:
                            item.attendance === "hadir"
                              ? "var(--color-background)"
                              : "var(--color-accent)",
                        }}
                      >
                        {getAttendanceLabel(item.attendance)}
                        {item.attendance !== "tidak_hadir"
                          ? ` · ${item.guestCount} orang`
                          : ""}
                      </span>
                    </div>
                    <time className="text-xs opacity-75">
                      {formatRsvpDate(item.createdAt)} WIB
                    </time>
                  </div>

                  {item.note ? (
                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed opacity-85">
                      {item.note}
                    </p>
                  ) : null}

                  <div className="mt-3 flex justify-end">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setConfirmDeleteId(null)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                          style={{
                            backgroundColor: "var(--color-background)",
                            borderColor:
                              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                          }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleDelete(item.id)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "var(--color-background)",
                          }}
                        >
                          {isBusy ? "Menghapus..." : "Yakin Hapus"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--color-background)",
                          borderColor:
                            "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                          color: "var(--color-accent)",
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
