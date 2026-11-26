"use client";

import type { EventItem } from "@/lib/config-schema";

interface EventsManagerProps {
  events: EventItem[];
  fieldErrors: Record<string, string>;
  onChangeEvents: (nextEvents: EventItem[]) => void;
  onClearError: (key: string) => void;
}

const MAX_EVENTS = 6;
const TIMEZONE_OPTIONS = ["WIB", "WITA", "WIT"] as const;

const QUICK_EVENT_PRESETS: ReadonlyArray<{
  label: string;
  title: string;
  timeStart: string;
  timeEnd: string;
}> = [
  {
    label: "+ Akad Nikah",
    title: "Akad Nikah",
    timeStart: "08.00",
    timeEnd: "09.30",
  },
  {
    label: "+ Resepsi",
    title: "Resepsi Pernikahan",
    timeStart: "10.00",
    timeEnd: "14.00",
  },
  {
    label: "+ Ngunduh Mantu",
    title: "Ngunduh Mantu",
    timeStart: "10.00",
    timeEnd: "15.00",
  },
  {
    label: "+ Acara Lain",
    title: "Acara Tambahan",
    timeStart: "09.00",
    timeEnd: "12.00",
  },
];

function generateEventId(): string {
  return `acara-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function EventsManager({
  events,
  fieldErrors,
  onChangeEvents,
  onClearError,
}: EventsManagerProps) {
  const addEvent = (preset: (typeof QUICK_EVENT_PRESETS)[number]) => {
    if (events.length >= MAX_EVENTS) {
      return;
    }

    const reference = events[events.length - 1];
    const newEvent: EventItem = {
      id: generateEventId(),
      title: preset.title,
      date: reference?.date ?? "2027-01-03",
      timeStart: preset.timeStart,
      timeEnd: preset.timeEnd,
      timezone: reference?.timezone ?? "WIB",
      venueName: reference?.venueName ?? "",
      venueAddress: reference?.venueAddress ?? "",
      mapsUrl: "",
      isPrimary: events.length === 0,
    };

    onChangeEvents([...events, newEvent]);
  };

  const updateField = <K extends keyof EventItem>(
    index: number,
    key: K,
    value: EventItem[K]
  ) => {
    const next = events.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    );
    onChangeEvents(next);
    onClearError(`events.${index}.${String(key)}`);
    if (events[index]?.isPrimary) {
      const generalKeyMap: Partial<Record<keyof EventItem, string>> = {
        title: "general.eventTitle",
        date: "general.eventDate",
        timeStart: "general.eventTimeStart",
        timeEnd: "general.eventTimeEnd",
        timezone: "general.eventTimezone",
        venueName: "general.venueName",
        venueAddress: "general.venueAddress",
        mapsUrl: "general.mapsUrl",
      };
      const mapped = generalKeyMap[key];
      if (mapped) {
        onClearError(mapped);
      }
    }
  };

  const setPrimary = (index: number) => {
    const next = events.map((item, itemIndex) => ({
      ...item,
      isPrimary: itemIndex === index,
    }));
    onChangeEvents(next);
  };

  const moveEvent = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= events.length) {
      return;
    }
    const next = [...events];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    onChangeEvents(next);
  };

  const removeEvent = (index: number) => {
    if (events.length <= 1) {
      return;
    }
    const removedWasPrimary = events[index]?.isPrimary;
    const next = events.filter((_, itemIndex) => itemIndex !== index);
    if (removedWasPrimary && next[0]) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onChangeEvents(next);
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
      aria-label="Pengaturan Rangkaian Acara"
      className="space-y-5 rounded-2xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Rangkaian Acara
          </h2>
          <p className="mt-0.5 text-sm opacity-75">
            Tambahkan satu atau beberapa acara (misalnya Akad Nikah, Resepsi,
            Ngunduh Mantu) dengan tanggal, jam, tempat, dan Google Maps masing-masing.
          </p>
        </div>
        <span
          className="rounded-md px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-accent)",
          }}
        >
          {events.length} / {MAX_EVENTS} acara
        </span>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-secondary) 38%, var(--color-background))",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <p className="text-xs font-semibold">Tambah Acara Baru</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {QUICK_EVENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={events.length >= MAX_EVENTS}
              onClick={() => addEvent(preset)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {events.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === events.length - 1;
          const isPrimary =
            item.isPrimary || (!events.some((e) => e.isPrimary) && index === 0);

          const getErr = (field: keyof EventItem, generalFallback?: string) =>
            fieldErrors[`events.${index}.${String(field)}`] ??
            (isPrimary && generalFallback
              ? fieldErrors[generalFallback]
              : undefined);

          const titleErr = getErr("title", "general.eventTitle");
          const dateErr = getErr("date", "general.eventDate");
          const startErr = getErr("timeStart", "general.eventTimeStart");
          const endErr = getErr("timeEnd", "general.eventTimeEnd");
          const tzErr = getErr("timezone", "general.eventTimezone");
          const venueErr = getErr("venueName", "general.venueName");
          const addressErr = getErr("venueAddress", "general.venueAddress");
          const mapsErr = getErr("mapsUrl", "general.mapsUrl");

          return (
            <article
              key={item.id}
              className="space-y-4 rounded-2xl border p-4 sm:p-5"
              style={{
                backgroundColor: isPrimary
                  ? "color-mix(in srgb, var(--color-secondary) 32%, var(--color-background))"
                  : "var(--color-background)",
                borderColor: isPrimary
                  ? "var(--color-primary)"
                  : "color-mix(in srgb, var(--color-primary) 32%, transparent)",
              }}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 25%, transparent)",
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-heading text-base font-semibold">
                    {item.title.trim() || `Acara ${index + 1}`}
                  </h3>
                  {isPrimary ? (
                    <span
                      className="rounded-md px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                      }}
                    >
                      Acara Utama (Hitung Mundur)
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {!isPrimary ? (
                    <button
                      type="button"
                      onClick={() => setPrimary(index)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor: "var(--color-primary)",
                      }}
                    >
                      Jadikan Utama
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveEvent(index, -1)}
                    aria-label={`Naikkan urutan ${item.title}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
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
                    onClick={() => moveEvent(index, 1)}
                    aria-label={`Turunkan urutan ${item.title}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                    }}
                  >
                    ↓
                  </button>

                  {events.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeEvent(index)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                        color: "var(--color-accent)",
                      }}
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`event-title-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Nama Acara
                  </label>
                  <input
                    id={`event-title-${item.id}`}
                    type="text"
                    maxLength={80}
                    aria-invalid={titleErr ? true : undefined}
                    aria-describedby={
                      titleErr ? `event-title-${item.id}-err` : undefined
                    }
                    placeholder="Contoh: Akad Nikah / Resepsi / Ngunduh Mantu"
                    value={item.title}
                    onChange={(event) =>
                      updateField(index, "title", event.target.value)
                    }
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <ErrorText
                    id={`event-title-${item.id}-err`}
                    message={titleErr}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`event-date-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Tanggal Acara
                  </label>
                  <input
                    id={`event-date-${item.id}`}
                    type="date"
                    aria-invalid={dateErr ? true : undefined}
                    aria-describedby={
                      dateErr ? `event-date-${item.id}-err` : undefined
                    }
                    value={item.date}
                    onChange={(event) =>
                      updateField(index, "date", event.target.value)
                    }
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <ErrorText
                    id={`event-date-${item.id}-err`}
                    message={dateErr}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor={`event-start-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Jam Mulai
                  </label>
                  <input
                    id={`event-start-${item.id}`}
                    type="text"
                    maxLength={20}
                    aria-invalid={startErr ? true : undefined}
                    aria-describedby={
                      startErr ? `event-start-${item.id}-err` : undefined
                    }
                    placeholder="08.00"
                    value={item.timeStart}
                    onChange={(event) =>
                      updateField(index, "timeStart", event.target.value)
                    }
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <ErrorText
                    id={`event-start-${item.id}-err`}
                    message={startErr}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`event-end-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Jam Selesai
                  </label>
                  <input
                    id={`event-end-${item.id}`}
                    type="text"
                    maxLength={20}
                    aria-invalid={endErr ? true : undefined}
                    aria-describedby={
                      endErr ? `event-end-${item.id}-err` : undefined
                    }
                    placeholder="10.00 / Selesai"
                    value={item.timeEnd}
                    onChange={(event) =>
                      updateField(index, "timeEnd", event.target.value)
                    }
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <ErrorText id={`event-end-${item.id}-err`} message={endErr} />
                </div>

                <div>
                  <label
                    htmlFor={`event-tz-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Zona Waktu
                  </label>
                  <select
                    id={`event-tz-${item.id}`}
                    aria-invalid={tzErr ? true : undefined}
                    aria-describedby={
                      tzErr ? `event-tz-${item.id}-err` : undefined
                    }
                    value={item.timezone}
                    onChange={(event) =>
                      updateField(index, "timezone", event.target.value)
                    }
                    className={inputClassName}
                    style={inputStyle}
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <ErrorText id={`event-tz-${item.id}-err`} message={tzErr} />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`event-venue-${item.id}`}
                  className="block text-sm font-medium"
                >
                  Nama Tempat
                </label>
                <input
                  id={`event-venue-${item.id}`}
                  type="text"
                  maxLength={120}
                  aria-invalid={venueErr ? true : undefined}
                  aria-describedby={
                    venueErr ? `event-venue-${item.id}-err` : undefined
                  }
                  placeholder="Contoh: Gedung Serbaguna / Nama Tempat Acara"
                  value={item.venueName}
                  onChange={(event) =>
                    updateField(index, "venueName", event.target.value)
                  }
                  className={inputClassName}
                  style={inputStyle}
                />
                <ErrorText
                  id={`event-venue-${item.id}-err`}
                  message={venueErr}
                />
              </div>

              <div>
                <label
                  htmlFor={`event-address-${item.id}`}
                  className="block text-sm font-medium"
                >
                  Alamat Lengkap
                </label>
                <textarea
                  id={`event-address-${item.id}`}
                  rows={2}
                  maxLength={300}
                  aria-invalid={addressErr ? true : undefined}
                  aria-describedby={
                    addressErr ? `event-address-${item.id}-err` : undefined
                  }
                  value={item.venueAddress}
                  onChange={(event) =>
                    updateField(index, "venueAddress", event.target.value)
                  }
                  className={inputClassName}
                  style={inputStyle}
                />
                <ErrorText
                  id={`event-address-${item.id}-err`}
                  message={addressErr}
                />
              </div>

              <div>
                <label
                  htmlFor={`event-maps-${item.id}`}
                  className="block text-sm font-medium"
                >
                  Tautan Google Maps
                </label>
                <input
                  id={`event-maps-${item.id}`}
                  type="url"
                  aria-invalid={mapsErr ? true : undefined}
                  aria-describedby={
                    mapsErr ? `event-maps-${item.id}-err` : undefined
                  }
                  placeholder="https://maps.google.com/..."
                  value={item.mapsUrl}
                  onChange={(event) =>
                    updateField(index, "mapsUrl", event.target.value)
                  }
                  className={inputClassName}
                  style={inputStyle}
                />
                <p className="mt-1 text-xs opacity-75">
                  Kosongkan jika tombol Google Maps untuk acara ini ingin
                  disembunyikan.
                </p>
                <ErrorText id={`event-maps-${item.id}-err`} message={mapsErr} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
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
