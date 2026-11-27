import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/landing/LegalPageShell";
import { buildWhatsAppOrderUrl, CONTACT_INFO } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Framea Wedding Invitation",
  description:
    "Penjelasan bagaimana Framea Wedding Invitation mengumpulkan, menyimpan, melindungi, dan menghapus data mempelai, media undangan, RSVP, serta informasi transaksi.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function KebijakanPrivasiPage() {
  const whatsappUrl = buildWhatsAppOrderUrl(
    "Halo Framea, saya ingin menanyakan mengenai Kebijakan Privasi atau pengelolaan data undangan saya."
  );

  return (
    <LegalPageShell
      categoryLabel="Privasi & Perlindungan Data"
      title="Kebijakan Privasi"
      updatedDate="2026"
      summary="Kebijakan ini menjelaskan bagaimana Framea Wedding Invitation mengumpulkan, menggunakan, menyimpan, dan melindungi data pasangan pemilik undangan maupun tamu yang mengisi RSVP dan ucapan."
    >
      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          1. Ruang Lingkup
        </h2>
        <p className="opacity-85">
          Kebijakan Privasi ini berlaku untuk seluruh pengunjung situs{" "}
          {CONTACT_INFO.brandName}, pasangan atau partner yang memesan layanan,
          pengguna panel pemilik undangan, serta tamu yang mengakses halaman
          undangan digital.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          2. Informasi yang Kami Kumpulkan
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            <strong>Data pemesanan dan kontak pemilik:</strong> nama pemesan,
            nomor WhatsApp, atau alamat email yang Anda kirimkan saat memesan
            atau menghubungi layanan bantuan.
          </li>
          <li>
            <strong>Konten undangan yang Anda unggah:</strong> nama mempelai,
            nama orang tua, jadwal dan alamat acara, tautan peta, foto galeri,
            berkas musik latar, detail tanda kasih (nomor rekening, gambar QRIS,
            alamat pengiriman kado), serta daftar nama tamu.
          </li>
          <li>
            <strong>Data dari tamu undangan:</strong> nama tamu, status
            konfirmasi kehadiran (RSVP), jumlah tamu yang hadir, dan pesan doa
            atau ucapan yang dikirimkan secara sukarela pada halaman undangan.
          </li>
          <li>
            <strong>Catatan teknis keamanan:</strong> informasi teknis dasar
            seperti cookie sesi login untuk pemilik undangan dan batas laju
            permintaan (rate limiting) guna mencegah spam pada formulir RSVP dan
            ucapan.
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          3. Penggunaan Informasi
        </h2>
        <p className="opacity-85">
          Informasi yang terkumpul digunakan semata-mata untuk:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            Menampilkan halaman undangan pernikahan digital sesuai pengaturan
            pemilik.
          </li>
          <li>
            Menyediakan akses panel pengelolaan konten, daftar tamu, rekap RSVP,
            dan moderasi ucapan bagi pemilik undangan.
          </li>
          <li>
            Memproses pemesanan, verifikasi pembayaran, dan memberikan dukungan
            teknis apabila dibutuhkan.
          </li>
          <li>
            Menjaga keamanan, keandalan, dan mencegah penyalahgunaan pada
            platform.
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          4. Penyimpanan Data, Privasi Tautan, dan Keamanan
        </h2>
        <p className="opacity-85">
          Kami menerapkan langkah pengamanan teknis untuk melindungi data Anda:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            <strong>Privasi tautan undangan:</strong> setiap halaman undangan
            klien disetel dengan petunjuk{" "}
            <code
              className="rounded px-1.5 py-0.5 font-mono text-xs"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              noindex
            </code>{" "}
            sehingga tidak diindeks oleh mesin pencari publik dan hanya dibuka
            melalui tautan yang Anda bagikan.
          </li>
          <li>
            <strong>Keamanan kredensial:</strong> kata sandi akun panel
            pemilik disimpan dalam bentuk hash terenkripsi satu arah (scrypt)
            dan sesi masuk dilindungi dengan cookie{" "}
            <code
              className="rounded px-1.5 py-0.5 font-mono text-xs"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              httpOnly
            </code>{" "}
            bertanda tangan digital.
          </li>
          <li>
            <strong>Infrastruktur cloud:</strong> data teks disimpan pada basis
            data cloud terkelola dan media foto, QRIS, maupun audio disimpan
            pada layanan penyimpanan objek cloud yang terenkripsi saat
            pengiriman (HTTPS).
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          5. Pemrosesan Pembayaran Pihak Ketiga
        </h2>
        <p className="opacity-85">
          Untuk transaksi pembayaran online yang menggunakan gerbang pembayaran
          (seperti Midtrans), seluruh informasi sensitif pembayaran termasuk
          nomor kartu, kode CVV, PIN, atau otorisasi dompet digital diproses
          langsung oleh penyedia gerbang pembayaran sesuai standar keamanan
          mereka. {CONTACT_INFO.brandName} tidak menyimpan detail kartu atau PIN
          pembayaran Anda dan hanya menerima status serta nomor referensi
          transaksi untuk memverifikasi pesanan.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          6. Pembagian Informasi kepada Pihak Ketiga
        </h2>
        <p className="opacity-85">
          Kami tidak menjual atau menyewakan data pribadi pasangan maupun tamu
          kepada pihak mana pun. Data hanya diproses bersama penyedia
          infrastruktur teknis (hosting, basis data, penyimpanan media, dan
          penyedia gerbang pembayaran) sejauh diperlukan untuk menjalankan
          layanan, atau apabila diwajibkan oleh hukum yang berlaku di Republik
          Indonesia.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          7. Hak Pemilik Data dan Permintaan Penghapusan
        </h2>
        <p className="opacity-85">
          Pemilik undangan dapat memperbarui atau menghapus foto, data acara,
          rekening tanda kasih, daftar tamu, maupun ucapan langsung melalui
          panel pemilik kapan saja. Apabila Anda ingin meminta penghapusan
          permanen seluruh data undangan setelah acara selesai, silakan ajukan
          permintaan melalui email atau WhatsApp resmi kami dengan menyertakan
          slug undangan dan konfirmasi identitas pemesan.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          8. Perubahan Kebijakan dan Kontak
        </h2>
        <p className="opacity-85">
          Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu mengikuti
          perkembangan layanan atau ketentuan hukum. Untuk pertanyaan terkait
          privasi dan data, hubungi kami melalui:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            Email:{" "}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="font-medium underline underline-offset-4"
              style={{ color: "var(--color-accent)" }}
            >
              {CONTACT_INFO.email}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
              style={{ color: "var(--color-accent)" }}
            >
              {CONTACT_INFO.whatsappDisplay}
            </a>
          </li>
        </ul>
        <p className="pt-2 text-xs opacity-75">
          Lihat juga{" "}
          <Link
            href="/syarat-ketentuan"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Syarat &amp; Ketentuan
          </Link>{" "}
          dan{" "}
          <Link
            href="/pengembalian-dana"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Kebijakan Pengembalian Dana
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
