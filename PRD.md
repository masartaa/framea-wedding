# PRD — Framea Wedding Invitation

Versi 1.0 · 22 November 2026 · Status: Draft siap dikerjakan

## 1. Ringkasan

**Framea Wedding Invitation** adalah website undangan pernikahan digital yang terdiri dari dua bagian: (1) **halaman undangan** yang dikirim ke tamu secara personal lewat tautan, dan (2) **dashboard admin** untuk mengubah seluruh isi dan tampilan halaman undangan tanpa menyentuh kode. Targetnya ringan, modern, dan nyaman dibuka dari HP lewat WhatsApp.

Deploy awal memakai **Vercel** dengan tautan gratis (`*.vercel.app`).

## 2. Tujuan dan Non-Tujuan

**Tujuan**

- Semua konten halaman undangan bisa diubah dari dashboard: nama mempelai, tanggal, jam, tempat, foto, teks, musik.
- Tampilan bisa dikustomisasi dari dashboard: palet warna, font, varian layout, urutan dan tampil/sembunyi section.
- Tamu menerima tautan personal berisi namanya (`?to=Nama Tamu`).
- Halaman cepat dibuka di jaringan seluler biasa (target LCP di bawah 2,5 detik).
- Tetap muat di paket gratis Vercel dan Neon.

**Non-tujuan (di luar ruang lingkup versi 1)**

- RSVP / konfirmasi kehadiran, amplop digital (rekening/QR), dan multi bahasa.
- Domain kustom, live streaming, dan sistem multi-pengantin (multi-tenant).
- Registrasi atau login untuk tamu.

## 3. Pengguna dan Skenario

| Peran | Kebutuhan |
| --- | --- |
| **Admin** (mempelai / keluarga) | Mengatur isi dan tema, membuat tautan tamu, memoderasi ucapan |
| **Tamu** (sekitar 400 orang, tidak semua online) | Membuka undangan dari WhatsApp, melihat detail acara, membuka peta, melihat galeri, menulis ucapan |

**Skenario utama**

1. Admin login, mengisi data mempelai dan acara, mengunggah foto dan musik, memilih tema, lalu melihat pratinjau.
2. Admin memasukkan daftar nama tamu, menyalin tautan personal beserta template pesan WhatsApp, lalu mengirimkannya.
3. Tamu membuka tautan, melihat sampul bertuliskan namanya, menekan **Buka Undangan** (musik mulai), menggulir halaman, lalu menulis ucapan.

## 4. Fitur: Halaman Undangan

URL utama: `/` dengan parameter opsional `?to=Nama+Tamu`.

| Section | Isi | Catatan |
| --- | --- | --- |
| **Sampul (cover)** | Nama mempelai, tanggal, "Kepada Yth. {nama tamu}", tombol Buka Undangan | Tombol memicu musik (autoplay butuh interaksi pengguna). Tanpa `?to=`, tampilkan teks umum. |
| **Hero** | Foto utama, nama panggilan, tanggal, hitung mundur | Hitung mundur ke tanggal acara dari config |
| **Mempelai** | Nama lengkap, foto, nama orang tua | Teks pengantar bisa diubah |
| **Acara** | Hari dan tanggal, jam, nama tempat, alamat, tombol Google Maps | Resepsi saja, 3 Januari 2027, 09.00–14.00 WIB, Koffie Goen Tuntang |
| **Galeri** | Maksimal 6 foto | Lazy loading, lightbox sederhana |
| **Ucapan** | Form (nama, pesan) dan daftar ucapan; ucapan langsung tampil tanpa persetujuan dulu | Tidak ada RSVP |
| **Penutup** | Kalimat penutup, nama mempelai |  |

**Aturan perilaku**

- Nama dari `?to=` ditampilkan sebagai teks yang di-escape (tidak boleh dirender sebagai HTML), dibatasi sekitar 60 karakter.
- Tombol musik (mute/unmute) mengambang dan selalu terlihat.
- Semua teks dan label berbahasa Indonesia.
- Desain mobile-first; desktop tampil sebagai kolom sempit di tengah atau layout responsif sederhana.
- Tambahkan `noindex` agar undangan tidak muncul di mesin pencari.

## 5. Fitur: Dashboard Admin

URL: `/admin` (dilindungi login).

| Menu | Fungsi |
| --- | --- |
| **Umum** | Nama mempelai, nama panggilan, tanggal dan jam acara, nama tempat, alamat, tautan Google Maps, kalimat pembuka dan penutup |
| **Mempelai** | Nama lengkap, foto, nama orang tua kedua mempelai |
| **Media** | Foto hero, foto mempelai, galeri (maksimal 6), musik latar (unggah atau pilih dari preset) |
| **Tema** | Pilih preset palet atau atur sendiri warna (utama, sekunder, latar, teks, aksen), pasangan font, varian layout hero dan cover, ornamen on/off |
| **Section** | Aktif/nonaktif dan urutkan section |
| **Tamu** | Tambah nama tamu (satu per satu atau tempel banyak baris), hasilkan tautan personal, salin tautan, salin template pesan WhatsApp |
| **Ucapan** | Lihat, sembunyikan, dan hapus ucapan |
| **Pratinjau** | Lihat hasil perubahan dalam frame HP/desktop sebelum disimpan |

**Aturan perilaku**

- Tombol **Simpan** menyimpan dan langsung mempublikasikan; pratinjau dipakai sebelum menyimpan.
- Setiap form punya validasi dan pesan error yang jelas.
- Ada tombol **Reset ke default** (tema putih dan emas).
- Dashboard ringan dan dipakai di HP maupun laptop.

## 6. Sistem Kustomisasi (Tema)

Tema disimpan sebagai JSON dan diterapkan lewat CSS variables, jadi mengubah warna tidak butuh build ulang.

```json
{
  "theme": {
    "preset": "putih-emas",
    "colors": { "primary": "#C9A24B", "secondary": "#F5EFE0", "background": "#FFFFFF", "text": "#2B2B2B", "accent": "#B8860B" },
    "fonts": { "heading": "Playfair Display", "body": "Inter" },
    "layout": { "cover": "center", "hero": "full-photo" },
    "ornaments": true
  },
  "sections": [
    { "id": "hero", "enabled": true },
    { "id": "mempelai", "enabled": true },
    { "id": "acara", "enabled": true },
    { "id": "galeri", "enabled": true },
    { "id": "ucapan", "enabled": true }
  ]
}
```

- Preset awal: **Putih & Emas** (default), serta 4 preset lain (misalnya sage green, dusty rose, navy).
- Pilihan font dibatasi pada daftar kurasi (5–6 pasangan, dimuat lewat `next/font`) supaya tetap ringan.
- Admin memberi peringatan jika kontras teks dan latar terlalu rendah.

## 7. Model Data (Neon Postgres)

| Tabel | Kolom utama |
| --- | --- |
| `site_config` | `id` (satu baris), `data` (jsonb: konten dan tema), `updated_at` |
| `guests` | `id`, `name`, `slug` (unik), `created_at` |
| `wishes` | `id`, `name`, `message`, `is_hidden`, `created_at` |
| `media` | `id`, `kind` (hero/mempelai/galeri/musik), `url`, `sort_order`, `created_at` |

Catatan: berkas gambar dan musik disimpan di **Vercel Blob**; database hanya menyimpan URL-nya.

## 8. Arsitektur dan Tech Stack

| Lapisan | Pilihan |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables untuk tema |
| Database | Neon Postgres (paket gratis) dengan Drizzle ORM |
| Penyimpanan berkas | Vercel Blob |
| Auth admin | Sandi dari environment variable, sesi lewat cookie httpOnly bertanda tangan (JWT) |
| Animasi | CSS transitions dan IntersectionObserver; hindari library animasi berat |
| Hosting | Vercel (Hobby) |

**Strategi performa di Vercel**

- Halaman undangan dirender statis/ISR dari `site_config`, lalu di-revalidate saat admin menyimpan (`revalidateTag`). Parameter `?to=` dibaca di sisi klien agar halaman tetap bisa di-cache.
- Gambar diproses lewat `next/image` (WebP/AVIF, ukuran responsif); admin dibatasi mengunggah maksimal sekitar 2 MB per foto, dikompres di sisi klien sebelum diunggah.
- File musik dibatasi sekitar 3–5 MB, dimuat hanya setelah tombol Buka Undangan ditekan.
- Hindari library besar; target JS awal di bawah 150 KB gzip.

**Environment variable**

`DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.

## 9. Persyaratan Non-Fungsional

**Keamanan**

- Semua endpoint `/api/admin/*` wajib memverifikasi sesi; sandi admin tidak pernah ada di kode.
- Pembatasan percobaan login (rate limit) dan penundaan setelah gagal.
- Form ucapan: validasi panjang (nama maks. 50, pesan maks. 300 karakter), honeypot anti-bot, rate limit per IP, output di-escape.
- Validasi tipe dan ukuran berkas saat unggah.
- Header keamanan dasar dan `noindex`.

**Kinerja dan kompatibilitas**

- Lighthouse mobile: Performance ≥ 90.
- Mendukung Chrome dan Safari seluler (dua tahun terakhir) serta browser desktop modern.
- Muat nyaman di jaringan 4G biasa dan di in-app browser WhatsApp/Instagram.

**Keterpakaian**

- Kontras teks memadai, tombol minimal 44 px, dan teks berukuran terbaca di HP kecil.

## 10. Struktur Route

| Route | Fungsi |
| --- | --- |
| `/` | Halaman undangan (publik) |
| `/admin/login` | Login admin |
| `/admin` | Dashboard (Umum, Mempelai, Media, Tema, Section, Tamu, Ucapan) |
| `POST /api/wishes` | Kirim ucapan (publik, dengan rate limit) |
| `GET /api/wishes` | Daftar ucapan yang tidak disembunyikan |
| `/api/admin/config` | Baca/simpan konfigurasi |
| `/api/admin/upload` | Unggah foto dan musik |
| `/api/admin/guests` | Kelola daftar tamu |
| `/api/admin/wishes` | Moderasi ucapan |

## 11. Fase Pengembangan

Pekerjaan dibagi per fase kecil supaya mudah dikerjakan bertahap (misalnya lewat vibe coding) dan tidak kehabisan limit token dalam satu sesi. Selesaikan dan uji satu fase sebelum lanjut.

| Fase | Hasil yang dikerjakan | Selesai jika |
| --- | --- | --- |
| **0. Setup** | Proyek Next.js + Tailwind, koneksi Neon, Drizzle, deploy kosong ke Vercel | Halaman awal tampil di tautan vercel.app |
| **1. Data dan config** | Skema tabel, seed `site_config` default (data acara dan tema putih emas) | Config terbaca dari database |
| **2. Halaman undangan** | Semua section dengan data dari config, cover, hitung mundur, `?to=` | Undangan tampil lengkap di HP |
| **3. Auth admin** | Login, sesi, proteksi route admin | `/admin` tidak bisa dibuka tanpa login |
| **4. Form konten** | Menu Umum, Mempelai, Section; simpan lalu revalidate | Perubahan teks muncul di halaman utama |
| **5. Tema** | Preset, color picker, font, varian layout, pratinjau | Ganti warna dan font dari dashboard tanpa deploy |
| **6. Media** | Unggah foto dan musik ke Vercel Blob, galeri 6 foto, tombol musik | Foto dan musik bisa diganti dari admin |
| **7. Ucapan dan tamu** | Form ucapan, moderasi, generator tautan dan template WhatsApp | Tautan personal dan ucapan berfungsi |
| **8. Poles dan rilis** | Optimasi performa, `noindex`, uji di beberapa HP, cadangan data | Lighthouse ≥ 90 dan siap dikirim |

**Saran jadwal:** acara 3 Januari 2027, jadi target undangan siap disebar sekitar pertengahan Desember 2026. Fase 0–4 sudah menghasilkan versi yang bisa dipakai; fase 5–7 menyempurnakan.

## 12. Kriteria Penerimaan

- Admin dapat mengubah semua teks, tanggal, jam, lokasi, foto, musik, warna, font, dan urutan section tanpa mengubah kode.
- Perubahan yang disimpan tampil di halaman utama dalam hitungan detik.
- Tautan `?to=Nama` menampilkan nama tamu dengan benar dan aman (tidak mengeksekusi HTML).
- Ucapan dari tamu muncul di daftar dan bisa disembunyikan atau dihapus admin.
- Halaman admin tidak dapat diakses tanpa login, dan sandi tidak ada di repositori.
- Skor Lighthouse mobile Performance ≥ 90 pada halaman utama.
- Seluruh sistem berjalan di paket gratis Vercel, Neon, dan Blob untuk sekitar 400 tamu.

## 13. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Batas penyimpanan atau transfer paket gratis (terutama Blob) | Kompresi foto, batas ukuran musik, dan cek batas terbaru di dokumentasi Vercel sebelum rilis |
| Musik tidak berputar otomatis di HP | Musik baru dimulai setelah tombol Buka Undangan ditekan |
| Spam di form ucapan | Honeypot, rate limit, validasi panjang, dan moderasi admin |
| Admin salah mengatur warna sehingga teks tak terbaca | Preset aman, peringatan kontras, dan tombol reset |
| Data hilang atau salah ubah | Ekspor config (JSON) dari dashboard dan cadangan berkala dari Neon |
| Tautan `*.vercel.app` terlihat kurang formal | Pilih nama proyek yang rapi; domain kustom bisa ditambahkan nanti tanpa mengubah kode |

## 14. Keputusan

- Daftar tamu: cukup tempel nama per baris, tanpa impor CSV.
- Ucapan: langsung tampil, lalu dimoderasi admin bila perlu.
- Tombol "Tambahkan ke kalender": tidak dipakai.
- Preset warna: Putih & Emas ditambah 4 preset lain (total 5).
