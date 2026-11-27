import { createHash, createHmac, randomBytes } from "node:crypto";
import { del, put } from "@vercel/blob";
import { getConfiguredR2PublicUrl, isVercelBlobUrl } from "@/lib/media-utils";

const R2_REGION = "auto";
const R2_SERVICE = "s3";
const R2_FETCH_TIMEOUT_MS = 15_000;
const R2_ACCOUNT_ID_REGEX = /^[a-z0-9]{16,64}$/i;
const R2_BUCKET_NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/;

export type ActiveStorageProvider = "r2" | "vercel-blob" | "none";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
}

function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName = process.env.R2_BUCKET_NAME?.trim() ?? "";
  const publicBaseUrl = getConfiguredR2PublicUrl() ?? "";

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicBaseUrl ||
    !R2_ACCOUNT_ID_REGEX.test(accountId) ||
    !R2_BUCKET_NAME_REGEX.test(bucketName)
  ) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
  };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

export function isVercelBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL_OIDC_TOKEN
  );
}

export function getActiveStorageProvider(): ActiveStorageProvider {
  if (isR2Configured()) {
    return "r2";
  }
  if (isVercelBlobConfigured()) {
    return "vercel-blob";
  }
  return "none";
}

export function isMediaStorageConfigured(): boolean {
  return getActiveStorageProvider() !== "none";
}

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function encodeRfc3986(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function encodeObjectPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeRfc3986)
    .join("/");
}

export function createR2SignedRequest(params: {
  method: "PUT" | "DELETE";
  objectKey: string;
  body: Buffer;
  contentType?: string;
  cacheControl?: string;
  config: R2Config;
  now?: Date;
}): { url: string; headers: Record<string, string> } {
  const { method, objectKey, body, contentType, cacheControl, config } = params;
  const now = params.now ?? new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const encodedBucket = encodeRfc3986(config.bucketName);
  const encodedKey = encodeObjectPath(objectKey);
  const canonicalUri = `/${encodedBucket}/${encodedKey}`;
  const payloadHash = sha256Hex(body);

  const headerMap: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) {
    headerMap["content-type"] = contentType;
  }
  if (cacheControl) {
    headerMap["cache-control"] = cacheControl;
  }

  const sortedHeaderKeys = Object.keys(headerMap).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${headerMap[key].trim()}\n`)
    .join("");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${R2_REGION}/${R2_SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, R2_REGION);
  const kService = hmacSha256(kRegion, R2_SERVICE);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning)
    .update(stringToSign)
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders: Record<string, string> = {
    Authorization: authorization,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) {
    requestHeaders["Content-Type"] = contentType;
  }
  if (cacheControl) {
    requestHeaders["Cache-Control"] = cacheControl;
  }

  return {
    url: `https://${host}${canonicalUri}`,
    headers: requestHeaders,
  };
}

function appendRandomSuffix(pathname: string): string {
  const cleanPath = pathname.replace(/^\/+/, "");
  const suffix = randomBytes(8).toString("hex");
  const lastSlash = cleanPath.lastIndexOf("/");
  const lastDot = cleanPath.lastIndexOf(".");

  if (lastDot > lastSlash) {
    return `${cleanPath.slice(0, lastDot)}-${suffix}${cleanPath.slice(lastDot)}`;
  }
  return `${cleanPath}-${suffix}`;
}

const RAW_TRAVERSAL_REGEX = /(?:^|\/)(?:\.\.?|%2e(?:%2e)?)(?:\/|[?#]|$)|\\|%5c/i;

export function extractR2ObjectKey(
  url: string,
  publicBaseUrl: string
): string | null {
  if (RAW_TRAVERSAL_REGEX.test(url)) {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    const parsedBase = new URL(publicBaseUrl);
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.origin !== parsedBase.origin
    ) {
      return null;
    }

    const basePath = parsedBase.pathname.replace(/\/+$/, "");
    const prefix = basePath ? `${basePath}/` : "/";
    if (!parsedUrl.pathname.startsWith(prefix)) {
      return null;
    }

    const encodedKey = parsedUrl.pathname.slice(prefix.length);
    if (!encodedKey) {
      return null;
    }

    const rawSegments = encodedKey.split("/");
    const decodedSegments: string[] = [];
    for (const rawSegment of rawSegments) {
      if (!rawSegment) {
        return null;
      }
      const decoded = decodeURIComponent(rawSegment);
      if (
        !decoded ||
        decoded === "." ||
        decoded === ".." ||
        decoded.includes("/") ||
        decoded.includes("\\") ||
        CONTROL_CHAR_REGEX.test(decoded)
      ) {
        return null;
      }
      decodedSegments.push(decoded);
    }

    const key = decodedSegments.join("/");
    if (!key.startsWith("framea/")) {
      return null;
    }

    return key;
  } catch {
    return null;
  }
}

export async function uploadMediaObject(params: {
  pathname: string;
  body: Buffer;
  contentType: string;
}): Promise<{ url: string; provider: Exclude<ActiveStorageProvider, "none"> }> {
  const r2Config = getR2Config();
  if (r2Config) {
    const objectKey = appendRandomSuffix(params.pathname);
    const signed = createR2SignedRequest({
      method: "PUT",
      objectKey,
      body: params.body,
      contentType: params.contentType,
      cacheControl: "public, max-age=31536000, immutable",
      config: r2Config,
    });

    const response = await fetch(signed.url, {
      method: "PUT",
      headers: signed.headers,
      body: new Uint8Array(params.body),
      signal: AbortSignal.timeout(R2_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `R2 upload failed (${response.status}): ${detail.slice(0, 200)}`
      );
    }

    const encodedPublicPath = encodeObjectPath(objectKey);
    return {
      url: `${r2Config.publicBaseUrl}/${encodedPublicPath}`,
      provider: "r2",
    };
  }

  if (isVercelBlobConfigured()) {
    const blob = await put(params.pathname, params.body, {
      access: "public",
      contentType: params.contentType,
      addRandomSuffix: true,
    });
    return {
      url: blob.url,
      provider: "vercel-blob",
    };
  }

  throw new Error(
    "Penyimpanan media belum dikonfigurasi. Lengkapi variabel Cloudflare R2 atau Vercel Blob."
  );
}

export async function deleteMediaObjects(urls: string[]): Promise<void> {
  const uniqueUrls = Array.from(
    new Set(urls.map((url) => url.trim()).filter(Boolean))
  );
  if (uniqueUrls.length === 0) {
    return;
  }

  const r2Config = getR2Config();
  const blobUrls: string[] = [];
  const r2Keys: string[] = [];

  for (const url of uniqueUrls) {
    if (isVercelBlobUrl(url)) {
      blobUrls.push(url);
      continue;
    }

    if (r2Config) {
      const key = extractR2ObjectKey(url, r2Config.publicBaseUrl);
      if (key) {
        r2Keys.push(key);
      }
    }
  }

  const tasks: Array<Promise<void>> = [];

  if (blobUrls.length > 0 && isVercelBlobConfigured()) {
    tasks.push(
      del(blobUrls).then(() => undefined)
    );
  }

  if (r2Keys.length > 0 && r2Config) {
    for (const objectKey of r2Keys) {
      tasks.push(
        (async () => {
          const signed = createR2SignedRequest({
            method: "DELETE",
            objectKey,
            body: Buffer.alloc(0),
            config: r2Config,
          });
          const response = await fetch(signed.url, {
            method: "DELETE",
            headers: signed.headers,
            signal: AbortSignal.timeout(R2_FETCH_TIMEOUT_MS),
          });
          if (!response.ok && response.status !== 404) {
            const detail = await response.text().catch(() => "");
            throw new Error(
              `R2 delete failed (${response.status}): ${detail.slice(0, 200)}`
            );
          }
        })()
      );
    }
  }

  await Promise.all(tasks);
}

export function getFriendlyStorageError(error: unknown): string {
  const raw = error instanceof Error ? error.message.toLowerCase() : "";
  if (raw.includes("r2 upload failed") || raw.includes("r2 delete failed")) {
    if (raw.includes("(401)") || raw.includes("(403)")) {
      return "Autentikasi Cloudflare R2 ditolak. Periksa kembali R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan izin bucket R2.";
    }
    if (raw.includes("(404)")) {
      return "Bucket Cloudflare R2 tidak ditemukan. Periksa kembali nilai R2_BUCKET_NAME.";
    }
    return "Gagal mengakses Cloudflare R2. Periksa konfigurasi R2 lalu coba lagi.";
  }
  if (raw.includes("private")) {
    return "Blob Store berstatus Private. Gunakan Blob Store dengan akses Public agar media dapat ditampilkan di undangan.";
  }
  if (
    raw.includes("token") ||
    raw.includes("access") ||
    raw.includes("oidc") ||
    raw.includes("unauthorized")
  ) {
    return "Autentikasi penyimpanan media gagal. Pastikan variabel Cloudflare R2 atau Vercel Blob sudah benar lalu Redeploy.";
  }
  return "Gagal memproses berkas di penyimpanan media. Silakan coba lagi.";
}
