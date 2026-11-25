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
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Buka menu navigasi"
          className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
        >
          <FaBars />
        </button>

        <div className="min-w-0">
          <p className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100 truncate">
            {activeNav.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          to="/preview"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold transition-colors"
        >
          <FaEye className="text-[11px]" />
          <span className="hidden sm:inline">Preview</span>
        </Link>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
        >
          <FaExternalLinkAlt className="text-[10px]" />
          <span className="hidden sm:inline">Live Site</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
        </button>

        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 max-w-[160px] truncate">
            {adminProfile?.email}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="text-sm" />
        </button>
      </div>
    </header>
  );
}
