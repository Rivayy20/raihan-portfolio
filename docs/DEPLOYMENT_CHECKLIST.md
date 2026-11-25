# Checklist Deployment Manual & Verifikasi Production (RAZH Portfolio CMS)

Gunakan checklist ini secara berurutan untuk melakukan commit ke GitHub, deploy ke Vercel, mengonfigurasi Supabase production, dan memvalidasi seluruh fitur sebelum memulai redesign UI/UX public portfolio.

---

## 1. Persiapan Lokal Sebelum Commit (Di Komputer Anda)

1. **Migrasi Aset Lokal ke Supabase Storage** (jika belum pernah dijalankan):
   - Jalankan `npm run dev`.
   - Buka website di `http://localhost:5173`, tekan **`Ctrl + .`** (atau akses `/admin/login`), lalu login sebagai admin.
   - Masuk ke menu **Media Library (`/admin/media`)** -> klik **Migrasi Aset Lokal** -> konfirmasi **Mulai Migrasi**.
   - Tunggu sampai selesai (17 aset: foto profil WebP, `og-image.png`, `cv.pdf`, 2 logo organisasi, 9 screenshot project, 3 PDF sertifikat) dan pastikan relasi yang masih kosong otomatis tertaut.
   - *(Alternatif headless CLI)*:
     ```bash
     CMS_ADMIN_EMAIL=email_admin@domain.com CMS_ADMIN_PASSWORD=password_anda node scripts/migrate-assets-to-supabase.mjs
     ```
2. **Publikasikan Draft yang Ingin Live**:
   - Buka **Preview Website (`/preview`)** untuk mengecek perbedaan antara mode **Draft Preview** dan **Live Published**.
   - Jika ada modul yang masih berstatus draft / *Edited* dan siap tampil ke publik, buka modul terkait di CMS dan klik **Publish**.
3. **Jalankan Verifikasi Penuh & Live RLS Probe**:
   ```bash
   npm run lint
   npm run build
   npm run qa:security
   node scripts/qa-security-audit.mjs --live
   ```
   Pastikan seluruh perintah menghasilkan status **PASS** dan tidak ada error.

---

## 2. Konfigurasi Supabase Dashboard (Production Readiness)

Buka **Supabase Dashboard** untuk project Anda:

1. **Matikan Registrasi Publik**:
   - Masuk ke **Authentication -> Sign In / Providers** (atau **User Signups**).
   - Pastikan **Allow new users to sign up** berada dalam kondisi **OFF**.
2. **Verifikasi Whitelist Admin**:
   - Pastikan akun Anda terdaftar aktif pada tabel `public.cms_admins` (`is_active = true`).
3. **Atur Site URL & Redirect URLs**:
   - Masuk ke **Authentication -> URL Configuration**.
   - **Site URL**: `https://raihan-portfolio-two.vercel.app/` (sesuaikan jika memakai custom domain).
   - **Redirect URLs** (tambahkan keduanya):
     - `https://raihan-portfolio-two.vercel.app/admin/reset-password`
     - `http://localhost:5173/admin/reset-password`
   - Jika memakai Vercel Preview URL sementara, Anda dapat menambahkan wildcard preview domain bila perlu menguji reset password di preview deployment.

---

## 3. Commit & Push ke GitHub (`dev` -> Preview -> `main`)

> **Penting:** Pastikan file `.env` **TIDAK PERNAH** masuk ke staging Git.

1. Cek status file terlebih dahulu:
   ```bash
   git status
   ```
   Pastikan `.env` tidak muncul pada daftar perubahan atau *untracked files*.
2. Stage, commit, dan push branch `dev`:
   ```bash
   git add .
   git commit -m "feat: integrate Supabase headless CMS, storage media library, draft preview, and SEO injector (phases 1-9)"
   git push origin dev
   ```
3. Setelah deployment **Vercel Preview** untuk branch `dev` berhasil dan lolos smoke test (langkah 4 & 5), merge ke `main`:
   ```bash
   git checkout main
   git pull origin main
   git merge dev
   git push origin main
   ```

---

## 4. Environment Variables di Vercel Dashboard

Buka **Vercel Dashboard -> Project -> Settings -> Environment Variables**, lalu pastikan variabel berikut terpasang untuk **Production** (dan **Preview**):

| Key | Value / Sumber | Catatan |
| --- | --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Access Key Web3Forms Anda | Jangan simpan di database Supabase |
| `VITE_SUPABASE_URL` | Project URL Supabase (`https://xxx.supabase.co`) | Digunakan oleh client publik, CMS, dan `/api/render-home` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable Key (`sb_publishable_...`) | Key anon publik yang aman di-expose |
| `VITE_USE_STATIC_FALLBACK` | `true` | Fallback otomatis ke data statis jika Supabase mengalami gangguan |
| `VITE_FORCE_STATIC_MODE` | `false` | Ubah ke `true` hanya untuk emergency kill-switch tanpa rebuild |

> **Peringatan Keamanan:** Jangan pernah menambahkan `service_role` key atau `VITE_SUPABASE_SECRET_KEY` di Environment Variables Vercel untuk project frontend ini.

Setelah menambah/mengubah Environment Variables, lakukan **Redeploy** di Vercel agar build terbaru menggunakan nilai env yang valid.

---

## 5. Smoke Test Setelah Deploy Vercel

Lakukan pengecekan berikut pada URL production (`https://raihan-portfolio-two.vercel.app/`):

1. **Verifikasi Serverless Meta Injector (`/api/render-home`)**:
   ```bash
   curl -I https://raihan-portfolio-two.vercel.app/
   ```
   - Pastikan response status `200`.
   - Pastikan header `X-SEO-Source` bernilai **`supabase`**.
   - Pastikan header keamanan (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`) hadir.
2. **Verifikasi Aset, Modal PDF & Console Browser**:
   - Buka `/` di browser, buka **DevTools -> Console & Network**.
   - Pastikan tidak ada error CSP (`Content-Security-Policy`), tidak ada error `401`/`403`, seluruh gambar (portrait hero, logo experience, screenshot project) tampil, dan modal **View CV** serta **View Certificate** dapat dibuka baik di desktop maupun mobile.
   - Uji kirim pesan lewat Contact Form (Web3Forms).
3. **Verifikasi CMS & Isolasi Indexing**:
   - Buka `/` lalu tekan `Ctrl + .` -> login di `/admin/login`.
   - Cek header response pada `/admin` dan `/preview` memiliki `X-Robots-Tag: noindex, nofollow, noarchive`.
   - Pastikan `/robots.txt` dan `/sitemap.xml` masih dapat diakses langsung (status `200`).
4. **Verifikasi Social / Open Graph Crawler**:
   - Uji URL production menggunakan **OpenGraph.xyz**, **LinkedIn Post Inspector**, atau share test ke WhatsApp untuk memastikan judul, deskripsi, dan OG image terbaru dari CMS terbaca pada HTML awal.
5. **Verifikasi Lighthouse (Desktop & Mobile)**:
   - Pastikan skor Performance, Accessibility, Best Practices, dan SEO tetap optimal tanpa error console.

---

## 6. Menyiapkan Branch untuk Redesign UI/UX Public Portfolio

Setelah semua checklist di atas terverifikasi aman di production:

1. Buat branch khusus redesign dari baseline `main`/`dev` terbaru:
   ```bash
   git checkout -b feat/public-ui-redesign
   ```
2. Fokuskan perubahan redesign public portfolio hanya pada layer tampilan berikut agar kontrak CMS & database tetap utuh:
   - `src/index.css` (design tokens, tipografi, animasi, utility styles)
   - `src/components/layout/*` (`Navbar.jsx`, `Footer.jsx`, `RootLayout.jsx`)
   - `src/components/sections/*` (`HeroSection.jsx`, `AboutSection.jsx`, `ExperienceSummary.jsx`, `ExperiencePanel.jsx`, `CertificationsSection.jsx`, `CertificationCard.jsx`, `SkillsSection.jsx`, `ProjectsSection.jsx`, `ContactSection.jsx`)
   - `src/components/ui/*` (`Button.jsx`, `Card.jsx`, `Badge.jsx`, `Section.jsx`, `InteractiveLanyard.jsx`, `Lightbox.jsx`, `DocumentViewerModal.jsx`, `ScrollProgress.jsx`, `BackToTop.jsx`)
   - Tetap konsumsi data dari hook `usePortfolioData()` dan pertahankan preset warna/visibility/order dari CMS.
