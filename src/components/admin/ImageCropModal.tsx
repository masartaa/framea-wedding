"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cropImageFile, type CropAreaPixels } from "@/lib/media-utils";

export interface CropSpec {
  title: string;
  aspectLabel: string;
  aspectRatio: number; // width / height
  outputWidth: number;
  outputHeight: number;
  circularGuide: boolean;
}

interface ImageCropModalProps {
  file: File;
  spec: CropSpec;
  queueInfo?: { current: number; total: number };
  isSubmitting: boolean;
  onCancel: () => void;
  onSkip?: () => void;
  onConfirm: (result: {
    file: File;
    originalSize: number;
    compressedSize: number;
  }) => Promise<void>;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function getFrameDimensions(aspectRatio: number): {
  width: number;
  height: number;
} {
  const maxWidth = 310;
  const maxHeight = 360;

  let width = maxWidth;
  let height = Math.round(width / aspectRatio);

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

function clampOffset(
  offsetX: number,
  offsetY: number,
  natW: number,
  natH: number,
  frameW: number,
  frameH: number,
  zoom: number
): { x: number; y: number } {
  const baseScale = Math.max(frameW / natW, frameH / natH);
  const totalScale = baseScale * zoom;
  const dispW = natW * totalScale;
  const dispH = natH * totalScale;

  const maxX = Math.max(0, (dispW - frameW) / 2);
  const maxY = Math.max(0, (dispH - frameH) / 2);

  return {
    x: Math.max(-maxX, Math.min(maxX, offsetX)),
    y: Math.max(-maxY, Math.min(maxY, offsetY)),
  };
}

export function ImageCropModal({
  file,
  spec,
  queueInfo,
  isSubmitting,
  onCancel,
  onSkip,
  onConfirm,
}: ImageCropModalProps) {
  const frame = getFrameDimensions(spec.aspectRatio);

  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const initialFocusable = dialog?.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    initialFocusable?.focus();

    return () => {
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    let cancelled = false;

    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) {
        setLoadedImage(img);
        setLoadError(null);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setLoadError("Berkas gambar tidak dapat dibuka. Pilih gambar lain.");
      }
    };
    img.src = objectUrl;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting && !isProcessing) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const list = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (list.length === 0) {
          return;
        }
        const first = list[0];
        const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing, isSubmitting, onCancel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(frame.width * dpr);
    canvas.height = Math.round(frame.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, frame.width, frame.height);

    const baseScale = Math.max(
      frame.width / loadedImage.naturalWidth,
      frame.height / loadedImage.naturalHeight
    );
    const totalScale = baseScale * zoom;
    const dispW = loadedImage.naturalWidth * totalScale;
    const dispH = loadedImage.naturalHeight * totalScale;

    const drawX = (frame.width - dispW) / 2 + offset.x;
    const drawY = (frame.height - dispH) / 2 + offset.y;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(loadedImage, drawX, drawY, dispW, dispH);
  }, [frame.height, frame.width, loadedImage, offset.x, offset.y, zoom]);

  const handleZoomChange = (nextZoomRaw: number) => {
    const nextZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, Math.round(nextZoomRaw * 100) / 100)
    );
    setZoom(nextZoom);

    if (loadedImage) {
      setOffset((prev) =>
        clampOffset(
          prev.x,
          prev.y,
          loadedImage.naturalWidth,
          loadedImage.naturalHeight,
          frame.width,
          frame.height,
          nextZoom
        )
      );
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!loadedImage || isSubmitting || isProcessing) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !loadedImage) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    const clamped = clampOffset(
      drag.originX + deltaX,
      drag.originY + deltaY,
      loadedImage.naturalWidth,
      loadedImage.naturalHeight,
      frame.width,
      frame.height,
      zoom
    );
    setOffset(clamped);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (drag && drag.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragStateRef.current = null;
    }
  };

  const nudgeOffset = (dx: number, dy: number) => {
    if (!loadedImage || isSubmitting || isProcessing) {
      return;
    }
    setOffset((prev) =>
      clampOffset(
        prev.x + dx,
        prev.y + dy,
        loadedImage.naturalWidth,
        loadedImage.naturalHeight,
        frame.width,
        frame.height,
        zoom
      )
    );
  };

  const handleConfirmClick = async () => {
    if (!loadedImage || isSubmitting || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setLoadError(null);
    try {
      const baseScale = Math.max(
        frame.width / loadedImage.naturalWidth,
        frame.height / loadedImage.naturalHeight
      );
      const totalScale = baseScale * zoom;
      const dispW = loadedImage.naturalWidth * totalScale;
      const dispH = loadedImage.naturalHeight * totalScale;

      const cropArea: CropAreaPixels = {
        sx: ((dispW - frame.width) / 2 - offset.x) / totalScale,
        sy: ((dispH - frame.height) / 2 - offset.y) / totalScale,
        sw: frame.width / totalScale,
        sh: frame.height / totalScale,
      };

      const cropped = await cropImageFile(
        file,
        cropArea,
        spec.outputWidth,
        spec.outputHeight
      );
      await onConfirm(cropped);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Gagal memotong gambar. Silakan coba lagi."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const busy = isSubmitting || isProcessing;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-crop-modal"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-text) 72%, black)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-5 shadow-lg"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {queueInfo && queueInfo.total > 1
                ? `Foto ${queueInfo.current} dari ${queueInfo.total}`
                : "Sesuaikan Bingkai Foto"}
            </p>
            <h2
              id="judul-crop-modal"
              className="font-heading mt-0.5 text-lg font-semibold"
            >
              {spec.title}
            </h2>
            <p className="mt-0.5 text-xs opacity-75">
              Rasio {spec.aspectLabel} · Geser foto atau gunakan tombol arah
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Tutup editor potong foto"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div
            tabIndex={loadedImage ? 0 : -1}
            aria-label="Area potong foto. Gunakan tombol panah keyboard atau seret untuk memindahkan posisi foto."
            onKeyDown={(event) => {
              const step = event.shiftKey ? 24 : 10;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                nudgeOffset(-step, 0);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                nudgeOffset(step, 0);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                nudgeOffset(0, -step);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                nudgeOffset(0, step);
              }
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative select-none touch-none overflow-hidden rounded-2xl border-2"
            style={{
              width: `${frame.width}px`,
              height: `${frame.height}px`,
              maxWidth: "100%",
              cursor: loadedImage ? "grab" : "default",
              backgroundColor: "var(--color-secondary)",
              borderColor: "var(--color-primary)",
            }}
          >
            {loadedImage ? (
              <canvas
                ref={canvasRef}
                className="block h-full w-full"
                aria-label="Pratinjau area potong foto"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs opacity-75">
                {loadError ? loadError : "Memuat foto..."}
              </div>
            )}

            {loadedImage ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                {spec.circularGuide ? (
                  <div
                    className="h-full w-full rounded-[50%] border-2"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-background) 90%, transparent)",
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
                    }}
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-x-0 top-1/3 h-px"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                    />
                    <div
                      className="absolute inset-x-0 top-2/3 h-px"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                    />
                    <div
                      className="absolute inset-y-0 left-1/3 w-px"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                    />
                    <div
                      className="absolute inset-y-0 left-2/3 w-px"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                    />
                  </>
                )}
              </div>
            ) : null}
          </div>

          {loadError ? (
            <p
              role="alert"
              className="mt-3 text-center text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {loadError}
            </p>
          ) : null}

          <div
            role="group"
            aria-label="Geser posisi foto"
            className="mt-3 flex items-center gap-2"
          >
            <button
              type="button"
              disabled={busy || !loadedImage}
              onClick={() => nudgeOffset(-16, 0)}
              aria-label="Geser foto ke kiri"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            >
              ←
            </button>
            <button
              type="button"
              disabled={busy || !loadedImage}
              onClick={() => nudgeOffset(0, -16)}
              aria-label="Geser foto ke atas"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={busy || !loadedImage}
              onClick={() => nudgeOffset(0, 16)}
              aria-label="Geser foto ke bawah"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            >
              ↓
            </button>
            <button
              type="button"
              disabled={busy || !loadedImage}
              onClick={() => nudgeOffset(16, 0)}
              aria-label="Geser foto ke kanan"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            >
              →
            </button>
          </div>

          <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="crop-zoom-range" className="font-medium">
                Perbesar (Zoom)
              </label>
              <span className="font-mono opacity-75">{zoom.toFixed(2)}×</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy || zoom <= MIN_ZOOM}
                onClick={() => handleZoomChange(zoom - 0.15)}
                aria-label="Perkecil foto"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border text-base font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                }}
              >
                −
              </button>

              <input
                id="crop-zoom-range"
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05}
                value={zoom}
                disabled={busy || !loadedImage}
                onChange={(event) =>
                  handleZoomChange(Number(event.target.value))
                }
                className="h-11 flex-1 accent-[var(--color-primary)]"
              />

              <button
                type="button"
                disabled={busy || zoom >= MAX_ZOOM}
                onClick={() => handleZoomChange(zoom + 0.15)}
                aria-label="Perbesar foto"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border text-base font-semibold transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={busy || !loadedImage}
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            Reset Posisi
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onSkip ? (
              <button
                type="button"
                disabled={busy}
                onClick={onSkip}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                }}
              >
                Lewati
              </button>
            ) : null}

            <button
              type="button"
              disabled={busy || !loadedImage}
              onClick={() => void handleConfirmClick()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              {busy ? "Mengunggah..." : "Potong & Unggah"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
