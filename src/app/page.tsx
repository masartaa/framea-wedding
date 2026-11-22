export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="w-full rounded-2xl border px-6 py-10 shadow-sm"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor: "var(--color-primary)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Framea Wedding Invitation
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Halaman Undangan Segera Hadir
        </h1>
        <p className="mt-3 text-sm leading-relaxed opacity-80">
          Pengaturan awal proyek telah siap. Konten dan tampilan undangan akan
          ditambahkan pada tahap berikutnya.
        </p>
      </div>
    </main>
  );
}
