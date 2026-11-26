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

const failedAttemptsByIp = new Map<string, AttemptRecord>();
const wishSubmissionsByIp = new Map<string, AttemptRecord>();
const rsvpSubmissionsByIp = new Map<string, AttemptRecord>();

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

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupExpired(failedAttemptsByIp, now);

  const record = failedAttemptsByIp.get(ip);
  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.resetAt <= now) {
    failedAttemptsByIp.delete(ip);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.resetAt - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedLogin(ip: string): {
  remainingAttempts: number;
} {
  const now = Date.now();
  const existing = failedAttemptsByIp.get(ip);

  if (!existing || existing.resetAt <= now) {
    failedAttemptsByIp.set(ip, {
      count: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
    return { remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
  }

  existing.count += 1;
  return {
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - existing.count),
  };
}

export function resetLoginRateLimit(ip: string): void {
  failedAttemptsByIp.delete(ip);
}

export function delayFailedLogin(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, FAILED_LOGIN_DELAY_MS);
  });
}

export function checkWishRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupExpired(wishSubmissionsByIp, now);

  const record = wishSubmissionsByIp.get(ip);
  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.resetAt <= now) {
    wishSubmissionsByIp.delete(ip);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_WISHES_PER_WINDOW) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.resetAt - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordWishSubmission(ip: string): void {
  const now = Date.now();
  const existing = wishSubmissionsByIp.get(ip);

  if (!existing || existing.resetAt <= now) {
    wishSubmissionsByIp.set(ip, {
      count: 1,
      resetAt: now + WISH_WINDOW_MS,
    });
    return;
  }

  existing.count += 1;
}

export function checkRsvpRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupExpired(rsvpSubmissionsByIp, now);

  const record = rsvpSubmissionsByIp.get(ip);
  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.resetAt <= now) {
    rsvpSubmissionsByIp.delete(ip);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_RSVPS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.resetAt - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordRsvpSubmission(ip: string): void {
  const now = Date.now();
  const existing = rsvpSubmissionsByIp.get(ip);

  if (!existing || existing.resetAt <= now) {
    rsvpSubmissionsByIp.set(ip, {
      count: 1,
      resetAt: now + RSVP_WINDOW_MS,
    });
    return;
  }

  existing.count += 1;
}
