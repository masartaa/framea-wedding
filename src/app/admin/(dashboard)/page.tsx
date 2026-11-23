import { getAdminSession } from "@/lib/auth";

const PLANNED_MENUS = [
  {
    name: "Umum",
    description: "Nama mempelai, tanggal, jam, tempat, alamat, dan teks acara.",
    phase: "Fase 4",
  },
  {
    name: "Mempelai",
    description: "Nama lengkap, foto, dan nama orang tua kedua mempelai.",
    phase: "Fase 4",
  },
  {
    name: "Section",
    description: "Aktif/nonaktif dan urutan section halaman undangan.",
    phase: "Fase 4",
  },
  {
    name: "Tema & Pratinjau",
    description: "Preset palet warna, font, varian layout, dan ornamen.",
    phase: "Fase 5",
  },
  {
    name: "Media",
    description: "Foto hero, foto mempelai, galeri maksimal 6 foto, dan musik.",
    phase: "Fase 6",
  },
  {
    name: "Tamu & Ucapan",
    description: "Generator tautan personal WhatsApp dan moderasi ucapan.",
    phase: "Fase 7",
  },
] as const;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const formattedExpiry = session
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(session.expiresAt))
    : "-";

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border px-5 py-6 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.18em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Sesi Aktif
        </p>
        <h1 className="font-heading mt-1.5 text-2xl font-semibold">
          Selamat datang di Dashboard Admin
        </h1>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          Autentikasi dan proteksi route admin sudah aktif. Sesi ini berlaku
          hingga <span className="font-medium">{formattedExpiry} WIB</span>.
        </p>
      </section>

      <section aria-labelledby="judul-menu-admin">
        <h2
          id="judul-menu-admin"
          className="font-heading text-xl font-semibold"
        >
          Menu Pengelolaan
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLANNED_MENUS.map((menu) => (
            <div
              key={menu.name}
              className="rounded-2xl border px-5 py-4"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{menu.name}</h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-accent)",
                  }}
                >
                  {menu.phase}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                {menu.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
