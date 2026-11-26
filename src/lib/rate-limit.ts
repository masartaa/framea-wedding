import { createHash } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_LOGIN_DELAY_MS = 800;

const WISH_WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_WISHES_PER_WINDOW = 3;

const RSVP_WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_RSVPS_PER_WINDOW = 5;

const UPLOAD_WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_UPLOADS_PER_WINDOW = 20;

const failedAttemptsByIp = new Map<string, AttemptRecord>();
const wishSubmissionsByIp = new Map<string, AttemptRecord>();
const rsvpSubmissionsByIp = new Map<string, AttemptRecord>();
const uploadSubmissionsByIp = new Map<string, AttemptRecord>();

const VALID_IP_REGEX = /^[0-9a-fA-F:.]{3,64}$/;

function cleanupExpired(store: Map<string, AttemptRecord>, now: number): void {
  if (store.size < 200) {
    return;
  }
  for (const [key, record] of store.entries()) {
    if (record.resetAt <= now) {
      store.delete(key);
    }
  }
}

function sanitizeIpCandidate(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const cleaned = raw.trim().replace(/^\[|\]$/g, "");
  if (!VALID_IP_REGEX.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export function getClientIp(headers: Headers): string {
  // Prioritaskan header yang ditetapkan langsung oleh edge platform (Vercel / Cloudflare)
  const vercelForwarded = headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const candidate = sanitizeIpCandidate(vercelForwarded.split(",")[0]);
    if (candidate) {
      return candidate;
    }
  }

  const cfIp = sanitizeIpCandidate(headers.get("cf-connecting-ip"));
  if (cfIp) {
    return cfIp;
  }

  const realIp = sanitizeIpCandidate(headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  // Untuk x-forwarded-for generik, ambil IP paling kanan yang ditambahkan proxy terdekat
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",");
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const candidate = sanitizeIpCandidate(parts[i]);
      if (candidate) {
        return candidate;
      }
    }
  }

  return "unknown";
}

function buildRateLimitKey(scope: string, ip: string): string {
  const hashed = createHash("sha256")
    .update(ip, "utf8")
    .digest("hex")
    .slice(0, 32);
  return `${scope}:${hashed}`;
}

function checkMemoryRateLimit(
  store: Map<string, AttemptRecord>,
  key: string,
  maxAttempts: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupExpired(store, now);

  const record = store.get(key);
  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.resetAt <= now) {
    store.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.resetAt - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function recordMemoryRateLimit(
  store: Map<string, AttemptRecord>,
  key: string,
  windowMs: number
): number {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return 1;
  }

  existing.count += 1;
  return existing.count;
}

async function checkDistributedRateLimit(
  scope: string,
  ip: string,
  maxAttempts: number,
  fallbackStore: Map<string, AttemptRecord>
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const key = buildRateLimitKey(scope, ip);

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const [row] = await db
        .select({
          count: rateLimits.count,
          resetAt: rateLimits.resetAt,
        })
        .from(rateLimits)
        .where(eq(rateLimits.key, key))
        .limit(1);

      const now = Date.now();
      if (!row || row.resetAt.getTime() <= now) {
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (row.count >= maxAttempts) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((row.resetAt.getTime() - now) / 1000)
        );
        return { allowed: false, retryAfterSeconds };
      }

      return { allowed: true, retryAfterSeconds: 0 };
    } catch {
      // Fallback ke in-memory jika tabel rate_limits belum tersedia atau DB sedang tidak terjangkau
    }
  }

  return checkMemoryRateLimit(fallbackStore, key, maxAttempts);
}

async function recordDistributedRateLimit(
  scope: string,
  ip: string,
  windowMs: number,
  fallbackStore: Map<string, AttemptRecord>
): Promise<number> {
  const key = buildRateLimitKey(scope, ip);

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const nextResetDate = new Date(now + windowMs);
      const nextResetIso = nextResetDate.toISOString();

      const [row] = await db
        .insert(rateLimits)
        .values({
          key,
          count: 1,
          resetAt: nextResetDate,
        })
        .onConflictDoUpdate({
          target: rateLimits.key,
          set: {
            count: sql`CASE WHEN ${rateLimits.resetAt} <= ${nowIso}::timestamptz THEN 1 ELSE ${rateLimits.count} + 1 END`,
            resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= ${nowIso}::timestamptz THEN ${nextResetIso}::timestamptz ELSE ${rateLimits.resetAt} END`,
          },
        })
        .returning({ count: rateLimits.count });

      // Bersihkan entri kedaluwarsa secara berkala (~2% probabilitas per tulis)
      if (Math.random() < 0.02) {
        void db
          .delete(rateLimits)
          .where(lt(rateLimits.resetAt, new Date(now)))
          .catch(() => {});
      }

      return row?.count ?? 1;
    } catch {
      // Fallback ke in-memory jika DB gagal
    }
  }

  return recordMemoryRateLimit(fallbackStore, key, windowMs);
}

async function resetDistributedRateLimit(
  scope: string,
  ip: string,
  fallbackStore: Map<string, AttemptRecord>
): Promise<void> {
  const key = buildRateLimitKey(scope, ip);
  fallbackStore.delete(key);

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      await db.delete(rateLimits).where(eq(rateLimits.key, key));
    } catch {
      // Abaikan jika gagal menghapus entri DB
    }
  }
}

export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  return checkDistributedRateLimit(
    "login",
    ip,
    MAX_FAILED_ATTEMPTS,
    failedAttemptsByIp
  );
}

export async function recordFailedLogin(ip: string): Promise<{
  remainingAttempts: number;
}> {
  const count = await recordDistributedRateLimit(
    "login",
    ip,
    LOGIN_WINDOW_MS,
    failedAttemptsByIp
  );
  return {
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
  };
}

export async function resetLoginRateLimit(ip: string): Promise<void> {
  await resetDistributedRateLimit("login", ip, failedAttemptsByIp);
}

export function delayFailedLogin(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, FAILED_LOGIN_DELAY_MS);
  });
}

export async function checkWishRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  return checkDistributedRateLimit(
    "wish",
    ip,
    MAX_WISHES_PER_WINDOW,
    wishSubmissionsByIp
  );
}

export async function recordWishSubmission(ip: string): Promise<void> {
  await recordDistributedRateLimit(
    "wish",
    ip,
    WISH_WINDOW_MS,
    wishSubmissionsByIp
  );
}

export async function checkRsvpRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  return checkDistributedRateLimit(
    "rsvp",
    ip,
    MAX_RSVPS_PER_WINDOW,
    rsvpSubmissionsByIp
  );
}

export async function recordRsvpSubmission(ip: string): Promise<void> {
  await recordDistributedRateLimit(
    "rsvp",
    ip,
    RSVP_WINDOW_MS,
    rsvpSubmissionsByIp
  );
}

export async function checkUploadRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  return checkDistributedRateLimit(
    "upload",
    ip,
    MAX_UPLOADS_PER_WINDOW,
    uploadSubmissionsByIp
  );
}

export async function recordUploadSubmission(ip: string): Promise<void> {
  await recordDistributedRateLimit(
    "upload",
    ip,
    UPLOAD_WINDOW_MS,
    uploadSubmissionsByIp
  );
}
