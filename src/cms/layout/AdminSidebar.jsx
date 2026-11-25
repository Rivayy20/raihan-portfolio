import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaShieldAlt, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { CMS_NAV_GROUPS } from '../config/navigation';

function SidebarContent({ onNavigate, onLogout, adminProfile, onCloseMobile }) {
  return (
    <div className="flex flex-col h-full bg-surface border-r border-border-subtle">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <span className="font-heading font-bold tracking-tight text-base text-ink block leading-none">
              RAZH CMS
            </span>
            <span className="text-[11px] font-medium text-muted">
              Editorial Studio
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav aria-label="Navigasi CMS" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {CMS_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted/80">
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
                            ? 'bg-primary/12 text-primary border border-primary/20 font-semibold'
                            : 'text-muted hover:bg-surface-subtle hover:text-ink border border-transparent'
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
      <div className="p-3 border-t border-border-subtle shrink-0 space-y-2">
        <div className="px-3 py-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
          <p className="text-xs font-semibold text-ink truncate">
            {adminProfile?.email || 'Administrator'}
          </p>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mt-0.5">
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
