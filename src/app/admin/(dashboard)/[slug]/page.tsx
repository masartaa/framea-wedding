import { notFound, redirect } from "next/navigation";
import { ContentManager } from "@/components/admin/ContentManager";
import { canAccessInvitation, getAdminSession } from "@/lib/auth";
import { getInvitationBySlugFresh } from "@/lib/invitations";

interface AdminInvitationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminInvitationPage({
  params,
}: AdminInvitationPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  if (!canAccessInvitation(session, slug)) {
    redirect(session.role === "couple" ? `/admin/${session.slug}` : "/admin");
  }

  const invitation = await getInvitationBySlugFresh(slug);
  if (!invitation) {
    notFound();
  }

  return (
    <ContentManager
      invitationSlug={invitation.slug}
      invitationLabel={invitation.label}
      initialConfig={invitation.config}
      initialSource="database"
      initialUpdatedAt={invitation.updatedAt}
    />
  );
}
