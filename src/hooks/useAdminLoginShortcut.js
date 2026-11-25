import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcut (`Ctrl + .` / `Cmd + .`) to open `/admin/login`
 * from the public portfolio without cluttering the public UI or importing CMS code.
 */
export function useAdminLoginShortcut(enabled = true) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (e) => {
      if (
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/preview')
      ) {
        return;
      }

      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const hasModifier = e.ctrlKey || e.metaKey;
      const isPeriod = e.key === '.' || e.code === 'Period';

      if (hasModifier && !e.altKey && !e.shiftKey && isPeriod) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, location.pathname, navigate]);
}
