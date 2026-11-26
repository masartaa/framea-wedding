# DESIGN.md: Framea Wedding Invitation

## Identity & Surfaces

Framea memiliki dua karakter visual yang terpisah secara jelas sesuai fungsinya:

1. **Halaman Undangan Publik (`/[slug]`)**
   - **Peran:** Undangan pernikahan digital personal untuk tamu mempelai di perangkat mobile (375 px) hingga desktop.
   - **Gaya visual:** Editorial stationery yang hangat, intim, dan bisa dikustomisasi per pasangan lewat CSS variables (`--color-primary`, `--color-secondary`, `--color-background`, `--color-text`, `--color-accent`, `--font-heading`, `--font-body`).
   - **Dial:** `ENERGY 2 / RHYTHM 2 / MOTION 2` (sampul tirai buka, transisi masuk hero bertahap, scroll-reveal halus, seluruhnya berhenti di `prefers-reduced-motion: reduce`).
   - **Motif identitas:** Tipografi serif kontras pada nama mempelai, garis pemisah tipis, bingkai foto kubah/lingkaran, dan kartu acara berpusat pada jadwal.

2. **Platform & Dashboard Admin (`/`, `/login`, `/admin/login`, `/admin`, `/admin/[slug]`, `/[slug]/not-found`)**
   - **Peran:** Ruang kerja monokrom yang tenang dan fokus agar pemilik undangan dan Super Admin dapat mengelola konten tanpa bias warna tema tertentu.
   - **Gaya visual:** Studio editorial monokrom dengan tinta gelap (`#18181B`), permukaan putih bersih (`#FFFFFF`), permukaan sekunder halus (`#F4F4F5`), dan aksen abu gelap (`#3F3F46`).
   - **Dial:** `ENERGY 1 / RHYTHM 2 / MOTION 1` (fokus kejelasan alur kerja, tanpa animasi dekoratif).

## Palette & Contrast Rules

- Seluruh pasangan warna teks dan tombol pada preset undangan dan mode monokrom wajib memenuhi WCAG AA minimal **4.5:1** (normal text) dan **3:1** untuk batas komponen serta indikator fokus.
- Teks sekunder maksimal memakai `opacity-75` agar rasio kontras tetap aman di atas 4.5:1 di semua preset.
- Warna aksen digunakan secara terukur pada status penting, judul acara, dan angka hitung mundur.

## Typography

- **Undangan publik:** Judul memakai font serif pilihan mempelai (default `Playfair Display`) untuk kesan undangan cetak klasik; teks isi memakai sans-serif ringan (default `Inter`) untuk keterbacaan di layar HP.
- **Dashboard & halaman platform:** `Playfair Display` pada judul utama halaman agar tetap menyambung identitas Framea, dipadukan `Inter` untuk formulir dan navigasi yang ringkas.
- Hindari label uppercase dengan letter-spacing ekstrem (`0.2em+`) yang hanya mengulang judul di bawahnya.

## Border Radius & Elevation

- **Kartu dan panel utama:** `rounded-2xl` dengan garis tepi tipis (tanpa bayangan berat berlebih).
- **Tombol, tautan aksi, tab, dan input admin:** `rounded-xl` agar hierarki aksi berbeda jelas dari lencana dan kartu.
- **Lencana status/slug:** `rounded-md` yang ringkas.
- **Bentuk bulat penuh (`rounded-full`):** Khusus avatar foto, tombol ikon melingkar (musik, tutup modal), dan CTA utama sampul undangan.

## Decision Log (R-31)

- **Warna monokrom di admin:** Menjaga warna pratinjau undangan mempelai tampil akurat tanpa bentrok dengan warna chrome dashboard.
- **Layout satu kolom mobile-first di `/[slug]`:** Mayoritas tamu membuka tautan undangan dari WhatsApp di layar ponsel 375 px.
- **Komposisi berbeda pada `/`, `/login`, `/admin/login`, dan `/[slug]/not-found`:** Membedakan fungsi tiap halaman secara visual (editorial pengantar di beranda, panel masuk pasangan di `/login`, lembar khusus Super Admin berbatas atas tinta di `/admin/login`, dan pemberitahuan langsung tanpa kartu berat di 404).
- **Kartu di daftar undangan, acara, dan ucapan:** Memisahkan unit data dengan aksi mandiri (edit, salin tautan, moderasi, hapus).
