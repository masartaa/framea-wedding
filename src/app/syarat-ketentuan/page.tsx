import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/landing/LegalPageShell";
import {
  buildWhatsAppOrderUrl,
  CONTACT_INFO,
  PACKAGE_PRICING,
  SITE_ORIGIN,
} from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Framea Wedding Invitation",
  description:
    "Syarat dan ketentuan penggunaan layanan undangan pernikahan digital Framea Wedding Invitation, mencakup lisensi, pembayaran, hak kekayaan intelektual, dan kewajiban pengguna.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SyaratKetentuanPage() {
  const whatsappUrl = buildWhatsAppOrderUrl(
    "Halo Framea, saya ingin menanyakan mengenai Syarat & Ketentuan layanan."
  );

  return (
    <LegalPageShell
      categoryLabel="Ketentuan Layanan"
      title="Syarat & Ketentuan"
      updatedDate="2026"
      summary="Mohon baca syarat dan ketentuan ini dengan saksama sebelum menggunakan situs, memesan paket, atau mengelola undangan pernikahan digital melalui Framea Wedding Invitation."
    >
      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          1. Ketentuan Penggunaan
        </h2>
        <p className="opacity-85">
          Selamat datang di {CONTACT_INFO.brandName} ({SITE_ORIGIN}). Situs dan
          layanan ini disediakan oleh tim {CONTACT_INFO.brandName} dengan tunduk
          pada syarat dan ketentuan berikut. Dengan mengakses situs ini,
          melakukan pemesanan, atau menggunakan panel pemilik undangan, Anda
          menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan
          yang berlaku. Jika Anda tidak menyetujui sebagian atau seluruh isi
          ketentuan ini, mohon tidak menggunakan layanan kami.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          2. Gambaran Umum Layanan
        </h2>
        <p className="opacity-85">
          {CONTACT_INFO.brandName} menyediakan layanan pembuatan dan pengelolaan
          undangan pernikahan digital berbasis web. Setiap pesanan mencakup
          tautan undangan privat per pasangan, tampilan kartu cetak digital
          mobile-first, fitur RSVP, buku ucapan, tanda kasih (amplop digital),
          serta akses panel pemilik untuk memperbarui konten dan daftar tamu
          secara mandiri.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          3. Perubahan Situs, Harga, dan Ketentuan
        </h2>
        <p className="opacity-85">
          Kami berhak memperbarui tampilan, fitur, harga paket, serta syarat dan
          ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan
          berlaku sejak dipublikasikan di situs ini. Kami juga berhak menolak
          atau membatalkan pesanan apabila terjadi kesalahan pencantuman harga
          atau spesifikasi yang nyata pada sistem sebelum layanan diaktifkan.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          4. Lisensi dan Hak Akses Platform
        </h2>
        <p className="opacity-85">
          Selama memenuhi ketentuan pembayaran dan penggunaan, Anda memperoleh
          lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan
          untuk menggunakan layanan undangan digital sesuai paket yang dipesan.
          Anda tidak diperkenankan menyalin kode sumber, melakukan rekayasa
          balik (reverse engineering), memodifikasi sistem, atau menjual ulang
          akses platform tanpa persetujuan tertulis dari{" "}
          {CONTACT_INFO.brandName}.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          5. Hak Kekayaan Intelektual dan Hak Cipta
        </h2>
        <p className="opacity-85">
          Seluruh desain antarmuka, tata letak, kode program, ornamen grafis
          bawaan, dan teks resmi pada situs {CONTACT_INFO.brandName} dilindungi
          oleh hukum hak cipta dan kekayaan intelektual yang berlaku. Foto,
          cerita, dan berkas musik yang diunggah oleh pemilik undangan tetap
          menjadi tanggung jawab dan hak milik masing-masing pengunggah.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          6. Akun Pemilik Undangan dan Kerahasiaan Sandi
        </h2>
        <p className="opacity-85">
          Setiap pasangan memperoleh kombinasi slug undangan dan sandi akses ke
          panel pemilik. Anda bertanggung jawab penuh menjaga kerahasiaan sandi
          tersebut serta seluruh perubahan konten yang dilakukan melalui akun
          Anda. Segera hubungi kami melalui email atau WhatsApp resmi apabila
          Anda menduga adanya akses tidak sah pada panel undangan Anda.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          7. Biaya, Pembayaran, dan Pengembalian Dana
        </h2>
        <p className="opacity-85">
          Harga layanan tercantum dalam mata uang Rupiah (IDR) pada halaman
          beranda situs (saat ini harga promo {PACKAGE_PRICING.promoFormatted}{" "}
          dari harga normal {PACKAGE_PRICING.originalFormatted}). Pembayaran
          dapat dilakukan melalui metode yang disediakan secara resmi oleh{" "}
          {CONTACT_INFO.brandName}, termasuk transfer atau gerbang pembayaran
          online (payment gateway) yang terintegrasi. Pajak yang berlaku (jika
          ada) menjadi tanggung jawab sesuai ketentuan peraturan perundang-undangan.
        </p>
        <p className="opacity-85">
          Ketentuan pembatalan dan pengembalian dana diatur secara rinci pada
          halaman{" "}
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

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          8. Kelayakan Penggunaan
        </h2>
        <p className="opacity-85">
          Layanan ini ditujukan untuk keperluan undangan pernikahan pribadi atau
          kerja sama resmi vendor pernikahan (Wedding Organizer, fotografer,
          atau percetakan) yang telah disepakati bersama{" "}
          {CONTACT_INFO.brandName}. Pengguna menyatakan memiliki kecakapan hukum
          untuk melakukan transaksi sesuai hukum yang berlaku di Indonesia.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          9. Dukungan dan Komunikasi Elektronik
        </h2>
        <p className="opacity-85">
          Bantuan penggunaan tersedia melalui halaman{" "}
          <Link
            href="/panduan"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Panduan Pemilik
          </Link>
          , email resmi{" "}
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.email}
          </a>
          , dan WhatsApp{" "}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {CONTACT_INFO.whatsappDisplay}
          </a>
          . Dengan berkomunikasi bersama kami secara elektronik, Anda menyetujui
          bahwa pemberitahuan, konfirmasi pesanan, dan panduan yang dikirimkan
          secara elektronik memiliki kekuatan komunikasi resmi.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          10. Penghentian Layanan
        </h2>
        <p className="opacity-85">
          Kami berhak menangguhkan atau menghentikan akses undangan maupun akun
          panel pemilik apabila ditemukan pelanggaran terhadap syarat dan
          ketentuan ini, penyalahgunaan sistem, atau tindakan yang membahayakan
          keamanan infrastruktur maupun pengguna lain.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          11. Kewajiban dan Jaminan Pengguna atas Konten
        </h2>
        <p className="opacity-85">
          Anda menjamin bahwa seluruh teks, foto, gambar QRIS, tautan lokasi,
          dan audio yang diunggah ke undangan adalah milik Anda atau telah
          memperoleh izin penggunaan yang sah. Anda dilarang mengunggah konten
          yang melanggar hukum, mengandung malware atau skrip berbahaya,
          melanggar hak cipta pihak ketiga, memuat unsur pornografi, penipuan,
          pencemaran nama baik, atau ujaran kebencian.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          12. Kerahasiaan, Keamanan, dan Privasi
        </h2>
        <p className="opacity-85">
          Pengumpulan, penyimpanan, dan perlindungan data pribadi serta data
          tamu diatur dalam{" "}
          <Link
            href="/privasi"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            Kebijakan Privasi
          </Link>{" "}
          kami yang merupakan bagian tidak terpisahkan dari Syarat &amp;
          Ketentuan ini.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          13. Jaminan, Penyangkalan, dan Ganti Rugi
        </h2>
        <p className="opacity-85">
          Kami berupaya menjaga ketersediaan dan tampilan layanan sebaik mungkin.
          Namun, tampilan warna pada layar dapat sedikit berbeda antar perangkat
          dan kalibrasi layar masing-masing tamu. Layanan disediakan
          sebagaimana adanya tanpa jaminan bebas gangguan 100 persen akibat
          keadaan kahar (force majeure), gangguan jaringan internet pengguna,
          atau layanan pihak ketiga di luar kendali kami. Anda menyetujui untuk
          membebaskan {CONTACT_INFO.brandName} dari tuntutan pihak ketiga yang
          timbul akibat konten yang Anda unggah atau pelanggaran ketentuan yang
          Anda lakukan.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          14. Hukum yang Berlaku
        </h2>
        <p className="opacity-85">
          Syarat dan ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang
          berlaku di Negara Republik Indonesia. Setiap perselisihan akan
          diupayakan penyelesaiannya secara musyawarah terlebih dahulu sebelum
          menempuh jalur hukum yang berlaku di Indonesia.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          15. Pertanyaan, Masukan, dan Pemberitahuan Hukum
        </h2>
        <p className="opacity-85">
          Apabila Anda memiliki pertanyaan atau masukan terkait Syarat &amp;
          Ketentuan ini, silakan hubungi kami melalui:
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
          <li>Wilayah Layanan: {CONTACT_INFO.country}</li>
        </ul>
        <p
          className="mt-4 rounded-xl border p-4 text-xs leading-relaxed opacity-85"
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 20%, transparent)",
          }}
        >
          <strong>Pemberitahuan Hukum:</strong> {CONTACT_INFO.brandName}. Hak
          Cipta &copy; 2026. Seluruh hak dilindungi.
        </p>
      </section>
    </LegalPageShell>
  );
}
