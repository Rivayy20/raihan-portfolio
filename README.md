# RAZH Portfolio — Supabase-Powered Headless CMS

Personal portfolio website for **Raihan Azka Hidayat (RAZH)** powered by a headless **Supabase** CMS backend, deployed on **Vercel**. Visitors view a fast React SPA backed by stateless public queries and Vercel edge HTML meta injection, while the administrator manages all sections, media assets, drafts, revisions, and SEO settings from a protected `/admin` dashboard.

## Features

- **Data-Driven Public Portfolio (`/`)**: Dynamically loads published & visible content across Hero, About, Education, Experience, Expertise, Projects, Certifications, Contact, Navbar, Footer, and Theme Presets via `supabasePublic` (stateless PostgREST REST queries scoped to public column allowlists) with `sessionStorage` caching and graceful fallback to `STATIC_PORTFOLIO_DATA`.
- **Protected CMS Dashboard (`/admin`)**: Authenticated via Supabase Auth + `cms_admins` whitelist check (`ProtectedAdminRoute`), hidden keyboard shortcut (`Ctrl + .` / `Cmd + .`), and 12 dedicated CRUD content modules + Revision History.
- **Draft, Preview & Revision Workflow**: Edit safely with **Save Draft**, inspect live differences via **Preview Mode (`/preview`)** toggling *Draft Preview* vs *Live Published*, publish updates atomically, and inspect or restore snapshots from `/admin/revisions`.
- **Centralized Supabase Storage Media Library (`/admin/media`)**: Upload images & PDFs across `public-assets`, `public-documents`, and `private-drafts`, check reference usage via `get_media_asset_usage` before deleting, and migrate all 17 bundled local portfolio assets with 1 click (**Migrasi Aset Lokal**) or via CLI (`scripts/migrate-assets-to-supabase.mjs`).
- **SEO Head & Vercel Serverless Meta Injector**: Runtime `<SeoHead />` sync plus `/api/render-home` serverless handler injecting dynamic `<title>`, meta description, canonical, Open Graph, Twitter Card, favicon, and sanitized JSON-LD into initial HTML for social media crawlers.
- **Security & Performance Hardening**: Column-level `anon` grants, strict PostgreSQL RLS on all 20 tables, SVG/traversal/XSS sanitization (`src/utils/safeUrl.js`, `api/_lib/seoHtmlInjector.js`), production CSP & security headers (`vercel.json`), zero CMS/admin leaks into public bundles, and Rolldown vendor chunk splitting (`< 500 kB`).

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router 7, TanStack Query 5, Zod 4
- **UI & Motion**: Framer Motion, Lenis Smooth Scroll, React Icons
- **Backend & Storage**: Supabase PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security & RPCs
- **Contact & Hosting**: Web3Forms API (`VITE_WEB3FORMS_ACCESS_KEY`), Vercel Static + Serverless Function (`/api/render-home`)

## Folder Structure

```text
api/
├── _lib/seoHtmlInjector.js     # Pure meta/OG/JSON-LD sanitizer & HTML injector
└── render-home.js              # Vercel serverless function serving initial HTML with dynamic SEO
docs/
├── CMS_ADMIN_GUIDE.md          # Panduan operator CMS dashboard (Bahasa Indonesia)
└── DEPLOYMENT_CHECKLIST.md     # Checklist manual deploy GitHub, Supabase & Vercel
public/
├── favicon.svg
├── og-image.png
├── robots.txt                  # Disallows /admin & /preview
└── sitemap.xml
scripts/
├── migrate-assets-to-supabase.mjs  # Headless CLI uploader for initial 17 local assets
└── qa-security-audit.mjs           # Automated SQL/RLS, source, XSS & bundle QA suite
src/
├── assets/                     # Bundled fallback images, logos & PDFs
├── cms/                        # Lazy-loaded Admin CMS dashboard, repositories & services
├── components/                 # Presentation UI, layout, sections & SeoHead
├── constants/                  # Color presets, icon registry, public column allowlists, storage config
├── context/                    # PortfolioDataContext, ThemeContext, ThemeProvider
├── data/                       # Static data & staticFallback.js
├── hooks/                      # usePortfolioData, usePublicPortfolio, useTheme, useLenis, shortcut
├── lib/                        # supabasePublic.js (stateless public), supabase.js (admin), queryClient.js
├── pages/                      # PublicPortfolioPage.jsx, PreviewPortfolioPage.jsx
├── services/                   # publicPortfolioService.js
└── utils/                      # portfolioMapper.js, safeUrl.js, socialIcons.js, motionVariants.js
supabase/
├── migrations/                 # Sequential SQL migrations (0001..0006)
└── README.md                   # Supabase SQL & auth setup reference
```

## Setup & Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (never commit `.env`):
```env
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
VITE_USE_STATIC_FALLBACK=true
VITE_FORCE_STATIC_MODE=false
```

### 3. Setup Supabase Backend
Follow [supabase/README.md](supabase/README.md) to execute migrations `0001`–`0006`, disable public sign-ups, provision your admin user, and set auth redirect URLs.

### 4. Available NPM Scripts
- `npm run dev` — Start Vite local dev server (`http://localhost:5173`)
- `npm run build` — Build production bundle (`dist/index.html` & `dist/app.html`; when `VERCEL=1`, removes `dist/index.html` so `/` hits `/api/render-home`)
- `npm run lint` — Run ESLint across `src/`, `api/`, `scripts/`, and `vite.config.js`
- `npm run qa:security` — Run offline security, RLS SQL, XSS, bundle isolation & size budget QA suite
- `node scripts/qa-security-audit.mjs --live` — Run live anonymous RLS & Storage probes against Supabase
- `npm run preview` — Preview built bundle locally

## Documentation

- [Supabase Database & Auth Setup](supabase/README.md)
- [Panduan Operator CMS Admin](docs/CMS_ADMIN_GUIDE.md)
- [Checklist Deployment & Smoke Test](docs/DEPLOYMENT_CHECKLIST.md)

## Author

**Raihan Azka Hidayat**
- Email: [raihanazkahidayat90@gmail.com](mailto:raihanazkahidayat90@gmail.com)
- LinkedIn: [Raihan Azka Hidayat](https://www.linkedin.com/in/raihan-azka-hidayat-355772341)
- GitHub: [@Rivayy20](https://github.com/Rivayy20/)
- Instagram: [@azk.hy_](https://www.instagram.com/azk.hy_/)
