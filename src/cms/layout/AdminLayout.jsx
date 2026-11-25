import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayout() {
  const navigate = useNavigate();
  const { adminProfile, signOut } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileNavOpen(false);
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex font-body">
      <AdminSidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onLogout={handleLogout}
        adminProfile={adminProfile}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          adminProfile={adminProfile}
          onLogout={handleLogout}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
