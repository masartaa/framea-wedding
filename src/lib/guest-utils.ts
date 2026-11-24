import { getInvitationEvents, type SiteConfig } from "@/lib/config-schema";
import { formatEventDateFull, MAX_GUEST_NAME_LENGTH } from "@/lib/format";

export const MAX_GUEST_BATCH_SIZE = 500;

export function normalizeGuestName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_GUEST_NAME_LENGTH)
    .trim();
}

export function createGuestSlug(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || "tamu";
}

export function parseGuestNamesInput(rawText: string): string[] {
  const lines = rawText.split(/\r?\n/);
  const seen = new Set<string>();
  const names: string[] = [];

  for (const line of lines) {
    const cleaned = normalizeGuestName(line);
    if (!cleaned) {
      continue;
    }

    const dedupeKey = createGuestSlug(cleaned);
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    names.push(cleaned);

    if (names.length >= MAX_GUEST_BATCH_SIZE) {
      break;
    }
  }

  return names;
}

export function buildPersonalInvitationUrl(
  origin: string,
  guestName: string,
  invitationSlug?: string
): string {
  const path = invitationSlug ? `/${encodeURIComponent(invitationSlug)}` : "/";
  try {
    const url = new URL(path, origin);
    url.searchParams.set("to", guestName);
    return url.toString();
  } catch {
    return `${path}?to=${encodeURIComponent(guestName)}`;
  }
}

export function createDefaultWhatsAppTemplate(config: SiteConfig): string {
  const coupleNames = `${config.couple.groom.nickname} & ${config.couple.bride.nickname}`;
  const events = getInvitationEvents(config);

  const eventBlocks = events.flatMap((eventItem, index) => {
    const fullDate = formatEventDateFull(eventItem.date);
    const timeRange = `${eventItem.timeStart}–${eventItem.timeEnd} ${eventItem.timezone}`;
    const lines = [
      ...(events.length > 1 ? [`*${eventItem.title}*`] : []),
      `Hari/Tanggal: ${fullDate}`,
      `Waktu: ${timeRange}`,
      `Tempat: ${eventItem.venueName}`,
    ];
    return index < events.length - 1 ? [...lines, ""] : lines;
  });

  const introEventLabel =
    events.length > 1 ? "rangkaian acara pernikahan" : `acara ${config.general.eventTitle}`;

  return [
    "Kepada Yth. {nama},",
    "",
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri ${introEventLabel} kami:`,
    "",
    `*${coupleNames}*`,
    "",
    ...eventBlocks,
    "",
    "Informasi lengkap undangan dapat dibuka melalui tautan berikut:",
    "{tautan}",
    "",
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    "",
    "Terima kasih.",
    coupleNames,
  ].join("\n");
}

export function renderWhatsAppMessage(
  template: string,
  guestName: string,
  personalUrl: string
): string {
  return template
    .replaceAll("{nama}", guestName)
    .replaceAll("{tautan}", personalUrl);
}
