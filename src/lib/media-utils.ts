export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // 4 MB (aman di bawah batas 4,5 MB Vercel Hobby)
export const MAX_GALLERY_PHOTOS = 6;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
] as const;

export type MediaKind = "hero" | "mempelai" | "galeri" | "musik";

export type MusicPresetId =
  | ""
  | "piano-lembut"
  | "kotak-musik"
  | "akustik-hangat";

export interface MusicPresetOption {
  id: Exclude<MusicPresetId, "">;
  name: string;
  description: string;
}

export const MUSIC_PRESETS: ReadonlyArray<MusicPresetOption> = [
  {
    id: "piano-lembut",
    name: "Piano Lembut",
    description: "Alunan piano mayor pelan bernuansa klasik dan hangat.",
  },
  {
    id: "kotak-musik",
    name: "Kotak Musik",
    description: "Melodi lembut bernada tinggi seperti kotak musik romantis.",
  },
  {
    id: "akustik-hangat",
    name: "Akustik Hangat",
    description: "Harmoni akor lembut dengan tempo santai dan intim.",
  },
];

export function isValidMusicPreset(
  value: string
): value is Exclude<MusicPresetId, ""> {
  return MUSIC_PRESETS.some((preset) => preset.id === value);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2).replace(".", ",")} MB`;
}

export function isVercelBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function loadImageElement(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export async function compressImageFile(
  file: File,
  maxDimension = 1600
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return { file, originalSize, compressedSize: file.size };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const largestSide = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
    const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { file, originalSize, compressedSize: file.size };
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const qualities = [0.82, 0.72, 0.6];
    let bestBlob: Blob | null = null;

    for (const mimeType of ["image/webp", "image/jpeg"]) {
      for (const quality of qualities) {
        const candidate = await canvasToBlob(canvas, mimeType, quality);
        if (!candidate) {
          continue;
        }
        bestBlob = candidate;
        if (candidate.size <= MAX_IMAGE_BYTES) {
          break;
        }
      }
      if (bestBlob && bestBlob.size <= MAX_IMAGE_BYTES) {
        break;
      }
    }

    if (!bestBlob) {
      return { file, originalSize, compressedSize: file.size };
    }

    if (bestBlob.size >= originalSize && originalSize <= MAX_IMAGE_BYTES) {
      return { file, originalSize, compressedSize: originalSize };
    }

    const extension = bestBlob.type === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "") || "foto";
    const compressedFile = new File([bestBlob], `${baseName}.${extension}`, {
      type: bestBlob.type,
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
