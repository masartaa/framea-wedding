import Link from "next/link";

export default function InvitationNotFoundPage() {
  return (
    <main
      className="admin-monochrome flex min-h-dvh w-full items-center justify-center px-5 py-12"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <div className="w-full max-w-md text-left">
        <p
          className="font-mono text-xs font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          404
        </p>

        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          Undangan Tidak Ditemukan
        </h1>

        <div
          className="my-5 h-px w-16"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-primary) 28%, transparent)",
          }}
        />

        <p className="text-sm leading-relaxed opacity-80">
          Tautan undangan yang Anda buka tidak tersedia atau alamatnya sudah
          berubah. Mohon periksa kembali tautan yang dikirimkan oleh mempelai.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
