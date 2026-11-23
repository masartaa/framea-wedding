import type { Metadata } from "next";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import { formatEventDateFull, isSafeExternalUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getSiteConfig();
  const coupleTitle = `${config.couple.groom.nickname} & ${config.couple.bride.nickname}`;
  const title = `Undangan Pernikahan ${coupleTitle}`;
  const formattedDate = formatEventDateFull(config.general.eventDate);
  const description = `${config.general.eventTitle} · ${formattedDate}, ${config.general.eventTimeStart}–${config.general.eventTimeEnd} ${config.general.eventTimezone} di ${config.general.venueName}.`;
  const heroPhoto = config.media.heroPhotoUrl.trim();
  const hasOgImage = isSafeExternalUrl(heroPhoto);

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
      ...(hasOgImage ? { images: [{ url: heroPhoto, alt: title }] } : {}),
    },
    twitter: {
      card: hasOgImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(hasOgImage ? { images: [heroPhoto] } : {}),
    },
  };
}

export default async function HomePage() {
  const { config } = await getSiteConfig();

  return <InvitationShell config={config} />;
}
