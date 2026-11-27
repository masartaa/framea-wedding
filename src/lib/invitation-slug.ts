export const DEFAULT_INVITATION_SLUG = "utama";

export const RESERVED_INVITATION_SLUGS = new Set([
  "admin",
  "api",
  "contoh",
  "login",
  "logout",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "_next",
  "static",
  "assets",
]);

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function normalizeInvitationSlug(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidInvitationSlug(slug: string): boolean {
  if (slug.length < 2 || slug.length > 80) {
    return false;
  }
  if (RESERVED_INVITATION_SLUGS.has(slug)) {
    return false;
  }
  return SLUG_REGEX.test(slug);
}

export function getInvitationCacheTag(slug: string): string {
  return `invitation:${slug}`;
}
