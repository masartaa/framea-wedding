export type GuideTabTarget =
  | "umum"
  | "acara"
  | "mempelai"
  | "kisah"
  | "media"
  | "hadiah"
  | "tema"
  | "section"
  | "tamu"
  | "rsvp"
  | "ucapan"
  | "pratinjau";

export interface GuideStepItem {
  number: string;
  title: string;
  summary: string;
  tips: ReadonlyArray<string>;
  targetTab: GuideTabTarget;
  actionLabel: string;
}

export interface GuideFaqItem {
  id: string;
  question: string;
  answer: string;
  targetTab?: GuideTabTarget;
  actionLabel?: string;
}

export const CLIENT_GUIDE_STEPS: ReadonlyArray<GuideStepItem> = [
  {
    number: "01",
    title: "Lengkapi data mempelai, kalimat pembuka, dan rangkaian acara",
    summary:
      "Isi kalimat pembuka/penutup di tab Umum, nama lengkap dan orang tua di tab Mempelai, serta jadwal Akad atau Resepsi beserta tautan Google Maps di tab Acara.",
    tips: [
      "Tautan Google Maps harus diawali https:// (salin langsung dari tombol Bagikan di Google Maps).",
      "Jika memiliki lebih dari satu acara (misalnya Akad dan Resepsi), tandai salah satu sebagai Acara Utama untuk hitung mundur.",
    ],
    targetTab: "acara",
    actionLabel: "Buka Tab Acara",
  },
  {
    number: "02",
    title: "Unggah foto dan pilih musik latar",
    summary:
      "Unggah foto hero, foto kedua mempelai, hingga 6 foto galeri, lalu pilih musik preset bawaan atau unggah lagu MP3/M4A (maksimal 4 MB).",
    tips: [
      "Setiap foto otomatis dipotong (crop) dan dikompres oleh browser agar ringan dibuka tamu dari WhatsApp.",
      "Jika memakai foto momen di linimasa Kisah Kami, pengunggahan dilakukan langsung di tab Kisah.",
    ],
    targetTab: "media",
    actionLabel: "Buka Tab Media",
  },
  {
    number: "03",
    title: "Sesuaikan warna tema, font, dan urutan section",
    summary:
      "Pilih salah satu dari 5 preset warna (atau atur warna sendiri), ganti pasangan font, gaya sampul, bentuk foto hero, dan motif latar di tab Tema.",
    tips: [
      "Perhatikan peringatan kontras warna jika Anda mengatur warna sendiri agar teks tetap jelas terbaca di layar HP.",
      "Gunakan tab Section untuk mengaktifkan, menonaktifkan, atau menggeser urutan bagian (misalnya menonaktifkan Kisah atau Hadiah jika tidak dipakai).",
    ],
    targetTab: "tema",
    actionLabel: "Buka Tab Tema",
  },
  {
    number: "04",
    title: "Atur Tanda Kasih (rekening, QRIS, alamat kado)",
    summary:
      "Tambahkan hingga 4 rekening bank/e-wallet, unggah gambar QRIS, atau tulis alamat pengiriman kado fisik di tab Hadiah.",
    tips: [
      "Di halaman undangan, rincian rekening tersembunyi rapi di balik tombol Kirim Tanda Kasih agar tetap sopan.",
      "Untuk QRIS, unggah gambar utuh beserta tepi putihnya agar mudah dipindai tamu.",
    ],
    targetTab: "hadiah",
    actionLabel: "Buka Tab Hadiah",
  },
  {
    number: "05",
    title: "Cek Pratinjau, klik Simpan, lalu sebarkan tautan personal tamu",
    summary:
      "Lihat tampilan HP di tab Pratinjau, tekan tombol Simpan & Publikasikan, lalu buka tab Tamu untuk membuat tautan personal dan menyalin pesan WhatsApp.",
    tips: [
      "Tempel daftar nama tamu sekaligus (satu nama per baris) di tab Tamu untuk membuat semua tautan personal (?to=Nama+Tamu) secara otomatis.",
      "Gunakan tombol Cadangan Lengkap di bawah halaman editor sebelum mulai menyebar undangan agar Anda punya salinan JSON.",
    ],
    targetTab: "tamu",
    actionLabel: "Buka Tab Tamu",
  },
];

export const CLIENT_GUIDE_FAQS: ReadonlyArray<GuideFaqItem> = [
  {
    id: "belum-berubah",
    question:
      "Saya sudah mengedit teks atau mengunggah foto, kenapa di halaman undangan belum berubah?",
    answer:
      "Pastikan Anda sudah menekan tombol Simpan (atau Simpan & Publikasikan). Jika ada tanda titik kecil di tombol Simpan pada bilah bawah, artinya masih ada perubahan yang belum tersimpan. Setelah tersimpan, muat ulang (refresh) halaman undangan Anda.",
  },
  {
    id: "tab-dicoret",
    question:
      "Kenapa ada tab (seperti Kisah, Hadiah, atau RSVP) yang dicoret dan tidak bisa diklik?",
    answer:
      "Artinya section tersebut sedang dalam posisi Nonaktif. Buka tab Section, aktifkan sakelar pada bagian yang diinginkan, lalu klik Simpan agar tab tersebut bisa diedit kembali.",
    targetTab: "section",
    actionLabel: "Buka Tab Section",
  },
  {
    id: "nama-tamu-sampul",
    question:
      "Bagaimana cara agar nama masing-masing tamu otomatis tertulis di sampul undangan?",
    answer:
      "Buka tab Tamu, masukkan daftar nama tamu (bisa menempel banyak nama sekaligus, satu nama per baris), lalu klik Tambah Tamu. Setelah muncul di daftar, cukup klik Salin Pesan WA atau Salin Tautan di tiap nama tamu lalu tempel ke chat WhatsApp.",
    targetTab: "tamu",
    actionLabel: "Buka Tab Tamu",
  },
  {
    id: "musik-tidak-bunyi",
    question:
      "Kenapa musik latar tidak langsung berputar saat tautan undangan pertama kali dibuka?",
    answer:
      "Browser HP (Chrome dan Safari) memblokir pemutaran audio otomatis sebelum ada sentuhan pengguna. Karena itu musik Framea dirancang mulai berputar otomatis tepat saat tamu mengetuk tombol Buka Undangan, dan bisa dimatikan atau dinyalakan lewat tombol musik di pojok kanan bawah.",
    targetTab: "media",
    actionLabel: "Cek Musik di Tab Media",
  },
  {
    id: "pantau-rsvp-ucapan",
    question:
      "Di mana saya bisa melihat jumlah tamu yang hadir dan menghapus ucapan spam?",
    answer:
      "Rekap konfirmasi kehadiran beserta total perkiraan jumlah tamu ada di tab RSVP. Untuk menyembunyikan atau menghapus ucapan yang kurang pantas, buka tab Ucapan lalu klik Sembunyikan atau Hapus pada kartu ucapan terkait.",
    targetTab: "rsvp",
    actionLabel: "Buka Tab RSVP",
  },
  {
    id: "ganti-foto-qris",
    question:
      "Apakah mengganti foto berulang kali akan memenuhi penyimpanan?",
    answer:
      "Tidak perlu khawatir. Saat Anda mengganti atau menghapus foto maupun gambar QRIS lalu menekan Simpan & Publikasikan, sistem otomatis membersihkan file lama yang sudah tidak dipakai. Batas penyimpanan per undangan adalah 30 berkas aktif.",
    targetTab: "media",
    actionLabel: "Buka Tab Media",
  },
  {
    id: "privasi-tautan",
    question:
      "Apakah undangan dan nomor rekening saya akan muncul di pencarian Google?",
    answer:
      "Tidak. Setiap halaman undangan pasangan dipasangi aturan noindex dan diblokir di robots.txt sehingga tidak diindeks oleh mesin pencari. Namun, siapa pun yang menerima tautan undangan tetap dapat melihat isinya, jadi bagikan tautan hanya kepada tamu yang Anda kenal.",
  },
  {
    id: "cadangan-data",
    question:
      "Bagaimana cara menyimpan cadangan data tamu, RSVP, dan ucapan setelah acara selesai?",
    answer:
      "Gulir ke bagian bawah panel editor (di bawah tombol Simpan & Publikasikan), lalu klik Cadangan Lengkap untuk mengunduh seluruh data teks, daftar tamu, RSVP, dan ucapan dalam format berkas JSON ke perangkat Anda.",
  },
];
