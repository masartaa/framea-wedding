# Framea Wedding Invitation — Aturan Agent

## Konteks
Website undangan pernikahan: halaman undangan publik (`/`) dan dashboard admin (`/admin`).
PRD lengkap ada di `docs/PRD.md`. Baca PRD sebelum merencanakan pekerjaan apa pun.
Semua teks yang tampil ke pengguna berbahasa Indonesia.

## Stack (jangan diganti tanpa izin)
Next.js App Router + TypeScript, Tailwind CSS, Neon Postgres + Drizzle ORM,
Vercel Blob, zod untuk validasi, jose untuk sesi admin. Deploy: Vercel.

## Aturan kerja
1. Kerjakan HANYA fase yang saya sebut. Jangan menambah fitur di luar PRD.
2. Sebelum menulis kode, buat rencana singkat dan tunggu persetujuan saya.
3. Perubahan kecil dan terfokus. Jangan menulis ulang file yang tidak terkait.
4. Jangan menambah dependency baru tanpa menyebut alasan dan ukurannya.
   Hindari library animasi/UI yang berat. Target JS awal halaman undangan < 150 KB gzip.
5. Setelah selesai, jalankan `npm run lint` dan `npm run build`, lalu laporkan hasilnya.
6. Jangan pernah membaca, mencetak, atau meng-commit isi `.env*`. Gunakan `.env.example`.
7. Jangan menjalankan perintah destruktif (hapus data, drop tabel, force push)
   tanpa konfirmasi saya.

## Standar kode
- TypeScript strict, tanpa `any`.
- Semua input dari klien divalidasi dengan zod di server.
- Semua route `/api/admin/*` wajib memeriksa sesi admin.
- Teks dari pengguna (nama tamu, ucapan) selalu di-escape; jangan pernah memakai `dangerouslySetInnerHTML`.
- Warna dan font tema memakai CSS variables dari `site_config`, bukan nilai tetap di komponen.
- Mobile-first; target sentuh minimal 44 px; gambar lewat `next/image`.
- Halaman `/` memakai ISR dan di-revalidate saat admin menyimpan; `?to=` dibaca di klien.

## Definisi selesai (per fase)
Build lulus, lint bersih, fitur fase berjalan di HP lebar 375 px,
dan saya menerima ringkasan perubahan beserta cara mengujinya.