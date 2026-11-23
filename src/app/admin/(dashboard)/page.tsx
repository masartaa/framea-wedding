import { ContentManager } from "@/components/admin/ContentManager";
import { getSiteConfigFresh } from "@/lib/site-config";

export default async function AdminDashboardPage() {
  const { config, source, updatedAt } = await getSiteConfigFresh();

  return (
    <div className="space-y-6">
      <ContentManager
        initialConfig={config}
        initialSource={source}
        initialUpdatedAt={updatedAt}
      />

      <section aria-labelledby="judul-menu-berikutnya">
        <h2
          id="judul-menu-berikutnya"
          className="font-heading text-lg font-semibold"
        >
          Menu Tahap Berikutnya
        </h2>
        <div
          className="mt-3 rounded-2xl border px-4 py-3.5"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 28%, transparent)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Tamu &amp; Ucapan</h3>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-accent)",
              }}
            >
              Fase 7
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed opacity-75">
            Generator tautan personal WhatsApp untuk daftar tamu dan moderasi
            ucapan dari pengunjung.
          </p>
        </div>
      </section>
    </div>
  );
}
