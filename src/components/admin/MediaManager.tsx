"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import {
  formatFileSize,
  MAX_AUDIO_BYTES,
  MAX_GALLERY_PHOTOS,
  MAX_IMAGE_BYTES,
  MUSIC_PRESETS,
  type MediaKind,
  type MusicPresetId,
} from "@/lib/media-utils";
import {
  createPresetSynth,
  type PresetSynthController,
} from "@/lib/preset-synth";
import { ImageCropModal, type CropSpec } from "./ImageCropModal";

interface MediaManagerProps {
  invitationSlug: string;
  config: SiteConfig;
  onChangeHeroPhoto: (url: string) => void;
  onChangeCouplePhoto: (who: "groom" | "bride", url: string) => void;
  onChangeGallery: (urls: string[]) => void;
  onChangeMusic: (musicUrl: string, musicPreset: string) => void;
}

interface UploadResponseBody {
  ok?: boolean;
  url?: string;
  error?: string;
}

type UploadTarget = "hero" | "groom" | "bride" | "galeri" | "musik";

interface CropQueueState {
  target: Exclude<UploadTarget, "musik">;
  files: File[];
  index: number;
  spec: CropSpec;
  sessionKey: number;
}

function getHeroCropSpec(layout: SiteConfig["theme"]["layout"]): CropSpec {
  const shape = layout.heroShape ?? "rounded";

  if (shape === "circle") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "1:1 (Lingkaran)",
      aspectRatio: 1,
      outputWidth: 1080,
      outputHeight: 1080,
      circularGuide: true,
    };
  }
  if (shape === "oval") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "3:4 (Oval Vertikal)",
      aspectRatio: 3 / 4,
      outputWidth: 1080,
      outputHeight: 1440,
      circularGuide: true,
    };
  }
  if (shape === "arch") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "3:4 (Lengkung Kubah)",
      aspectRatio: 3 / 4,
      outputWidth: 1200,
      outputHeight: 1600,
      circularGuide: false,
    };
  }
  if (shape === "square") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "1:1 (Persegi)",
      aspectRatio: 1,
      outputWidth: 1080,
      outputHeight: 1080,
      circularGuide: false,
    };
  }
  if (layout.hero === "split") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "4:3 (Proporsional)",
      aspectRatio: 4 / 3,
      outputWidth: 1440,
      outputHeight: 1080,
      circularGuide: false,
    };
  }
  if (layout.hero === "centered") {
    return {
      title: "Potong Foto Hero",
      aspectLabel: "1:1 (Ringkas Tengah)",
      aspectRatio: 1,
      outputWidth: 1080,
      outputHeight: 1080,
      circularGuide: false,
    };
  }
  return {
    title: "Potong Foto Hero",
    aspectLabel: "3:4 (Potret Penuh)",
    aspectRatio: 3 / 4,
    outputWidth: 1200,
    outputHeight: 1600,
    circularGuide: false,
  };
}

function getCoupleCropSpec(who: "groom" | "bride"): CropSpec {
  return {
    title:
      who === "groom"
        ? "Potong Foto Mempelai Pria"
        : "Potong Foto Mempelai Wanita",
    aspectLabel: "1:1 (Bingkai Bulat)",
    aspectRatio: 1,
    outputWidth: 900,
    outputHeight: 900,
    circularGuide: true,
  };
}

const GALLERY_CROP_SPEC: CropSpec = {
  title: "Potong Foto Galeri",
  aspectLabel: "4:5 (Kartu Galeri)",
  aspectRatio: 4 / 5,
  outputWidth: 1080,
  outputHeight: 1350,
  circularGuide: false,
};

export function MediaManager({
  invitationSlug,
  config,
  onChangeHeroPhoto,
  onChangeCouplePhoto,
  onChangeGallery,
  onChangeMusic,
}: MediaManagerProps) {
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(
    null
  );
  const [cropQueue, setCropQueue] = useState<CropQueueState | null>(null);
  const [notice, setNotice] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);
  const [previewPresetId, setPreviewPresetId] = useState<
    Exclude<MusicPresetId, ""> | null
  >(null);
  const synthRef = useRef<PresetSynthController | null>(null);
  const cropSessionCounterRef = useRef(0);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  const stopPresetPreview = () => {
    synthRef.current?.dispose();
    synthRef.current = null;
    setPreviewPresetId(null);
  };

  const togglePresetPreview = async (presetId: Exclude<MusicPresetId, "">) => {
    if (previewPresetId === presetId) {
      stopPresetPreview();
      return;
    }

    stopPresetPreview();
    const synth = createPresetSynth(presetId);
    synthRef.current = synth;
    const started = await synth.start();
    if (started) {
      setPreviewPresetId(presetId);
    } else {
      setNotice({
        type: "error",
        message: "Browser tidak mendukung pemutar pratinjau audio.",
      });
    }
  };

  const uploadPreparedFile = async (
    fileToUpload: File,
    kind: MediaKind,
    sortOrder = 0
  ): Promise<string> => {
    if (kind === "musik") {
      if (fileToUpload.size > MAX_AUDIO_BYTES) {
        throw new Error(
          `Ukuran musik maksimal 4 MB (berkas Anda ${formatFileSize(fileToUpload.size)}).`
        );
      }
    } else if (fileToUpload.size > MAX_IMAGE_BYTES) {
      throw new Error(
        "Ukuran foto masih melebihi 2 MB setelah dipotong dan dikompres. Coba pilih foto lain."
      );
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("kind", kind);
    formData.append("slug", invitationSlug);
    formData.append("sortOrder", String(sortOrder));

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadResponseBody;
    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Gagal mengunggah berkas.");
    }

    return data.url;
  };

  const openCropQueue = (
    target: Exclude<UploadTarget, "musik">,
    files: File[],
    spec: CropSpec
  ) => {
    cropSessionCounterRef.current += 1;
    setNotice(null);
    setCropQueue({
      target,
      files,
      index: 0,
      spec,
      sessionKey: cropSessionCounterRef.current,
    });
  };

  const handleHeroSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    openCropQueue("hero", [file], getHeroCropSpec(config.theme.layout));
  };

  const handleCoupleSelect = (
    who: "groom" | "bride",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    openCropQueue(who, [file], getCoupleCropSpec(who));
  };

  const handleGallerySelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) {
      return;
    }

    const currentUrls = config.media.galleryPhotoUrls.filter(Boolean);
    const remainingSlots = MAX_GALLERY_PHOTOS - currentUrls.length;
    if (remainingSlots <= 0) {
      setNotice({
        type: "error",
        message: `Galeri sudah penuh (maksimal ${MAX_GALLERY_PHOTOS} foto).`,
      });
      return;
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    openCropQueue("galeri", filesToProcess, GALLERY_CROP_SPEC);
  };

  const advanceCropQueue = (queue: CropQueueState) => {
    const nextIndex = queue.index + 1;
    if (nextIndex < queue.files.length) {
      cropSessionCounterRef.current += 1;
      setCropQueue({
        ...queue,
        index: nextIndex,
        sessionKey: cropSessionCounterRef.current,
      });
    } else {
      setCropQueue(null);
    }
  };

  const handleCropConfirm = async (cropped: {
    file: File;
    originalSize: number;
    compressedSize: number;
  }) => {
    if (!cropQueue) {
      return;
    }

    const currentQueue = cropQueue;
    const sizeInfo =
      cropped.compressedSize < cropped.originalSize
        ? `${formatFileSize(cropped.originalSize)} → ${formatFileSize(cropped.compressedSize)}`
        : formatFileSize(cropped.compressedSize);

    setUploadingTarget(currentQueue.target);
    try {
      if (currentQueue.target === "hero") {
        const url = await uploadPreparedFile(cropped.file, "hero");
        onChangeHeroPhoto(url);
        setNotice({
          type: "info",
          message: `Foto hero berhasil dipotong & diunggah (${sizeInfo}). Klik "Simpan & Publikasikan" untuk menayangkan.`,
        });
      } else if (
        currentQueue.target === "groom" ||
        currentQueue.target === "bride"
      ) {
        const url = await uploadPreparedFile(cropped.file, "mempelai");
        onChangeCouplePhoto(currentQueue.target, url);
        setNotice({
          type: "info",
          message: `Foto mempelai berhasil dipotong & diunggah (${sizeInfo}). Klik "Simpan & Publikasikan" untuk menyimpan.`,
        });
      } else {
        const currentUrls = config.media.galleryPhotoUrls.filter(Boolean);
        if (currentUrls.length >= MAX_GALLERY_PHOTOS) {
          setNotice({
            type: "error",
            message: `Galeri sudah penuh (maksimal ${MAX_GALLERY_PHOTOS} foto).`,
          });
          setCropQueue(null);
          return;
        }
        const url = await uploadPreparedFile(
          cropped.file,
          "galeri",
          currentUrls.length
        );
        onChangeGallery([...currentUrls, url]);
        setNotice({
          type: "info",
          message: `Foto galeri ${currentQueue.index + 1}/${currentQueue.files.length} berhasil dipotong & diunggah (${sizeInfo}). Jangan lupa klik "Simpan & Publikasikan".`,
        });
      }

      advanceCropQueue(currentQueue);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal mengunggah foto.",
      });
      throw error;
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleMusicUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    stopPresetPreview();
    setNotice(null);
    setUploadingTarget("musik");
    try {
      const url = await uploadPreparedFile(file, "musik");
      onChangeMusic(url, "");
      setNotice({
        type: "info",
        message: `Musik latar berhasil diunggah (${formatFileSize(file.size)}). Klik "Simpan & Publikasikan" agar aktif di undangan.`,
      });
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal mengunggah musik.",
      });
    } finally {
      setUploadingTarget(null);
    }
  };

  const moveGalleryPhoto = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    const current = [...config.media.galleryPhotoUrls];
    if (targetIndex < 0 || targetIndex >= current.length) {
      return;
    }
    const [moved] = current.splice(index, 1);
    if (!moved) {
      return;
    }
    current.splice(targetIndex, 0, moved);
    onChangeGallery(current);
  };

  const removeGalleryPhoto = (index: number) => {
    onChangeGallery(
      config.media.galleryPhotoUrls.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const galleryPhotos = config.media.galleryPhotoUrls.filter(Boolean);
  const isBusy = uploadingTarget !== null;
  const heroSpec = getHeroCropSpec(config.theme.layout);
  const currentCropFile = cropQueue ? cropQueue.files[cropQueue.index] : null;

  return (
    <section
      aria-label="Pengaturan Media"
      className="space-y-6 rounded-2xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Foto &amp; Musik Latar
        </h2>
        <p className="mt-0.5 text-sm opacity-75">
          Setiap foto dapat dipotong (crop) dan diposisikan sesuai bingkai
          tampilannya sebelum dikompres dan diunggah ke Vercel Blob (maks. 2 MB
          per foto).
        </p>
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

      <div
        className="rounded-2xl border p-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            {config.media.heroPhotoUrl ? (
              <Image
                src={config.media.heroPhotoUrl}
                alt="Foto hero undangan"
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs opacity-75">
                Belum ada foto
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5">
            <div>
              <h3 className="text-sm font-semibold">Foto Hero Utama</h3>
              <p className="text-xs opacity-75">
                Rasio potong otomatis mengikuti layout Hero aktif:{" "}
                <strong>{heroSpec.aspectLabel}</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 ${
                  isBusy ? "pointer-events-none opacity-60" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                }}
              >
                <span>
                  {uploadingTarget === "hero"
                    ? "Mengunggah..."
                    : config.media.heroPhotoUrl
                      ? "Pilih & Potong Ulang"
                      : "Pilih & Potong Foto Hero"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleHeroSelect}
                  disabled={isBusy}
                  className="sr-only"
                />
              </label>

              {config.media.heroPhotoUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onChangeHeroPhoto("")}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-50"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 50%, transparent)",
                  }}
                >
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          [
            {
              who: "groom",
              title: "Foto Mempelai Pria",
              photoUrl: config.couple.groom.photoUrl,
            },
            {
              who: "bride",
              title: "Foto Mempelai Wanita",
              photoUrl: config.couple.bride.photoUrl,
            },
          ] as const
        ).map(({ who, title, photoUrl }) => (
          <div
            key={who}
            className="flex flex-col items-center rounded-2xl border p-4 text-center"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-secondary) 35%, var(--color-background))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <div
              className="relative h-24 w-24 overflow-hidden rounded-full border-2"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor: "var(--color-primary)",
              }}
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-xs opacity-75">
                  Kosong
                </div>
              )}
            </div>

            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-[11px] opacity-75">
              Bingkai bulat rasio 1:1
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 ${
                  isBusy ? "pointer-events-none opacity-60" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                }}
              >
                <span>
                  {uploadingTarget === who
                    ? "Mengunggah..."
                    : photoUrl
                      ? "Ganti & Potong"
                      : "Pilih & Potong"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleCoupleSelect(who, event)}
                  disabled={isBusy}
                  className="sr-only"
                />
              </label>

              {photoUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onChangeCouplePhoto(who, "")}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 50%, transparent)",
                  }}
                >
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div
        className="space-y-4 rounded-2xl border p-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Galeri Foto</h3>
            <p className="text-xs opacity-75">
              Maksimal {MAX_GALLERY_PHOTOS} foto dengan rasio kartu{" "}
              <strong>4:5</strong>. Anda dapat memotong dan mengatur urutannya.
            </p>
          </div>
          <span
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-accent)",
            }}
          >
            {galleryPhotos.length} / {MAX_GALLERY_PHOTOS} foto
          </span>
        </div>

        {galleryPhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryPhotos.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="overflow-hidden rounded-2xl border p-2"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 30%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                }}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                  <Image
                    src={url}
                    alt={`Galeri ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 42vw, 200px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || isBusy}
                    onClick={() => moveGalleryPhoto(index, -1)}
                    aria-label={`Geser foto ${index + 1} ke kiri`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => removeGalleryPhoto(index)}
                    aria-label={`Hapus foto ${index + 1}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border px-2 text-xs font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                      color: "var(--color-accent)",
                    }}
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    disabled={index === galleryPhotos.length - 1 || isBusy}
                    onClick={() => moveGalleryPhoto(index, 1)}
                    aria-label={`Geser foto ${index + 1} ke kanan`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs opacity-75">
            Belum ada foto galeri yang diunggah.
          </p>
        )}

        <div>
          <label
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 ${
              isBusy || galleryPhotos.length >= MAX_GALLERY_PHOTOS
                ? "pointer-events-none opacity-50"
                : ""
            }`}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            <span>
              {uploadingTarget === "galeri"
                ? "Mengunggah foto..."
                : galleryPhotos.length >= MAX_GALLERY_PHOTOS
                  ? "Kuota 6 Foto Penuh"
                  : "Tambah & Potong Foto Galeri"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGallerySelect}
              disabled={isBusy || galleryPhotos.length >= MAX_GALLERY_PHOTOS}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div
        className="space-y-4 rounded-2xl border p-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div>
          <h3 className="text-sm font-semibold">Musik Latar</h3>
          <p className="text-xs opacity-75">
            Musik baru dimuat dan diputar setelah tamu menekan tombol{" "}
            <strong>Buka Undangan</strong>.
          </p>
        </div>

        <div
          className="space-y-3 rounded-xl border p-3.5"
          style={{
            backgroundColor: config.media.musicUrl
              ? "var(--color-secondary)"
              : "var(--color-background)",
            borderColor: config.media.musicUrl
              ? "var(--color-primary)"
              : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold">
                Unggah Berkas Audio Sendiri
              </p>
              <p className="text-[11px] opacity-75">
                Format MP3, M4A, atau OGG · Maksimal 4 MB
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 ${
                  isBusy ? "pointer-events-none opacity-60" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                }}
              >
                <span>
                  {uploadingTarget === "musik"
                    ? "Mengunggah..."
                    : config.media.musicUrl
                      ? "Ganti Musik"
                      : "Unggah Musik"}
                </span>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,.mp3,.m4a,.ogg"
                  onChange={handleMusicUpload}
                  disabled={isBusy}
                  className="sr-only"
                />
              </label>

              {config.media.musicUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onChangeMusic("", "")}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 50%, transparent)",
                  }}
                >
                  Hapus Audio
                </button>
              ) : null}
            </div>
          </div>

          {config.media.musicUrl ? (
            <audio
              controls
              preload="none"
              src={config.media.musicUrl}
              className="w-full"
            />
          ) : null}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">
              Atau Pilih Preset Instrumental Ringan
            </p>
            {config.media.musicUrl || config.media.musicPreset ? (
              <button
                type="button"
                onClick={() => {
                  stopPresetPreview();
                  onChangeMusic("", "");
                }}
                className="min-h-11 rounded-xl px-2 text-xs font-medium underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
              >
                Matikan Musik (Tanpa Musik)
              </button>
            ) : (
              <span className="text-xs opacity-75">Saat ini: Tanpa Musik</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {MUSIC_PRESETS.map((preset) => {
              const isSelected =
                !config.media.musicUrl && config.media.musicPreset === preset.id;
              const isPreviewing = previewPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  className="flex flex-col justify-between rounded-xl border p-3"
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
                  <div>
                    <p className="text-xs font-semibold">{preset.name}</p>
                    <p className="mt-1 text-[11px] leading-relaxed opacity-75">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopPresetPreview();
                        onChangeMusic("", preset.id);
                      }}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--color-primary)"
                          : "var(--color-secondary)",
                        color: isSelected
                          ? "var(--color-background)"
                          : "var(--color-text)",
                      }}
                    >
                      {isSelected ? "Dipilih" : "Pilih"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void togglePresetPreview(preset.id)}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-medium transition-colors hover:bg-zinc-100 active:bg-zinc-200"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      {isPreviewing ? "Stop" : "Dengar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {cropQueue && currentCropFile ? (
        <ImageCropModal
          key={cropQueue.sessionKey}
          file={currentCropFile}
          spec={cropQueue.spec}
          queueInfo={{
            current: cropQueue.index + 1,
            total: cropQueue.files.length,
          }}
          isSubmitting={isBusy}
          onCancel={() => setCropQueue(null)}
          onSkip={
            cropQueue.files.length > 1
              ? () => advanceCropQueue(cropQueue)
              : undefined
          }
          onConfirm={handleCropConfirm}
        />
      ) : null}
    </section>
  );
}
