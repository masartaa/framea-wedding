"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { DEFAULT_GUEST_LABEL, sanitizeGuestName } from "@/lib/format";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

interface PublicWish {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

interface WishesGetResponse {
  wishes?: PublicWish[];
  total?: number;
  error?: string;
}

interface WishesPostResponse {
  ok?: boolean;
  wish?: PublicWish;
  error?: string;
}

interface WishesSectionProps {
  ornaments: boolean;
  previewMode?: boolean;
  invitationSlug?: string;
}

const PREVIEW_WISHES: ReadonlyArray<PublicWish> = [
  {
    id: -1,
    name: "Budi Santoso",
    message:
      "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, dan rahmah.",
    createdAt: "2026-12-20T08:30:00.000Z",
  },
  {
    id: -2,
    name: "Rina & Keluarga",
    message:
      "Turut berbahagia atas pernikahan kalian. Semoga selalu diberikan kebahagiaan dan keberkahan.",
    createdAt: "2026-12-19T14:15:00.000Z",
  },
];

function subscribeToLocation(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getGuestNameForForm(): string {
  const params = new URLSearchParams(window.location.search);
  const sanitized = sanitizeGuestName(params.get("to"));
  return sanitized === DEFAULT_GUEST_LABEL ? "" : sanitized.slice(0, 50);
}

function getServerGuestName(): string {
  return "";
}

function formatWishDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
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

export function WishesSection({
  ornaments,
  previewMode = false,
  invitationSlug,
}: WishesSectionProps) {
  const apiEndpoint = invitationSlug
    ? `/api/invitations/${encodeURIComponent(invitationSlug)}/wishes`
    : "/api/wishes";

  const urlGuestName = useSyncExternalStore(
    subscribeToLocation,
    getGuestNameForForm,
    getServerGuestName
  );

  const [hasEditedName, setHasEditedName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot anti-bot
  const [wishesList, setWishesList] = useState<PublicWish[]>(() =>
    previewMode ? [...PREVIEW_WISHES] : []
  );
  const [totalCount, setTotalCount] = useState<number>(() =>
    previewMode ? PREVIEW_WISHES.length : 0
  );
  const [isLoading, setIsLoading] = useState(!previewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const nameValue = hasEditedName ? customName : urlGuestName;

  useEffect(() => {
    if (previewMode) {
      return;
    }

    let cancelled = false;
    fetch(apiEndpoint, { cache: "no-store" })
      .then((res) => res.json() as Promise<WishesGetResponse>)
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (Array.isArray(data.wishes)) {
          setWishesList(data.wishes);
          setTotalCount(
            typeof data.total === "number" ? data.total : data.wishes.length
          );
        }
      })
      .catch(() => {
        // Biarkan daftar kosong jika gagal mengambil sementara
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiEndpoint, previewMode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (previewMode) {
      setFeedback({
        type: "success",
        text: "Mode pratinjau: form ucapan siap digunakan di halaman undangan.",
      });
      return;
    }

    setFeedback(null);
    const trimmedName = nameValue.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", text: "Mohon isi nama Anda terlebih dahulu." });
      return;
    }
    if (trimmedName.length > 50) {
      setFeedback({ type: "error", text: "Nama maksimal 50 karakter." });
      return;
    }
    if (!trimmedMessage) {
      setFeedback({ type: "error", text: "Mohon tulis ucapan atau doa Anda." });
      return;
    }
    if (trimmedMessage.length > 300) {
      setFeedback({ type: "error", text: "Ucapan maksimal 300 karakter." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          message: trimmedMessage,
          website,
        }),
      });

      const data = (await response.json()) as WishesPostResponse;
      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data.error ?? "Gagal mengirim ucapan. Silakan coba lagi.",
        });
        return;
      }

      if (data.wish) {
        const createdWish = data.wish;
        setWishesList((prev) => [createdWish, ...prev]);
        setTotalCount((prev) => prev + 1);
      }

      setMessage("");
      setWebsite("");
      setFeedback({
        type: "success",
        text: "Terima kasih atas ucapan dan doa restu Anda!",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="ucapan"
      aria-labelledby="judul-ucapan"
      className="px-5 py-14 text-center"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 45%, var(--color-background))",
      }}
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Doa &amp; Harapan
        </p>
        <h2
          id="judul-ucapan"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          Ucapan Tamu
        </h2>
        <Ornament enabled={ornaments} className="my-4" />

        <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-80">
          Tinggalkan doa terbaik dan ucapan hangat untuk kedua mempelai.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-3.5 rounded-3xl border p-5 text-left"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
          }}
        >
          {/* Field honeypot anti-bot */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="wish-website">Situs Web</label>
            <input
              id="wish-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="wish-name" className="text-xs font-semibold">
                Nama Anda
              </label>
              <span className="text-[11px] opacity-60">
                {nameValue.length}/50
              </span>
            </div>
            <input
              id="wish-name"
              name="name"
              type="text"
              maxLength={50}
              required
              disabled={isSubmitting}
              value={nameValue}
              onChange={(event) => {
                setHasEditedName(true);
                setCustomName(event.target.value);
              }}
              placeholder="Tulis nama Anda"
              className="mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="wish-message" className="text-xs font-semibold">
                Ucapan &amp; Doa
              </label>
              <span className="text-[11px] opacity-60">
                {message.length}/300
              </span>
            </div>
            <textarea
              id="wish-message"
              name="message"
              rows={3}
              maxLength={300}
              required
              disabled={isSubmitting}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tulis ucapan dan doa restu untuk kedua mempelai..."
              className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {feedback ? (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className="rounded-xl border px-3.5 py-2.5 text-xs font-medium"
              style={{
                backgroundColor:
                  feedback.type === "success"
                    ? "var(--color-secondary)"
                    : "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
                borderColor:
                  feedback.type === "success"
                    ? "var(--color-primary)"
                    : "var(--color-accent)",
                color:
                  feedback.type === "success"
                    ? "var(--color-text)"
                    : "var(--color-accent)",
              }}
            >
              {feedback.text}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
          </button>
        </form>

        <div className="mt-6 text-left">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider uppercase opacity-75">
              Daftar Ucapan
            </p>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-accent)",
              }}
            >
              {totalCount} ucapan
            </span>
          </div>

          {isLoading ? (
            <div
              className="rounded-2xl border px-5 py-6 text-center text-sm opacity-70"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              Memuat ucapan tamu...
            </div>
          ) : wishesList.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed px-5 py-7 text-center text-sm opacity-75"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 35%, transparent)",
              }}
            >
              Belum ada ucapan. Jadilah yang pertama mengirimkan doa restu!
            </div>
          ) : (
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-0.5">
              {wishesList.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border px-4 py-3.5"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className="text-sm font-semibold break-words"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {item.name}
                    </h3>
                    <time className="text-[11px] opacity-60">
                      {formatWishDate(item.createdAt)} WIB
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line break-words opacity-90">
                    {item.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
