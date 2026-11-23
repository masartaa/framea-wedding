interface AttemptRecord {
  count: number;
  resetAt: number;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_LOGIN_DELAY_MS = 800;

const failedAttemptsByIp = new Map<string, AttemptRecord>();

function cleanupExpired(now: number): void {
  if (failedAttemptsByIp.size < 200) {
    return;
  }
  for (const [key, record] of failedAttemptsByIp.entries()) {
    if (record.resetAt <= now) {
      failedAttemptsByIp.delete(key);
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
  cleanupExpired(now);

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
