"use client";

import type { SiteConfig, StoryItem } from "@/lib/config-schema";

interface StoryManagerProps {
  story: SiteConfig["story"];
  fieldErrors: Record<string, string>;
  onChangeStory: (nextStory: SiteConfig["story"]) => void;
  onClearError: (key: string) => void;
}

const MAX_STORY_ITEMS = 8;

function generateStoryId(): string {
  return `kisah-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function StoryManager({
  story,
  fieldErrors,
  onChangeStory,
  onClearError,
}: StoryManagerProps) {
  const items = story.items;

  const updateMeta = <K extends "title" | "introText">(
    key: K,
    value: SiteConfig["story"][K]
  ) => {
    onChangeStory({
      ...story,
      [key]: value,
    });
    onClearError(`story.${key}`);
  };

  const addItem = () => {
    if (items.length >= MAX_STORY_ITEMS) {
      return;
    }

    const nextNumber = items.length + 1;
    const newItem: StoryItem = {
      id: generateStoryId(),
      period: `Tahap ${nextNumber}`,
      title: "",
      description: "",
    };

    onChangeStory({
      ...story,
      items: [...items, newItem],
    });
  };

  const updateItemField = <K extends keyof StoryItem>(
    index: number,
    key: K,
    value: StoryItem[K]
  ) => {
    const nextItems = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    );
    onChangeStory({
      ...story,
      items: nextItems,
    });
    onClearError(`story.items.${index}.${String(key)}`);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }
    const nextItems = [...items];
    const [moved] = nextItems.splice(index, 1);
    if (!moved) {
      return;
    }
    nextItems.splice(targetIndex, 0, moved);
    onChangeStory({
      ...story,
      items: nextItems,
    });
  };

  const removeItem = (index: number) => {
    onChangeStory({
      ...story,
      items: items.filter((_, itemIndex) => itemIndex !== index),
    });
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
      aria-label="Pengaturan Our Story"
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
            Our Story (Runtutan Kisah)
          </h2>
          <p className="mt-0.5 text-sm opacity-75">
            Ceritakan perjalanan kisah calon pengantin secara berurutan dari
            pertemuan pertama hingga hari pernikahan.
          </p>
        </div>
        <span
          className="rounded-md px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-accent)",
          }}
        >
          {items.length} / {MAX_STORY_ITEMS} momen
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="story-section-title"
            className="block text-sm font-medium"
          >
            Judul Section
          </label>
          <input
            id="story-section-title"
            type="text"
            maxLength={80}
            aria-invalid={fieldErrors["story.title"] ? true : undefined}
            aria-describedby={
              fieldErrors["story.title"] ? "err-story-title" : undefined
            }
            value={story.title}
            onChange={(event) => updateMeta("title", event.target.value)}
            placeholder="Kisah Kami"
            className={inputClassName}
            style={inputStyle}
          />
          <ErrorText id="err-story-title" message={fieldErrors["story.title"]} />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="story-section-intro"
              className="block text-sm font-medium"
            >
              Teks Pengantar (Opsional)
            </label>
            <span className="text-xs opacity-75">
              {story.introText.length}/300
            </span>
          </div>
          <textarea
            id="story-section-intro"
            rows={2}
            maxLength={300}
            aria-invalid={fieldErrors["story.introText"] ? true : undefined}
            aria-describedby={
              fieldErrors["story.introText"] ? "err-story-intro" : undefined
            }
            value={story.introText}
            onChange={(event) => updateMeta("introText", event.target.value)}
            className={inputClassName}
            style={inputStyle}
          />
          <ErrorText
            id="err-story-intro"
            message={fieldErrors["story.introText"]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold">Daftar Momen Linimasa</p>
        <button
          type="button"
          disabled={items.length >= MAX_STORY_ITEMS}
          onClick={addItem}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-primary)",
            color: "var(--color-text)",
          }}
        >
          + Tambah Momen Kisah
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed px-5 py-8 text-center text-sm opacity-75"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          Belum ada momen kisah. Klik &ldquo;+ Tambah Momen Kisah&rdquo; untuk
          mulai menyusun linimasa.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const periodErr = fieldErrors[`story.items.${index}.period`];
            const titleErr = fieldErrors[`story.items.${index}.title`];
            const descErr = fieldErrors[`story.items.${index}.description`];

            return (
              <article
                key={item.id}
                className="space-y-4 rounded-2xl border p-4 sm:p-5"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 32%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 32%, transparent)",
                }}
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-2">
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
                      {item.title.trim() || `Momen ${index + 1}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveItem(index, -1)}
                      aria-label={`Naikkan urutan momen ${index + 1}`}
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
                      onClick={() => moveItem(index, 1)}
                      aria-label={`Turunkan urutan momen ${index + 1}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
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
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`story-period-${item.id}`}
                      className="block text-sm font-medium"
                    >
                      Tahun / Periode
                    </label>
                    <input
                      id={`story-period-${item.id}`}
                      type="text"
                      maxLength={40}
                      aria-invalid={periodErr ? true : undefined}
                      aria-describedby={
                        periodErr ? `err-story-period-${item.id}` : undefined
                      }
                      value={item.period}
                      onChange={(event) =>
                        updateItemField(index, "period", event.target.value)
                      }
                      placeholder="Contoh: 2021 / Mei 2023"
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <ErrorText
                      id={`err-story-period-${item.id}`}
                      message={periodErr}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`story-title-${item.id}`}
                      className="block text-sm font-medium"
                    >
                      Judul Momen
                    </label>
                    <input
                      id={`story-title-${item.id}`}
                      type="text"
                      maxLength={80}
                      aria-invalid={titleErr ? true : undefined}
                      aria-describedby={
                        titleErr ? `err-story-title-${item.id}` : undefined
                      }
                      value={item.title}
                      onChange={(event) =>
                        updateItemField(index, "title", event.target.value)
                      }
                      placeholder="Contoh: Pertama Bertemu / Lamaran"
                      className={inputClassName}
                      style={inputStyle}
                    />
                    <ErrorText
                      id={`err-story-title-${item.id}`}
                      message={titleErr}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`story-desc-${item.id}`}
                      className="block text-sm font-medium"
                    >
                      Cerita Singkat
                    </label>
                    <span className="text-xs opacity-75">
                      {item.description.length}/400
                    </span>
                  </div>
                  <textarea
                    id={`story-desc-${item.id}`}
                    rows={3}
                    maxLength={400}
                    aria-invalid={descErr ? true : undefined}
                    aria-describedby={
                      descErr ? `err-story-desc-${item.id}` : undefined
                    }
                    value={item.description}
                    onChange={(event) =>
                      updateItemField(index, "description", event.target.value)
                    }
                    placeholder="Tulis cerita momen ini..."
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <ErrorText
                    id={`err-story-desc-${item.id}`}
                    message={descErr}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
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
