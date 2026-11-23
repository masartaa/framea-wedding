import { ContentManager } from "@/components/admin/ContentManager";
import { getSiteConfigFresh } from "@/lib/site-config";

export default async function AdminDashboardPage() {
  const { config, source, updatedAt } = await getSiteConfigFresh();

  return (
    <ContentManager
      initialConfig={config}
      initialSource={source}
      initialUpdatedAt={updatedAt}
    />
  );
}
