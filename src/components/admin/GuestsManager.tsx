"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteConfig } from "@/lib/config-schema";
import {
  buildPersonalInvitationUrl,
  createDefaultWhatsAppTemplate,
  parseGuestNamesInput,
  renderWhatsAppMessage,
} from "@/lib/guest-utils";

interface GuestItem {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

interface GuestsGetResponse {
  guests?: GuestItem[];
  error?: string;
}

interface GuestsPostResponse {
  ok?: boolean;
  added?: GuestItem[];
  addedCount?: number;
  skippedCount?: number;
  error?: string;
}

interface GuestsManagerProps {
  config: SiteConfig;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback ke execCommand di bawah
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function GuestsManager({ config }: GuestsManagerProps) {
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawNames, setRawNames] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [waTemplate, setWaTemplate] = useState(() =>
    createDefaultWhatsAppTemplate(config)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/guests", { cache: "no-store" })
      .then((res) => res.json() as Promise<GuestsGetResponse>)
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (Array.isArray(data.guests)) {
          setGuests(data.guests);
        } else if (data.error) {
          setNotice({ type: "error", message: data.error });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotice({
            type: "error",
            message: "Gagal memuat daftar tamu. Coba muat ulang halaman.",
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
  }, []);

  const detectedNamesCount = useMemo(
    () => parseGuestNamesInput(rawNames).length,
    [rawNames]
  );

  const filteredGuests = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return guests;
    }
    return guests.filter((guest) =>
      guest.name.toLowerCase().includes(keyword)
    );
  }, [guests, searchQuery]);

  const handleAddGuests = async () => {
    setNotice(null);
    if (detectedNamesCount === 0) {
      setNotice({
        type: "error",
        message: "Masukkan minimal satu nama tamu (satu nama per baris).",
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNames }),
      });

      const data = (await response.json()) as GuestsPostResponse;
      if (!response.ok) {
        setNotice({
          type: "error",
          message: data.error ?? "Gagal menambahkan daftar tamu.",
        });
        return;
      }

      if (Array.isArray(data.added) && data.added.length > 0) {
        setGuests((prev) => [...data.added!, ...prev]);
      }

      const addedCount = data.addedCount ?? 0;
      const skippedCount = data.skippedCount ?? 0;
      const skippedText =
        skippedCount > 0 ? ` (${skippedCount} nama sudah ada sebelumnya)` : "";

      setRawNames("");
      setNotice({
        type: "info",
        message:
          addedCount > 0
            ? `${addedCount} tamu berhasil ditambahkan${skippedText}.`
            : `Semua nama sudah ada di daftar tamu${skippedText}.`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGuest = async (id: number) => {
    setDeletingId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setNotice({
          type: "error",
          message: data.error ?? "Gagal menghapus tamu.",
        });
        return;
      }

      setGuests((prev) => prev.filter((item) => item.id !== id));
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

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } else {
      setNotice({
        type: "error",
        message: "Gagal menyalin otomatis. Salin secara manual dari tautan.",
      });
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <section
      aria-label="Kelola Daftar Tamu"
      className="space-y-6 rounded-3xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Daftar Tamu &amp; Tautan WhatsApp
        </h2>
        <p className="mt-0.5 text-sm opacity-75">
          Masukkan satu nama atau tempel banyak nama (satu nama per baris) untuk
          membuat tautan personal dan pesan WhatsApp siap kirim.
        </p>
      </div>

      {notice ? (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className="rounded-2xl border px-4 py-3 text-sm font-medium"
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

      {/* Tambah Tamu */}
      <div
        className="space-y-3 rounded-2xl border p-4"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-secondary) 35%, var(--color-background))",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="guest-names-input" className="text-sm font-semibold">
            Tambah Nama Tamu
          </label>
          <span className="text-xs opacity-70">
            {detectedNamesCount} nama terdeteksi
          </span>
        </div>

        <textarea
          id="guest-names-input"
          rows={4}
          value={rawNames}
          onChange={(event) => setRawNames(event.target.value)}
          disabled={isAdding}
          placeholder={"Contoh:\nBudi Santoso\nIbu Sari & Keluarga\nAndi Pratama"}
          className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
          style={inputStyle}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs opacity-70">
            Satu nama per baris (maks. 60 karakter per nama). Duplikat otomatis
            dilewati.
          </p>
          <button
            type="button"
            disabled={isAdding || detectedNamesCount === 0}
            onClick={() => void handleAddGuests()}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-6 text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            {isAdding
              ? "Menambahkan..."
              : detectedNamesCount > 1
                ? `Tambah ${detectedNamesCount} Tamu`
                : "Tambah Tamu"}
          </button>
        </div>
      </div>

      {/* Template WhatsApp */}
      <div
        className="space-y-2.5 rounded-2xl border p-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label htmlFor="wa-template" className="text-sm font-semibold">
              Template Pesan WhatsApp
            </label>
            <p className="text-xs opacity-75">
              Gunakan <code className="font-mono">{"{nama}"}</code> dan{" "}
              <code className="font-mono">{"{tautan}"}</code> — akan diganti
              otomatis untuk tiap tamu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWaTemplate(createDefaultWhatsAppTemplate(config))}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            Reset Template
          </button>
        </div>

        <textarea
          id="wa-template"
          rows={6}
          value={waTemplate}
          onChange={(event) => setWaTemplate(event.target.value)}
          className="w-full rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed outline-none focus:ring-2"
          style={inputStyle}
        />
      </div>

      {/* Daftar Tamu */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">
            Daftar Tamu Tersimpan ({guests.length})
          </h3>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari nama tamu..."
            aria-label="Cari nama tamu"
            className="min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2 sm:max-w-xs"
            style={inputStyle}
          />
        </div>

        {isLoading ? (
          <div
            className="rounded-2xl border px-4 py-8 text-center text-sm opacity-70"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            Memuat daftar tamu...
          </div>
        ) : filteredGuests.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm opacity-75"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            {guests.length === 0
              ? "Belum ada tamu tersimpan. Tambahkan nama tamu di atas untuk mulai membuat tautan."
              : "Tidak ada tamu yang cocok dengan pencarian Anda."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGuests.map((guest) => {
              const personalUrl = buildPersonalInvitationUrl(origin, guest.name);
              const waMessage = renderWhatsAppMessage(
                waTemplate,
                guest.name,
                personalUrl
              );
              const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
              const linkCopied = copiedKey === `link-${guest.id}`;
              const waCopied = copiedKey === `wa-${guest.id}`;
              const isConfirmingDelete = confirmDeleteId === guest.id;

              return (
                <article
                  key={guest.id}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-secondary) 28%, var(--color-background))",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold break-words">
                      {guest.name}
                    </h4>
                    <p className="font-mono text-[11px] break-all opacity-70">
                      {personalUrl}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(`link-${guest.id}`, personalUrl)
                      }
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor: "var(--color-primary)",
                      }}
                    >
                      {linkCopied ? "Tautan Tersalin!" : "Salin Tautan"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(`wa-${guest.id}`, waMessage)
                      }
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                      }}
                    >
                      {waCopied ? "Pesan WA Tersalin!" : "Salin Pesan WA"}
                    </button>

                    <a
                      href={waShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      Buka WA
                    </a>

                    {isConfirmingDelete ? (
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={deletingId === guest.id}
                          onClick={() => setConfirmDeleteId(null)}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-medium"
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
                          disabled={deletingId === guest.id}
                          onClick={() => void handleDeleteGuest(guest.id)}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3.5 text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "var(--color-background)",
                          }}
                        >
                          {deletingId === guest.id ? "Menghapus..." : "Yakin Hapus"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(guest.id)}
                        className="ml-auto inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3.5 text-xs font-medium"
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
