import { Link, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaExternalLinkAlt,
  FaEye,
  FaMoon,
  FaSignOutAlt,
  FaSun,
} from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';
import { getNavItemByPath } from '../config/navigation';

export function AdminTopbar({ onOpenMobileNav, adminProfile, onLogout }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const activeNav = getNavItemByPath(location.pathname);

  return (
    <header className="sticky top-0 z-30 h-16 editorial-glass border-b border-border-subtle px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Buka menu navigasi"
          className="lg:hidden w-9 h-9 rounded-xl border border-border-subtle flex items-center justify-center text-ink hover:bg-surface-subtle cursor-pointer shrink-0 transition-colors"
        >
          <FaBars />
        </button>

        <div className="min-w-0">
          <p className="font-heading font-bold text-base sm:text-lg text-ink truncate">
            {activeNav.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          to="/preview"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-[#f25858] text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <FaEye className="text-[11px]" />
          <span className="hidden sm:inline">Preview</span>
        </Link>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink transition-colors"
        >
          <FaExternalLinkAlt className="text-[10px]" />
          <span className="hidden sm:inline">Live Site</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="w-9 h-9 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <FaSun className="text-sm text-accent" /> : <FaMoon className="text-sm" />}
        </button>

        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border-subtle">
          <span className="text-xs font-medium text-muted max-w-40 truncate">
            {adminProfile?.email}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
          className="w-9 h-9 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-muted hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="text-sm" />
        </button>
      </div>
    </header>
  );
}
