const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/; // eslint-disable-line no-control-regex
const SAFE_HASH_RE = /^#[a-zA-Z0-9_-]+$/;
const SAFE_EMAIL_RE = /^[^\s@<>?,;&#]+@[^\s@<>?,;&#]+\.[^\s@<>?,;&#]+$/;

export function sanitizeExternalUrl(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return '';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return '';
  }

  return '';
}

export function sanitizeNavigationHref(value, fallback = '#') {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return fallback;

  if (trimmed === '#' || SAFE_HASH_RE.test(trimmed)) {
    return trimmed;
  }

  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !/\s/.test(trimmed)
  ) {
    return trimmed;
  }

  return sanitizeExternalUrl(trimmed) || fallback;
}

export function sanitizeMediaUrl(value, fallback = '') {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return fallback;

  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !/\s/.test(trimmed)
  ) {
    return trimmed;
  }

  return sanitizeExternalUrl(trimmed) || fallback;
}

export function sanitizeMailtoEmail(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return '';
  return SAFE_EMAIL_RE.test(trimmed) ? trimmed : '';
}
