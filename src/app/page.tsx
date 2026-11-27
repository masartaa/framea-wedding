import type { Metadata } from "next";
import Link from "next/link";
import {
  BotanicalCorner,
  BotanicalSprig,
  EnvelopeSealIllustration,
} from "@/components/landing/EditorialArtwork";
import { LandingHeaderNav } from "@/components/landing/LandingHeaderNav";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { buildWhatsAppOrderUrl, PACKAGE_PRICING } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Framea Wedding Invitation | Undangan Pernikahan Digital",
  description:
    "Undangan pernikahan digital bergaya kartu cetak yang ringan dibuka dari WhatsApp, lengkap dengan tautan nama tamu personal, 5 preset tema, RSVP, ucapan, dan panel edit mandiri untuk pasangan.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Framea Wedding Invitation | Undangan Pernikahan Digital",
    description:
      "Tampilan bergaya kartu cetak yang rapi di layar HP, lengkap dengan tautan personal tamu, Google Maps, RSVP, ucapan, dan panel pasangan sendiri.",
    type: "website",
    locale: "id_ID",
  },
};

export default function FrameaLandingPage() {
  const heroOrderUrl = buildWhatsAppOrderUrl(
    `Halo Framea, saya ingin memesan undangan pernikahan digital dengan harga promo ${PACKAGE_PRICING.promoFormatted}.`
  );
  const coupleOrderUrl = buildWhatsAppOrderUrl(
    `Halo Framea, saya ingin memesan paket undangan pernikahan digital promo ${PACKAGE_PRICING.promoFormatted} (harga normal ${PACKAGE_PRICING.originalFormatted}). Mohon info langkah selanjutnya.`
  );
  const partnerOrderUrl = buildWhatsAppOrderUrl(
    "Halo Framea, saya dari vendor pernikahan (WO/fotografer/percetakan) ingin menanyakan skema kerja sama partner undangan digital."
  );

  return (
    <div
      className="admin-monochrome flex min-h-dvh w-full flex-col"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <LandingHeaderNav />

      <main className="flex-1">
        {/* Section 1: Asymmetric Editorial Hero */}
        <section
          aria-labelledby="hero-framea-title"
          className="mx-auto w-full max-w-5xl px-5 py-9 sm:px-8 sm:py-14"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <BotanicalSprig className="mb-4 h-7 w-32 text-[var(--color-accent)] opacity-80" />

              <h1
                id="hero-framea-title"
                className="font-heading text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.09] font-semibold tracking-tight"
              >
                Undangan pernikahan digital yang rapi dibuka dari WhatsApp.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-80 sm:text-base">
                Bergaya kartu cetak dengan tautan personal untuk setiap tamu.
                Pasangan bisa mengatur rangkaian acara, foto, warna tema, dan
                daftar tamu sendiri dari satu panel.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/contoh"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                  }}
                >
                  Lihat Contoh Undangan
                </Link>

                <a
                  href={heroOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                  style={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                    backgroundColor: "var(--color-background)",
                  }}
                >
                  Pesan via WhatsApp
                </a>
              </div>

              <dl
                className="mt-8 grid grid-cols-1 gap-5 border-t pt-5 sm:grid-cols-2"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                }}
              >
                <div>
                  <dt
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Privat per pasangan
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed opacity-75">
                    Setiap undangan memiliki alamat tautan tersendiri dan tidak
                    ditampilkan di pencarian Google.
                  </dd>
                </div>

                <div>
                  <dt
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Edit mandiri kapan saja
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed opacity-75">
                    Tambah nama tamu, salin template pesan WhatsApp, dan pantau
                    rekap RSVP langsung dari HP.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative flex justify-center overflow-hidden p-2 md:col-span-5 md:justify-end">
              <BotanicalCorner className="pointer-events-none absolute top-0 left-0 h-20 w-20 opacity-45" />
              <BotanicalCorner className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rotate-180 opacity-45" />
              <div className="relative z-10 w-full">
                <LandingShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Editorial Specification Index (4:8 Split) */}
        <section
          id="fitur"
          aria-labelledby="judul-fitur"
          className="border-t"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 14%, transparent)",
          }}
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-4">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  Fitur yang sudah tersedia
                </p>
                <h2
                  id="judul-fitur"
                  className="font-heading mt-2 text-2xl leading-snug font-semibold sm:text-3xl"
                >
                  Satu tautan untuk tamu, satu panel untuk mempelai.
                </h2>
                <p className="mt-3 text-sm leading-relaxed opacity-75">
                  Seluruh isi dan tampilan undangan diatur langsung dari browser
                  tanpa mengedit kode atau menunggu revisi manual.
                </p>
                <Link
                  href="/contoh"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 34%, transparent)",
                    color: "var(--color-text)",
                  }}
                >
                  Coba langsung di /contoh
                </Link>
              </div>

              <div className="md:col-span-8">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div
                    className="border-t pt-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                    }}
                  >
                    <span
                      className="font-heading text-sm font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      01
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold">
                      Sampul personal &amp; musik latar
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                      Menyapa nama tiap tamu lewat tautan{" "}
                      <code
                        className="rounded px-1.5 py-0.5 font-mono text-xs"
                        style={{ backgroundColor: "var(--color-secondary)" }}
                      >
                        ?to=Nama
                      </code>
                      . Musik preset atau lagu unggahan mulai diputar saat tamu
                      menekan Buka Undangan.
                    </p>
                  </div>

                  <div
                    className="border-t pt-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                    }}
                  >
                    <span
                      className="font-heading text-sm font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      02
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold">
                      Rangkaian hingga 6 acara &amp; peta
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                      Susun Akad, Resepsi, hingga Ngunduh Mantu lengkap dengan
                      tanggal, zona waktu, alamat, dan tombol Google Maps di
                      setiap acara.
                    </p>
                  </div>

                  <div
                    className="border-t pt-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                    }}
                  >
                    <span
                      className="font-heading text-sm font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      03
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold">
                      Kisah Kami &amp; galeri slideshow
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                      Linimasa hingga 8 momen cerita pasangan serta galeri 6
                      foto dengan pemotong gambar bawaan dan 5 pilihan transisi.
                    </p>
                  </div>

                  <div
                    className="border-t pt-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                    }}
                  >
                    <span
                      className="font-heading text-sm font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      04
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold">
                      Tanda Kasih, RSVP &amp; pesan WhatsApp
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-75">
                      Amplop digital (rekening, QRIS, alamat kado dengan salin
                      cepat), rekap RSVP dan moderasi ucapan di dashboard, serta
                      template pesan WhatsApp personal per tamu.
                    </p>
                  </div>
                </div>

                <div
                  className="mt-8 rounded-2xl border p-5 sm:p-6"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Kustomisasi tema di panel pasangan
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">
                    Tersedia <strong>5 preset warna</strong> (atau atur 5 warna
                    sendiri dengan peringatan kontras otomatis),{" "}
                    <strong>6 pasangan font</strong>,{" "}
                    <strong>5 gaya sampul</strong>,{" "}
                    <strong>5 bentuk bingkai foto</strong>, dan{" "}
                    <strong>7 motif latar</strong> termasuk Tekstur Kertas Halus
                    dan Motif Kawung Klasik. Urutan section bisa diaktifkan atau
                    disembunyikan kapan saja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Asymmetric 7:5 Pricing & Ordering Tracks */}
        <section
          id="cara-pesan"
          aria-labelledby="judul-pesan"
          className="border-t"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 14%, transparent)",
          }}
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="max-w-xl">
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                Harga &amp; cara pemesanan
              </p>
              <h2
                id="judul-pesan"
                className="font-heading mt-2 text-2xl leading-snug font-semibold sm:text-3xl"
              >
                Pilih jalur yang sesuai kebutuhan Anda.
              </h2>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-12">
              <article
                className="flex flex-col justify-between rounded-2xl border p-6 sm:p-7 md:col-span-7"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                }}
              >
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    Untuk Calon Pengantin
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-75">
                    Undangan disiapkan sampai siap sebar, lalu Anda menerima
                    akses panel sendiri untuk menambah tamu dan memantau RSVP.
                  </p>

                  <div
                    className="mt-5 rounded-xl border px-4 py-3.5"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 24%, transparent)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Harga promo saat ini
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                      <span className="font-heading text-3xl font-semibold tracking-tight">
                        {PACKAGE_PRICING.promoFormatted}
                      </span>
                      <del
                        aria-label={`Harga normal ${PACKAGE_PRICING.originalFormatted}`}
                        className="text-sm opacity-75"
                      >
                        {PACKAGE_PRICING.originalFormatted}
                      </del>
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-background)",
                          color: "var(--color-accent)",
                        }}
                      >
                        Hemat {PACKAGE_PRICING.savingsFormatted}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs opacity-75">
                      Sudah termasuk seluruh fitur di atas, bantu pengisian
                      awal, dan akses panel edit mandiri.
                    </p>
                  </div>

                  <div
                    className="mt-5 space-y-3 border-t pt-4 text-sm leading-relaxed"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 16%, transparent)",
                    }}
                  >
                    <p>
                      <strong>1. Kirim materi awal lewat WhatsApp:</strong> nama
                      mempelai, rangkaian jadwal acara, foto, dan pilihan tema.
                      Kami siapkan hingga undangan aktif di tautan khusus Anda.
                    </p>
                    <p>
                      <strong>2. Terima akses panel pasangan:</strong> login
                      sendiri untuk memasukkan daftar tamu, menyalin pesan
                      WhatsApp personal, atau memperbarui rincian kapan saja.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 pt-2">
                  <a
                    href={coupleOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                    }}
                  >
                    Pesan Sekarang via WhatsApp
                  </a>
                  <Link
                    href="/contoh"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 34%, transparent)",
                      color: "var(--color-text)",
                    }}
                  >
                    Lihat Contoh
                  </Link>
                </div>
              </article>

              <article
                className="flex flex-col justify-between rounded-2xl border p-6 sm:p-7 md:col-span-5"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                }}
              >
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    Untuk WO, Fotografer &amp; Percetakan
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-75">
                    Jadikan undangan digital Framea sebagai bonus paket foto
                    prewedding atau layanan tambahan untuk klien pernikahan
                    Anda.
                  </p>

                  <ul
                    className="mt-5 space-y-2.5 border-t pt-4 text-sm leading-relaxed"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                    }}
                  >
                    <li>
                      Setiap klien mendapat tautan dan panel login terpisah
                    </li>
                    <li>Produksi cepat dari satu sistem terpusat</li>
                    <li>Skema harga khusus partner untuk pemesanan berulang</li>
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <a
                    href={partnerOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: "var(--color-primary)",
                      color: "var(--color-primary)",
                    }}
                  >
                    Ajukan Harga Partner
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Section 4: Signature Deep Espresso Owner Login Band */}
        <section
          aria-labelledby="panel-pemilik-heading"
          className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8 sm:pb-16"
        >
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            <BotanicalCorner className="pointer-events-none absolute -top-3 -right-3 h-24 w-24 rotate-90 opacity-20" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div
                  className="hidden shrink-0 sm:block"
                  style={{ color: "var(--color-on-primary-muted)" }}
                >
                  <EnvelopeSealIllustration className="h-20 w-28" />
                </div>

                <div className="max-w-lg">
                  <h2
                    id="panel-pemilik-heading"
                    className="font-heading text-2xl leading-tight font-semibold"
                  >
                    Sudah punya undangan di Framea?
                  </h2>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--color-on-primary-muted)" }}
                  >
                    Masuk menggunakan slug dan sandi undangan Anda untuk
                    memperbarui teks, foto, tema, daftar tamu, dan rekap RSVP
                    kapan saja.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-85 focus-visible:outline-[var(--color-on-primary)]"
                style={{
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-primary)",
                }}
              >
                Masuk Pemilik Undangan
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
