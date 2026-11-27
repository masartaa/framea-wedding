import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/landing/LegalPageShell";
import { buildWhatsAppOrderUrl, CONTACT_INFO } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian Dana | Framea Wedding Invitation",
  description:
    "Ketentuan pembatalan pesanan, syarat kelayakan pengembalian dana (refund), prosedur pengajuan, dan estimasi waktu proses di Framea Wedding Invitation.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function KebijakanPengembalianDanaPage() {
  const whatsappUrl = buildWhatsAppOrderUrl(
    "Halo Framea, saya ingin mengajukan pertanyaan terkait pembatalan atau pengembalian dana pesanan."
  );

  return (
    <LegalPageShell
      categoryLabel="Pembatalan & Refund"
      title="Kebijakan Pengembalian Dana"
      updatedDate="2026"
      summary="Penjelasan transparan mengenai ketentuan pembatalan dan pengembalian dana (refund) untuk layanan produk digital undangan pernikahan di Framea Wedding Invitation."
    >
      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          1. Sifat Layanan Digital
        </h2>
        <p className="opacity-85">
          {CONTACT_INFO.brandName} menyediakan layanan undangan pernikahan
          digital beserta aktivasi tautan privat dan akses panel pengelolaan
          mandiri. Karena bersifat produk dan layanan digital yang langsung
          disiapkan dan diaktifkan khusus sesuai data pesanan Anda, pengembalian
          dana mengikuti ketentuan di bawah ini.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          2. Kondisi yang Memenuhi Syarat Pengembalian Dana
        </h2>
        <p className="opacity-85">
          Pengembalian dana penuh (100%) dapat diajukan apabila terjadi salah
          satu kondisi berikut:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            <strong>Pembatalan sebelum aktivasi:</strong> Anda membatalkan
            pesanan sebelum tautan undangan digital dibuat dan kredensial akses
            panel pemilik dikirimkan.
          </li>
          <li>
            <strong>Pembayaran ganda (duplikat transaksi):</strong> sistem
            mencatat lebih dari satu pembayaran berhasil untuk pesanan yang
            sama, sehingga kelebihan pembayaran akan dikembalikan seluruhnya.
          </li>
          <li>
            <strong>Gangguan teknis sistem yang tidak terselesaikan:</strong>{" "}
            terjadi kendala teknis dari sisi platform {CONTACT_INFO.brandName}{" "}
            yang membuat halaman undangan atau panel pemilik tidak dapat diakses
            dan tidak berhasil kami perbaiki dalam waktu maksimal 2 x 24 jam
            sejak laporan diterima.
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          3. Kondisi yang Tidak Memenuhi Syarat Pengembalian Dana
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            Tautan undangan digital dan akses login panel pemilik sudah aktif
            serta diserahkan kepada pemesan, kecuali terdapat gangguan teknis
            sistem sebagaimana disebut pada poin 2.
          </li>
          <li>
            Perubahan jadwal, pembatalan acara, atau perubahan keputusan sepihak
            setelah layanan aktif. Sebagai alternatif, pemilik tetap dapat
            memperbarui tanggal, lokasi, atau seluruh isi undangan kapan saja
            tanpa biaya tambahan melalui panel pemilik.
          </li>
          <li>
            Preferensi warna, font, gaya sampul, atau susunan halaman yang masih
            dapat disesuaikan sendiri melalui menu Tema pada panel pemilik.
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          4. Cara Mengajukan Pengembalian Dana
        </h2>
        <p className="opacity-85">
          Kirimkan permintaan pengembalian dana melalui email ke{" "}
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.email}
          </a>{" "}
          atau WhatsApp ke{" "}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.whatsappDisplay}
          </a>{" "}
          dengan melampirkan informasi berikut:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 opacity-85">
          <li>Nama lengkap pemesan dan nomor WhatsApp aktif.</li>
          <li>
            Bukti pembayaran atau nomor referensi transaksi (Order ID /
            Invoice).
          </li>
          <li>Slug undangan (apabila sudah dibuat).</li>
          <li>Alasan singkat pengajuan pengembalian dana.</li>
        </ol>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          5. Verifikasi dan Estimasi Waktu Proses
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 opacity-85">
          <li>
            Tim kami akan memverifikasi kelengkapan data dan status transaksi
            maksimal <strong>2 hari kerja</strong> sejak pengajuan diterima.
          </li>
          <li>
            Setelah disetujui, pengembalian dana diproses melalui metode
            pembayaran awal atau transfer ke rekening atas nama pemesan dalam
            estimasi <strong>3 sampai 7 hari kerja</strong> untuk transfer bank,
            QRIS, atau dompet digital, serta{" "}
            <strong>7 sampai 14 hari kerja</strong> untuk kartu kredit atau
            debit mengikuti kebijakan bank penerbit dan penyedia gerbang
            pembayaran.
          </li>
          <li>
            Biaya administrasi transfer antarbank atau biaya layanan pihak
            ketiga yang tidak dapat dikembalikan oleh penyedia pembayaran (jika
            ada) akan diinformasikan secara transparan sebelum dana dikirimkan.
          </li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          6. Bantuan Lebih Lanjut
        </h2>
        <p className="opacity-85">
          Jika Anda mengalami kendala pada pembayaran atau membutuhkan bantuan
          sebelum mengajukan pembatalan, hubungi kami melalui{" "}
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.email}
          </a>{" "}
          atau WhatsApp{" "}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.whatsappDisplay}
          </a>
          .
        </p>
        <p className="pt-2 text-xs opacity-75">
          Baca juga{" "}
          <Link
            href="/syarat-ketentuan"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Syarat &amp; Ketentuan
          </Link>{" "}
          dan{" "}
          <Link
            href="/privasi"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Kebijakan Privasi
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
