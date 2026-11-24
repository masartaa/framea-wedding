import { redirect } from "next/navigation";
import { InvitationsHub } from "@/components/admin/InvitationsHub";
import { getAdminSession } from "@/lib/auth";
import { listInvitations } from "@/lib/invitations";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (session.role === "couple") {
    redirect(`/admin/${session.slug}`);
  }

  const invitations = await listInvitations();

  return <InvitationsHub initialInvitations={invitations} />;
}
