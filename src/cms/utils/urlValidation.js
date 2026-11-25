/**
 * Validates URLs safely to prevent XSS (`javascript:`, `data:`, `vbscript:` injection).
 * Empty strings pass here; requiredness is enforced separately by Zod schemas.
 */
export function isSafeUrl(value, { allowAnchor = false, allowMailto = false } = {}) {
  if (value == null) return true;
  const trimmed = String(value).trim();
  if (!trimmed) return true;

  if (allowAnchor && /^#[A-Za-z0-9_-]*$/.test(trimmed)) {
    return true;
  }

  if (allowMailto && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractZodErrors(issues = []) {
  const map = {};
  for (const issue of issues) {
    const pathKey = Array.isArray(issue.path) ? issue.path.join('.') : '';
    if (pathKey && !map[pathKey]) {
      map[pathKey] = issue.message;
    }
  }
  return map;
}
