import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaShieldAlt, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { CMS_NAV_GROUPS } from '../config/navigation';

function SidebarContent({ onNavigate, onLogout, adminProfile, onCloseMobile }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00B4D8]/30 text-[#0096B4] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <span className="font-heading font-black tracking-tight text-base text-slate-900 dark:text-zinc-100 block leading-none">
              RAZH CMS
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Admin Workspace
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav aria-label="Navigasi CMS" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {CMS_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={Boolean(item.end)}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#00E5FF]/15 text-[#0096B4] dark:text-[#00E5FF] font-semibold'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-zinc-100'
                        }`
                      }
                    >
                      <Icon className="text-sm shrink-0 opacity-85" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Admin Info & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 shrink-0 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
            {adminProfile?.email || 'Administrator'}
          </p>
          <p className="text-[11px] uppercase tracking-wider font-bold text-[#0096B4] dark:text-[#00E5FF] mt-0.5">
            {adminProfile?.role || 'super_admin'}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ isMobileOpen, onCloseMobile, onLogout, adminProfile }) {
  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseMobile?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent adminProfile={adminProfile} onLogout={onLogout} />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            <SidebarContent
              adminProfile={adminProfile}
              onLogout={onLogout}
              onNavigate={onCloseMobile}
              onCloseMobile={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}
