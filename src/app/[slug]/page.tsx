import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import { formatEventDateFull, isSafeExternalUrl } from "@/lib/format";
import { getInvitationBySlug } from "@/lib/invitations";

export const revalidate = 300;

interface InvitationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    return {
      title: "Undangan Tidak Ditemukan — Framea",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { config } = invitation;
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

export default async function InvitationBySlugPage({
  params,
}: InvitationPageProps) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  return (
    <InvitationShell
      config={invitation.config}
      invitationSlug={invitation.slug}
    />
  );
}
