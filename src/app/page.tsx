import { InvitationShell } from "@/components/invitation/InvitationShell";
import { getSiteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const { config } = await getSiteConfig();

  return <InvitationShell config={config} />;
}
