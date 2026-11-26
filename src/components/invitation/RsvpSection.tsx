"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import type { SiteConfig } from "@/lib/config-schema";
import { DEFAULT_GUEST_LABEL, sanitizeGuestName } from "@/lib/format";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

type AttendanceStatus = "hadir" | "tidak_hadir" | "ragu";

interface RsvpPostResponse {
  ok?: boolean;
  error?: string;
}

interface RsvpSectionProps {
  rsvpConfig: SiteConfig["rsvp"];
  ornaments: boolean;
  previewMode?: boolean;
  invitationSlug?: string;
}

const ATTENDANCE_OPTIONS: ReadonlyArray<{
  id: AttendanceStatus;
  label: string;
}> = [
  { id: "hadir", label: "Hadir" },
  { id: "tidak_hadir", label: "Tidak Hadir" },
  { id: "ragu", label: "Masih Ragu" },
];

function subscribeToLocation(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getGuestNameForRsvp(): string {
  const params = new URLSearchParams(window.location.search);
  const sanitized = sanitizeGuestName(params.get("to"));
  return sanitized === DEFAULT_GUEST_LABEL ? "" : sanitized.slice(0, 60);
}

function getServerGuestName(): string {
  return "";
}

export function RsvpSection({
  rsvpConfig,
  ornaments,
  previewMode = false,
  invitationSlug,
}: RsvpSectionProps) {
  const title = rsvpConfig?.title?.trim() || "Konfirmasi Kehadiran";
  const introText =
    rsvpConfig?.introText?.trim() ||
    "Mohon konfirmasi kehadiran Bapak/Ibu/Saudara/i agar kami dapat mempersiapkan penyambutan dengan baik.";
  const maxGuests = Math.max(1, Math.min(10, rsvpConfig?.maxGuests ?? 5));

  const urlGuestName = useSyncExternalStore(
    subscribeToLocation,
    getGuestNameForRsvp,
    getServerGuestName
  );

  const [hasEditedName, setHasEditedName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [attendance, setAttendance] = useState<AttendanceStatus>("hadir");
  const [guestCountInput, setGuestCountInput] = useState("1");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot anti-bot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAttendance, setSubmittedAttendance] =
    useState<AttendanceStatus | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
    field?: "name" | "guestCount";
  } | null>(null);

  const nameValue = hasEditedName ? customName : urlGuestName;
  const parsedGuestCount = Number.parseInt(guestCountInput, 10);
  const currentGuestNumber = Number.isNaN(parsedGuestCount)
    ? 1
    : Math.max(1, Math.min(maxGuests, parsedGuestCount));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (previewMode || !invitationSlug) {
      setFeedback({
        type: "success",
        text: "Mode pratinjau: formulir RSVP siap menerima konfirmasi tamu.",
      });
      return;
    }

    setFeedback(null);
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      setFeedback({
        type: "error",
        text: "Mohon isi nama Anda terlebih dahulu.",
        field: "name",
      });
      return;
    }
    if (trimmedName.length > 60) {
      setFeedback({
        type: "error",
        text: "Nama maksimal 60 karakter.",
        field: "name",
      });
      return;
    }

    let finalGuestCount = 0;
    if (attendance !== "tidak_hadir") {
      if (
        !Number.isInteger(parsedGuestCount) ||
        parsedGuestCount < 1 ||
        parsedGuestCount > maxGuests
      ) {
        setFeedback({
          type: "error",
          text: `Masukkan jumlah tamu antara 1 sampai ${maxGuests} orang.`,
          field: "guestCount",
        });
        return;
      }
      finalGuestCount = parsedGuestCount;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/invitations/${encodeURIComponent(invitationSlug)}/rsvp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            attendance,
            guestCount: finalGuestCount,
            note: note.trim(),
            website,
          }),
        }
      );

      const data = (await response.json()) as RsvpPostResponse;
      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data.error ?? "Gagal mengirim konfirmasi. Silakan coba lagi.",
        });
        return;
      }

      setSubmittedAttendance(attendance);
      setNote("");
      setWebsite("");
      setFeedback({
        type: "success",
        text:
          attendance === "hadir"
            ? `Terima kasih ${trimmedName}, konfirmasi kehadiran (${finalGuestCount} orang) telah tercatat.`
            : attendance === "tidak_hadir"
              ? `Terima kasih ${trimmedName}, informasi ketidakhadiran Anda telah tercatat.`
              : `Terima kasih ${trimmedName}, tanggapan Anda telah kami catat.`,
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
      id="rsvp"
      aria-labelledby="judul-rsvp"
      className="px-5 py-14 text-center"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 38%, transparent)",
      }}
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-wider"
          style={{ color: "var(--color-accent)" }}
        >
          RSVP
        </p>
        <h2
          id="judul-rsvp"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          {title}
        </h2>
        <Ornament enabled={ornaments} className="my-4" />

        {introText ? (
          <p className="mx-auto max-w-sm whitespace-pre-line break-words text-sm leading-relaxed opacity-85">
            {introText}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border p-5 text-left"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
          }}
        >
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="rsvp-website">Situs Web</label>
            <input
              id="rsvp-website"
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
              <label htmlFor="rsvp-name" className="text-xs font-semibold">
                Nama Tamu
              </label>
              <span className="text-[11px] opacity-75">
                {nameValue.length}/60
              </span>
            </div>
            <input
              id="rsvp-name"
              name="name"
              type="text"
              maxLength={60}
              required
              disabled={isSubmitting}
              aria-invalid={feedback?.field === "name" ? true : undefined}
              aria-describedby={
                feedback?.field === "name" ? "rsvp-feedback" : undefined
              }
              value={nameValue}
              onChange={(event) => {
                setHasEditedName(true);
                setCustomName(event.target.value);
              }}
              placeholder="Tulis nama Anda"
              className="mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <fieldset>
            <legend className="text-xs font-semibold">Status Kehadiran</legend>
            <div
              role="radiogroup"
              aria-label="Pilih status kehadiran"
              className="mt-2 grid grid-cols-3 gap-2"
            >
              {ATTENDANCE_OPTIONS.map((option) => {
                const isSelected = attendance === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitting}
                    onClick={() => setAttendance(option.id)}
                    className="min-h-11 rounded-xl border px-2 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-primary)"
                        : "var(--color-background)",
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                      color: isSelected
                        ? "var(--color-background)"
                        : "var(--color-text)",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {attendance !== "tidak_hadir" ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="rsvp-guests"
                  className="block text-xs font-semibold"
                >
                  Perkiraan Jumlah Tamu
                </label>
                <span className="text-[11px] opacity-75">
                  Maks. {maxGuests} orang
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting || currentGuestNumber <= 1}
                  onClick={() =>
                    setGuestCountInput(String(Math.max(1, currentGuestNumber - 1)))
                  }
                  aria-label="Kurangi jumlah tamu"
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border text-base font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                    color: "var(--color-text)",
                  }}
                >
                  −
                </button>
                <input
                  id="rsvp-guests"
                  name="guestCount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxGuests}
                  step={1}
                  disabled={isSubmitting}
                  aria-invalid={
                    feedback?.field === "guestCount" ? true : undefined
                  }
                  aria-describedby={
                    feedback?.field === "guestCount"
                      ? "rsvp-feedback"
                      : undefined
                  }
                  value={guestCountInput}
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/[^\d]/g, "");
                    if (digitsOnly === "") {
                      setGuestCountInput("");
                      return;
                    }
                    const numeric = Math.min(
                      maxGuests,
                      Number.parseInt(digitsOnly, 10)
                    );
                    setGuestCountInput(String(numeric));
                  }}
                  onBlur={() => {
                    if (!guestCountInput.trim() || parsedGuestCount < 1) {
                      setGuestCountInput("1");
                    } else if (parsedGuestCount > maxGuests) {
                      setGuestCountInput(String(maxGuests));
                    }
                  }}
                  className="min-h-11 w-full rounded-xl border px-3.5 text-center text-sm font-medium tabular-nums"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  type="button"
                  disabled={isSubmitting || currentGuestNumber >= maxGuests}
                  onClick={() =>
                    setGuestCountInput(
                      String(Math.min(maxGuests, currentGuestNumber + 1))
                    )
                  }
                  aria-label="Tambah jumlah tamu"
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border text-base font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                    color: "var(--color-text)",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="rsvp-note" className="text-xs font-semibold">
                Catatan Singkat (Opsional)
              </label>
              <span className="text-[11px] opacity-75">{note.length}/200</span>
            </div>
            <textarea
              id="rsvp-note"
              name="note"
              rows={2}
              maxLength={200}
              disabled={isSubmitting}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Misalnya: hadir saat resepsi atau datang bersama keluarga"
              className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm"
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
              id="rsvp-feedback"
              role={feedback.type === "error" ? "alert" : "status"}
              className="rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-relaxed"
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
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:opacity-60"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            {isSubmitting
              ? "Mengirim..."
              : submittedAttendance
                ? "Kirim Konfirmasi Lagi"
                : "Kirim Konfirmasi Kehadiran"}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
