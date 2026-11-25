import {
  FaBars,
  FaBriefcase,
  FaCertificate,
  FaCog,
  FaColumns,
  FaEnvelope,
  FaEye,
  FaFolderOpen,
  FaGraduationCap,
  FaHistory,
  FaImages,
  FaRocket,
  FaSearch,
  FaShieldAlt,
  FaTachometerAlt,
  FaTools,
  FaUser,
} from 'react-icons/fa';

export const CMS_NAV_GROUPS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      {
        label: 'Overview',
        to: '/admin',
        end: true,
        icon: FaTachometerAlt,
        description: 'Ringkasan status konten, media, dan aktivitas terbaru.',
      },
    ],
  },
  {
    id: 'content',
    label: 'Website Content',
    items: [
      {
        label: 'General Settings',
        to: '/admin/settings',
        icon: FaCog,
        description: 'Identitas brand, theme preset, dan pengaturan urutan section.',
      },
      {
        label: 'Navbar',
        to: '/admin/navbar',
        icon: FaBars,
        description: 'Menu navigasi utama, urutan item, dan CTA Hire Me.',
      },
      {
        label: 'Hero & CV',
        to: '/admin/hero',
        icon: FaRocket,
        description: 'Badge intro, headline gradient, foto portrait, floating card, dan dokumen CV.',
      },
      {
        label: 'About',
        to: '/admin/about',
        icon: FaUser,
        description: 'Narasi personal, highlight teks, dan judul sub-bagian About.',
      },
      {
        label: 'Education',
        to: '/admin/education',
        icon: FaGraduationCap,
        description: 'Riwayat pendidikan saat ini dan pendidikan sebelumnya.',
      },
      {
        label: 'Experience',
        to: '/admin/experience',
        icon: FaBriefcase,
        description: 'Pengalaman akademik & industri beserta detail accordion.',
      },
      {
        label: 'Expertise',
        to: '/admin/expertise',
        icon: FaTools,
        description: 'Kategori skill, badge teknologi, level, dan ikon.',
      },
      {
        label: 'Projects',
        to: '/admin/projects',
        icon: FaFolderOpen,
        description: 'Portfolio proyek, tech stack, dan galeri multi-screenshot.',
      },
      {
        label: 'Certifications',
        to: '/admin/certifications',
        icon: FaCertificate,
        description: 'Sertifikasi profesional, status verifikasi, dan dokumen PDF.',
      },
      {
        label: 'Contact',
        to: '/admin/contact',
        icon: FaEnvelope,
        description: 'Informasi kontak, availability badge, dan social links.',
      },
      {
        label: 'Footer',
        to: '/admin/footer',
        icon: FaColumns,
        description: 'Brand text, tagline, copyright, dan visibility elemen footer.',
      },
    ],
  },
  {
    id: 'assets',
    label: 'Assets & Discovery',
    items: [
      {
        label: 'Media Library',
        to: '/admin/media',
        icon: FaImages,
        description: 'Kelola gambar dan dokumen PDF terintegrasi dengan Supabase Storage.',
      },
      {
        label: 'SEO Settings',
        to: '/admin/seo',
        icon: FaSearch,
        description: 'Meta title, description, canonical URL, Open Graph, dan JSON-LD.',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        label: 'Preview Website',
        to: '/preview',
        icon: FaEye,
        description: 'Pratinjau konten draft sebelum dipublikasikan ke pengunjung.',
      },
      {
        label: 'Revision History',
        to: '/admin/revisions',
        icon: FaHistory,
        description: 'Riwayat perubahan konten dan pemulihan snapshot ke status draft.',
      },
      {
        label: 'Account & Security',
        to: '/admin/account',
        icon: FaShieldAlt,
        description: 'Detail akun administrator, ubah password, dan keamanan sesi.',
      },
    ],
  },
];

export function getNavItemByPath(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/admin';
  for (const group of CMS_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.end) {
        if (normalized === item.to) return item;
      } else if (normalized === item.to || normalized.startsWith(`${item.to}/`)) {
        return item;
      }
    }
  }
  return CMS_NAV_GROUPS[0].items[0];
}
