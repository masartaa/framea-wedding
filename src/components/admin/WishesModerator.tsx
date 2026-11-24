"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface AdminWishItem {
  id: number;
  name: string;
  message: string;
  isHidden: boolean;
  createdAt: string;
}

interface AdminWishesGetResponse {
  wishes?: AdminWishItem[];
  error?: string;
}

type FilterMode = "all" | "visible" | "hidden";

function formatWishDate(iso: string): string {
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

interface WishesModeratorProps {
  invitationSlug: string;
}

export function WishesModerator({ invitationSlug }: WishesModeratorProps) {
  const apiEndpoint = `/api/admin/invitations/${encodeURIComponent(invitationSlug)}/wishes`;
  const [wishes, setWishes] = useState<AdminWishItem[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
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
      const data = (await response.json()) as AdminWishesGetResponse;
      if (!response.ok) {
        setNotice({
          type: "error",
          message: data.error ?? "Gagal memuat ucapan tamu.",
        });
        return;
      }
      setWishes(Array.isArray(data.wishes) ? data.wishes : []);
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
        const data = (await response.json()) as AdminWishesGetResponse;
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          setNotice({
            type: "error",
            message: data.error ?? "Gagal memuat ucapan tamu.",
          });
          return;
        }
        setWishes(Array.isArray(data.wishes) ? data.wishes : []);
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

  const counts = useMemo(() => {
    let visible = 0;
    let hidden = 0;
    for (const item of wishes) {
      if (item.isHidden) {
        hidden += 1;
      } else {
        visible += 1;
      }
    }
    return { all: wishes.length, visible, hidden };
  }, [wishes]);

  const filteredWishes = useMemo(() => {
    if (filter === "visible") {
      return wishes.filter((item) => !item.isHidden);
    }
    if (filter === "hidden") {
      return wishes.filter((item) => item.isHidden);
    }
    return wishes;
  }, [filter, wishes]);

  const handleToggleVisibility = async (item: AdminWishItem) => {
    setBusyId(item.id);
    setNotice(null);
    try {
      const response = await fetch(apiEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isHidden: !item.isHidden }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setNotice({
          type: "error",
          message: data.error ?? "Gagal memperbarui status ucapan.",
        });
        return;
      }

      setWishes((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, isHidden: !item.isHidden } : row
        )
      );
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setBusyId(id);
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
          message: data.error ?? "Gagal menghapus ucapan.",
        });
        return;
      }

      setWishes((prev) => prev.filter((row) => row.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section
      aria-label="Moderasi Ucapan Tamu"
      className="space-y-5 rounded-3xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Moderasi Ucapan Tamu
          </h2>
          <p className="mt-0.5 text-sm opacity-75">
            Ucapan baru langsung tampil di halaman undangan. Anda dapat
            menyembunyikan atau menghapus ucapan yang tidak sesuai.
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleReload()}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 45%, transparent)",
          }}
        >
          {isLoading ? "Memuat..." : "Muat Ulang"}
        </button>
      </div>

      <div
        role="group"
        aria-label="Filter status ucapan"
        className="grid grid-cols-3 gap-2 rounded-2xl p-1.5"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        {(
          [
            { id: "all", label: `Semua (${counts.all})` },
            { id: "visible", label: `Tampil (${counts.visible})` },
            { id: "hidden", label: `Sembunyi (${counts.hidden})` },
          ] as const
        ).map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setFilter(tab.id)}
              className="min-h-11 cursor-pointer rounded-xl px-2 text-xs font-semibold transition-colors"
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

      {isLoading ? (
        <div
          className="rounded-2xl border px-4 py-8 text-center text-sm opacity-70"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          Memuat ucapan tamu...
        </div>
      ) : filteredWishes.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm opacity-75"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          Belum ada ucapan pada kategori ini.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWishes.map((item) => {
            const isConfirming = confirmDeleteId === item.id;
            const isBusy = busyId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: item.isHidden
                    ? "var(--color-background)"
                    : "color-mix(in srgb, var(--color-secondary) 32%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 32%, transparent)",
                  opacity: item.isHidden ? 0.78 : 1,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold break-words">
                      {item.name}
                    </h3>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: item.isHidden
                          ? "color-mix(in srgb, var(--color-accent) 14%, var(--color-background))"
                          : "var(--color-secondary)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {item.isHidden ? "Disembunyikan" : "Tampil"}
                    </span>
                  </div>
                  <time className="text-xs opacity-65">
                    {formatWishDate(item.createdAt)} WIB
                  </time>
                </div>

                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line break-words opacity-90">
                  {item.message}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleToggleVisibility(item)}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-semibold disabled:opacity-50"
                    style={{
                      backgroundColor: item.isHidden
                        ? "var(--color-primary)"
                        : "var(--color-background)",
                      borderColor: "var(--color-primary)",
                      color: item.isHidden
                        ? "var(--color-background)"
                        : "var(--color-text)",
                    }}
                  >
                    {isBusy
                      ? "Memproses..."
                      : item.isHidden
                        ? "Tampilkan Kembali"
                        : "Sembunyikan"}
                  </button>

                  {isConfirming ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isBusy}
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
                        disabled={isBusy}
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold"
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
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium disabled:opacity-50"
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
    </section>
  );
}
