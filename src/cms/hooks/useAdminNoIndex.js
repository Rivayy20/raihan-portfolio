import { useEffect } from 'react';

/**
 * Ensures search engines never index /admin/* or /preview routes on the client side,
 * complementing server-level X-Robots-Tag headers and robots.txt rules.
 */
export function useAdminNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const createdByHook = !meta;
    const previousContent = meta?.getAttribute('content') ?? null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', 'noindex, nofollow, noarchive');

    return () => {
      if (createdByHook) {
        meta.remove();
      } else if (previousContent !== null) {
        meta.setAttribute('content', previousContent);
      } else {
        meta.removeAttribute('content');
      }
    };
  }, []);
}
