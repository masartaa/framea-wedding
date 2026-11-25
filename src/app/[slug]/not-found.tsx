import Link from "next/link";
import { Ornament } from "@/components/invitation/Ornament";

export default function InvitationNotFoundPage() {
  return (
    <main
      className="admin-monochrome flex min-h-dvh w-full items-center justify-center px-5 py-12"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
        color: "var(--color-text)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl border px-6 py-10 text-center shadow-sm"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 28%, transparent)",
        }}
      >
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--color-accent)" }}
        >
          Framea
        </p>

        <Ornament enabled className="my-4" />

        <h1 className="font-heading text-2xl font-semibold">
          Undangan Tidak Ditemukan
        </h1>

        <p className="mt-3 text-sm leading-relaxed opacity-80">
          Tautan undangan yang Anda buka tidak tersedia atau sudah berubah.
          Mohon periksa kembali tautan yang dikirimkan oleh mempelai.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-medium"
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
