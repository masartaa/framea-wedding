import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${HASH_PREFIX}:${salt}:${derived}`;
}

export function verifyPasswordHash(
  password: string,
  storedHash: string | null | undefined
): boolean {
  if (!storedHash || !password) {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }

  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(expectedHex, "hex");
    if (expectedBuffer.length !== KEY_LENGTH) {
      return false;
    }
    const actualBuffer = scryptSync(password, salt, KEY_LENGTH);
    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
