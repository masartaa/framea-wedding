"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import {
  compressImageFile,
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

interface MediaManagerProps {
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

export function MediaManager({
  config,
  onChangeHeroPhoto,
  onChangeCouplePhoto,
  onChangeGallery,
  onChangeMusic,
}: MediaManagerProps) {
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(
    null
  );
  const [notice, setNotice] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);
  const [previewPresetId, setPreviewPresetId] = useState<
    Exclude<MusicPresetId, ""> | null
  >(null);
  const synthRef = useRef<PresetSynthController | null>(null);

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

  const uploadSingleFile = async (
    rawFile: File,
    kind: MediaKind,
    sortOrder = 0
  ): Promise<{ url: string; compressionInfo: string }> => {
    let fileToUpload = rawFile;
    let compressionInfo = formatFileSize(rawFile.size);

    if (kind !== "musik") {
      const compressed = await compressImageFile(rawFile);
      fileToUpload = compressed.file;
      if (compressed.compressedSize < compressed.originalSize) {
        compressionInfo = `${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)}`;
      }
      if (fileToUpload.size > MAX_IMAGE_BYTES) {
        throw new Error(
          "Ukuran foto masih melebihi 2 MB setelah kompresi. Gunakan foto beresolusi lebih kecil."
        );
      }
    } else if (fileToUpload.size > MAX_AUDIO_BYTES) {
      throw new Error(
        `Ukuran musik maksimal 4 MB (berkas Anda ${formatFileSize(fileToUpload.size)}).`
      );
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("kind", kind);
    formData.append("sortOrder", String(sortOrder));

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadResponseBody;
    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Gagal mengunggah berkas.");
    }

    return { url: data.url, compressionInfo };
  };

  const handleHeroUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setNotice(null);
    setUploadingTarget("hero");
    try {
      const { url, compressionInfo } = await uploadSingleFile(file, "hero");
      onChangeHeroPhoto(url);
      setNotice({
        type: "info",
        message: `Foto hero berhasil diunggah (${compressionInfo}). Klik "Simpan & Publikasikan" untuk menayangkan perubahan.`,
      });
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal mengunggah foto hero.",
      });
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleCoupleUpload = async (
    who: "groom" | "bride",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setNotice(null);
    setUploadingTarget(who);
    try {
      const { url, compressionInfo } = await uploadSingleFile(file, "mempelai");
      onChangeCouplePhoto(who, url);
      setNotice({
        type: "info",
        message: `Foto mempelai berhasil diunggah (${compressionInfo}). Jangan lupa klik "Simpan & Publikasikan".`,
      });
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengunggah foto mempelai.",
      });
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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
    setNotice(null);
    setUploadingTarget("galeri");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < filesToProcess.length; i += 1) {
        const file = filesToProcess[i];
        if (!file) {
          continue;
        }
        const { url } = await uploadSingleFile(
          file,
          "galeri",
          currentUrls.length + i
        );
        uploadedUrls.push(url);
      }

      onChangeGallery([...currentUrls, ...uploadedUrls]);
      const skippedNotice =
        selectedFiles.length > remainingSlots
          ? ` (${selectedFiles.length - remainingSlots} foto dilewati karena batas maksimal ${MAX_GALLERY_PHOTOS} foto)`
          : "";
      setNotice({
        type: "info",
        message: `${uploadedUrls.length} foto galeri berhasil diunggah${skippedNotice}. Klik "Simpan & Publikasikan" untuk menyimpan.`,
      });
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengunggah foto galeri.",
      });
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
      const { url, compressionInfo } = await uploadSingleFile(file, "musik");
      onChangeMusic(url, "");
      setNotice({
        type: "info",
        message: `Musik latar berhasil diunggah (${compressionInfo}). Klik "Simpan & Publikasikan" agar aktif di undangan.`,
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

  return (
    <section
      aria-label="Pengaturan Media"
      className="space-y-6 rounded-3xl border px-5 py-6 sm:px-6"
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
          Foto otomatis dikompres sebelum diunggah ke Vercel Blob (maks. 2 MB
          per foto). Musik mendukung MP3/M4A/OGG (maks. 4 MB) atau pilih preset.
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

      {/* Foto Hero */}
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
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs opacity-65">
                Belum ada foto
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5">
            <div>
              <h3 className="text-sm font-semibold">Foto Hero Utama</h3>
              <p className="text-xs opacity-75">
                Tampil di bagian paling atas setelah sampul dibuka. Disarankan
                orientasi potret (3:4) atau persegi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold ${
                  isBusy ? "pointer-events-none opacity-60" : "cursor-pointer"
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
                      ? "Ganti Foto Hero"
                      : "Unggah Foto Hero"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleHeroUpload}
                  disabled={isBusy}
                  className="sr-only"
                />
              </label>

              {config.media.heroPhotoUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onChangeHeroPhoto("")}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium disabled:opacity-50"
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

      {/* Foto Kedua Mempelai */}
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
                <div className="flex h-full w-full items-center justify-center px-2 text-xs opacity-65">
                  Kosong
                </div>
              )}
            </div>

            <h3 className="mt-3 text-sm font-semibold">{title}</h3>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-semibold ${
                  isBusy ? "pointer-events-none opacity-60" : "cursor-pointer"
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
                      ? "Ganti Foto"
                      : "Unggah Foto"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleCoupleUpload(who, event)}
                  disabled={isBusy}
                  className="sr-only"
                />
              </label>

              {photoUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onChangeCouplePhoto(who, "")}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium disabled:opacity-50"
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

      {/* Galeri Maksimal 6 Foto */}
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
              Maksimal {MAX_GALLERY_PHOTOS} foto. Anda bisa menggeser urutan
              tampilnya.
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
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
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border text-sm disabled:opacity-40"
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
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border px-2 text-xs font-medium disabled:opacity-40"
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
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border text-sm disabled:opacity-40"
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
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs opacity-70">
            Belum ada foto galeri yang diunggah.
          </p>
        )}

        <div>
          <label
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold ${
              isBusy || galleryPhotos.length >= MAX_GALLERY_PHOTOS
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
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
                  : "Tambah Foto Galeri"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryUpload}
              disabled={isBusy || galleryPhotos.length >= MAX_GALLERY_PHOTOS}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Musik Latar */}
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

        {/* Unggah Audio Sendiri */}
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
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-semibold ${
                  isBusy ? "pointer-events-none opacity-60" : "cursor-pointer"
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
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
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

        {/* Preset Musik Ringan */}
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
                className="min-h-11 cursor-pointer px-2 text-xs font-medium underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                Matikan Musik (Tanpa Musik)
              </button>
            ) : (
              <span className="text-xs opacity-65">Saat ini: Tanpa Musik</span>
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
                      className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-semibold"
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
                      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-medium"
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
    </section>
  );
}
