# Panduan Operator CMS Admin — RAZH Portfolio

Dokumen ini menjelaskan cara mengelola seluruh konten, media, draft, revisi, dan SEO portfolio melalui Admin Dashboard terpusat.

---

## 1. Akses Login & Keamanan Akun

- **Shortcut Tersembunyi dari Website Publik**: Buka `/` lalu tekan **`Ctrl + .`** (Windows/Linux) atau **`Cmd + .`** (macOS) untuk langsung menuju halaman login `/admin/login`.
- **URL Login Langsung**: `/admin/login`.
- **Reset Password**: Gunakan fitur *Lupa Password* di halaman login, yang akan mengarahkan ke `/admin/reset-password` sesuai konfigurasi Supabase Auth Redirect URLs.
- **Keamanan Akun (`/admin/account`)**: Melihat status whitelist admin (`cms_admins`), mengganti password sesi aktif, dan logout aman tanpa mengganggu sesi pengunjung publik.

> **Catatan:** Website publik (`/`) tidak memiliki tombol "Admin Login" agar tampilan tetap bersih bagi pengunjung, dan seluruh rute `/admin/*` serta `/preview` diblokir dari pengindeksan mesin pencari (`X-Robots-Tag: noindex, nofollow, noarchive` + `robots.txt`).

---

## 2. Alur Kerja: Draft, Preview, Publish & Revision History

CMS memisahkan **data live** dan **perubahan draft** secara ketat sehingga pengunjung tidak pernah melihat edit yang belum selesai.

1. **Save Draft**:
   - Menyimpan perubahan ke status draft (atau ke `draft_data` pada item yang sudah `published`). Website live `/` **tidak berubah**.
2. **Preview Mode (`/preview`)**:
   - Buka **Preview Website** dari sidebar CMS atau tombol **Preview** di topbar.
   - Gunakan toggle di banner atas untuk membandingkan **Draft Preview** vs **Live Published**.
   - Badge jumlah perubahan yang belum rilis (misal `3 Unpublished Draft`) menampilkan total item draft/edited saat ini.
3. **Publish**:
   - Mempromosikan aset media privat (jika ada) ke bucket publik, menulis perubahan ke kolom live, menyegarkan cache publik, dan otomatis mencatat snapshot pada log revisi.
   - Untuk item koleksi, Anda juga bisa melakukan **Unpublish** (kembali ke `draft`) atau **Discard Draft** (membatalkan perubahan belum terbit pada item `published`).
4. **Revision History (`/admin/revisions`)**:
   - Menyimpan histori aksi `publish`, `unpublish`, `restore`, dan `delete` beserta snapshot JSON lengkapnya.
   - Klik **Snapshot** untuk meninjau isi JSON historis, atau klik **Restore Draft** untuk memulihkan versi tersebut ke status draft dengan aman **tanpa menimpa website live** hingga Anda menekan Publish.

---

## 3. Daftar Modul CMS

| Modul | Rute | Fungsi Utama |
| --- | --- | --- |
| **Overview** | `/admin` | Statistik jumlah Projects, Experience, Certifications, Skills, Media, Draft tertunda, dan Quick Actions. |
| **General Settings** | `/admin/settings` | Brand name, nama lengkap, preset warna tema (`razh_cyan`, `electric_amber`, `cobalt_mint`), default theme, urutan & visibilitas section. |
| **Navbar** | `/admin/navbar` | Label menu, urutan link, toggle visibilitas di Navbar/Footer, serta tombol CTA (`Hire Me`). |
| **Hero & CV** | `/admin/hero` | Badge, segmen headline + wave underline, subheadline, foto & teks Lanyard ID Badge, hingga 4 floating labels, CTA, dan dokumen CV PDF. |
| **About** | `/admin/about` | Judul narasi, paragraf cerita, frasa teks yang disorot (`narrativeHighlights`), serta judul & toggle sub-section About. |
| **Education** | `/admin/education` | Pendidikan saat ini (`current`) dan riwayat pendidikan sebelumnya (`previous`) beserta logo opsional dan urutan tampil. |
| **Experience** | `/admin/experience` | Pengalaman kerja/akademik (seperti SAG Laboratory & PT. Teknoreka Inovasi Nusantara) serta blok `detail_sections` accordion yang dinamis. |
| **Expertise** | `/admin/expertise` | Kategori skill, pilihan warna Neo-Brutalism terkurasi, badge skill (`Primary`, `Supporting`, `Learning`), ikon preset/media, dan proyek terkait (*Used In*). |
| **Projects** | `/admin/projects` | CRUD project, Problem/Solution/Impact, Tech Stack, galeri multi-screenshot (urutan & primary thumbnail), Demo/GitHub URL, dan warna panel. |
| **Certifications** | `/admin/certifications` | Data sertifikasi, issuer, credential ID, status verifikasi (`verified`, `in_progress`, `expired`, `unverified`), link verifikasi, dan PDF viewer. |
| **Contact** | `/admin/contact` | Heading, deskripsi, email, status ketersediaan, response time, lokasi, serta social links. Web3Forms Access Key tetap dijaga melalui `.env`/Vercel env var (tidak disimpan di DB). |
| **Footer** | `/admin/footer` | Brand text, tagline, copyright, quick links, social links, dan toggle visibilitas badge/elemen footer. |
| **SEO Settings** | `/admin/seo` | SEO Title, Meta Description, Canonical URL, Open Graph title/description/image, Twitter Card, dan JSON-LD `Person` Schema. |

---

## 4. Media Library (`/admin/media`) & Bucket Storage

- **Public Buckets (`public-assets` & `public-documents`)**: Digunakan untuk aset yang tampil ke pengunjung (gambar `JPG/PNG/WebP` maksimal 5 MB dan dokumen `PDF` maksimal 10 MB; upload SVG diblokir demi mencegah XSS).
- **Private Drafts (`private-drafts`)**: Hanya bisa diakses administrator melalui *signed URL* sementara saat mengedit draft atau di Preview Mode. Saat konten yang mereferensikan media draft dipublikasikan, CMS otomatis mempromosikannya ke bucket publik.
- **Migrasi Aset Lokal (1-Klik)**: Tombol **Migrasi Aset Lokal** di `/admin/media` mengunggah seluruh 17 aset bawaan portfolio ke Storage secara idempoten dan menautkan FK yang masih `NULL` tanpa menimpa media kustom yang sudah Anda pilih.
- **Proteksi Penghapusan**: Sebelum menghapus file media, CMS mengecek relasi aktif melalui RPC `get_media_asset_usage` agar tidak mematahkan konten yang sedang live.

---

## 5. Emergency Rollback ke Mode Statis

Jika Supabase mengalami gangguan berkepanjangan dan Anda perlu mengembalikan website publik sepenuhnya ke data statis bawaan repo dalam hitungan detik tanpa mengubah kode:
1. Buka **Vercel Dashboard -> Settings -> Environment Variables**.
2. Ubah `VITE_FORCE_STATIC_MODE` menjadi `true` (atau pastikan `VITE_USE_STATIC_FALLBACK=true` selalu aktif untuk fallback otomatis saat jaringan Supabase gagal).
3. Lakukan **Redeploy** di Vercel.
