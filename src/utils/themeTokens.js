import { getThemeColorPreset, isSpiderManPreset } from '../constants/colorPresets.js';

export const PUBLIC_THEME_SNAPSHOT_KEY = 'razh_public_theme_snapshot_v1';

export const VALID_ANIMATION_INTENSITIES = ['subtle', 'balanced', 'cinematic'];
export const VALID_ANIMATION_SPEEDS = ['slow', 'normal', 'snappy'];

export const DEFAULT_THEME_CONFIG = Object.freeze({
  accentOverrides: Object.freeze({
    spiderRed: '',
    electricBlue: '',
    interactiveAccent: '',
  }),
  effects: Object.freeze({
    webBackground: true,
    cursorTrail: true,
    spiderSensePulse: true,
    timelineAnimation: true,
    skillNetwork: true,
    projectHover: true,
    contactInteraction: true,
    loadingIntro: true,
  }),
  animation: Object.freeze({
    intensity: 'balanced',
    speed: 'normal',
    replayOnScroll: true,
  }),
});

export const ACCENT_BOUNDARY_SWATCHES = Object.freeze({
  spiderRed: Object.freeze(['#E62429', '#DC2626', '#E11D48', '#F43F5E', '#D94E4E']),
  electricBlue: Object.freeze(['#1D4ED8', '#2563EB', '#3B82F6', '#0284C7', '#6366F1']),
  interactiveAccent: Object.freeze(['#E62429', '#2563EB', '#FF6B6B', '#F43F5E', '#A78BFA']),
});

const BASE_MODE_DEFAULTS = {
  light: {
    '--color-canvas': '#F8F5F0',
    '--color-surface': '#FFFFFF',
    '--color-surface-subtle': '#F0EBE3',
    '--color-ink': '#171719',
    '--color-muted': '#5F5D69',
    '--color-border-subtle': 'rgba(23, 23, 25, 0.1)',
    '--color-border-strong': 'rgba(23, 23, 25, 0.22)',
    '--color-sunset-orange': '#FF9B71',
    '--color-lavender': '#A78BFA',
    '--color-deep-violet': '#49345F',
    '--color-on-primary': '#171719',
  },
  dark: {
    '--color-canvas': '#171719',
    '--color-surface': '#1E1E22',
    '--color-surface-subtle': '#26252D',
    '--color-ink': '#F6F3EE',
    '--color-muted': '#A1A1AA',
    '--color-border-subtle': 'rgba(255, 255, 255, 0.09)',
    '--color-border-strong': 'rgba(255, 255, 255, 0.19)',
    '--color-sunset-orange': '#FF9B71',
    '--color-lavender': '#A78BFA',
    '--color-deep-violet': '#49345F',
    '--color-on-primary': '#171719',
  },
};

const INTENSITY_MULTIPLIERS = {
  subtle: 0.62,
  balanced: 1,
  cinematic: 1.32,
};

const SPEED_FACTORS = {
  slow: 1.35,
  normal: 1,
  snappy: 0.72,
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(value) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value.trim());
}

function hexToRgbTuple(hex) {
  if (!isValidHexColor(hex)) return null;
  const clean = hex.trim().slice(1);
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

export function getRelativeLuminance(hex) {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return 0;
  const transform = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
}

/**
 * Bounded contrast check: prevents near-black or near-white hex colors
 * that would break contrast or disappear on dark/light editorial canvases.
 */
export function isWithinAccentContrastBounds(hex) {
  if (!isValidHexColor(hex)) return false;
  const lum = getRelativeLuminance(hex);
  return lum >= 0.04 && lum <= 0.88;
}

export function sanitizeBoundedAccentHex(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!isWithinAccentContrastBounds(trimmed)) return '';
  return trimmed.toUpperCase();
}

export function hexToRgba(hex, alpha = 1) {
  const rgb = hexToRgbTuple(hex);
  const clampedAlpha = Math.min(1, Math.max(0, Number(alpha) || 0));
  if (!rgb) return `rgba(230, 36, 41, ${clampedAlpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')})`;
}

export function getContrastOnColor(hex) {
  if (!isValidHexColor(hex)) return '#FFFFFF';
  return getRelativeLuminance(hex) > 0.36 ? '#171719' : '#FFFFFF';
}

export function normalizeThemeConfig(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const rawAccents =
    src.accentOverrides && typeof src.accentOverrides === 'object' && !Array.isArray(src.accentOverrides)
      ? src.accentOverrides
      : {};
  const rawEffects =
    src.effects && typeof src.effects === 'object' && !Array.isArray(src.effects)
      ? src.effects
      : {};
  const rawAnim =
    src.animation && typeof src.animation === 'object' && !Array.isArray(src.animation)
      ? src.animation
      : {};

  return {
    accentOverrides: {
      spiderRed: sanitizeBoundedAccentHex(rawAccents.spiderRed),
      electricBlue: sanitizeBoundedAccentHex(rawAccents.electricBlue),
      interactiveAccent: sanitizeBoundedAccentHex(rawAccents.interactiveAccent),
    },
    effects: {
      webBackground: rawEffects.webBackground !== false,
      cursorTrail: rawEffects.cursorTrail !== false,
      spiderSensePulse: rawEffects.spiderSensePulse !== false,
      timelineAnimation: rawEffects.timelineAnimation !== false,
      skillNetwork: rawEffects.skillNetwork !== false,
      projectHover: rawEffects.projectHover !== false,
      contactInteraction: rawEffects.contactInteraction !== false,
      loadingIntro: rawEffects.loadingIntro !== false,
    },
    animation: {
      intensity: VALID_ANIMATION_INTENSITIES.includes(rawAnim.intensity)
        ? rawAnim.intensity
        : DEFAULT_THEME_CONFIG.animation.intensity,
      speed: VALID_ANIMATION_SPEEDS.includes(rawAnim.speed)
        ? rawAnim.speed
        : DEFAULT_THEME_CONFIG.animation.speed,
      replayOnScroll: rawAnim.replayOnScroll !== false,
    },
  };
}

export function resolveThemeTokens({
  colorPreset = 'razh_cyan',
  mode = 'light',
  themeConfig = DEFAULT_THEME_CONFIG,
  includeBaseVars = false,
} = {}) {
  const safeMode = mode === 'dark' ? 'dark' : 'light';
  const presetKey = typeof colorPreset === 'string' && colorPreset ? colorPreset : 'razh_cyan';
  const preset = getThemeColorPreset(presetKey);
  const presetTokens = safeMode === 'dark' ? preset.dark : preset.light;
  const normalizedConfig = normalizeThemeConfig(themeConfig);
  const isSpiderMan = isSpiderManPreset(presetKey);

  const defaultSpiderRed = isSpiderMan
    ? presetTokens['--color-primary']
    : '#E62429';
  const defaultElectricBlue = isSpiderMan
    ? presetTokens['--color-secondary']
    : safeMode === 'dark'
      ? '#60A5FA'
      : '#2563EB';
  const defaultInteractive = presetTokens['--color-primary'];

  const spiderRed = normalizedConfig.accentOverrides.spiderRed || defaultSpiderRed;
  const electricBlue = normalizedConfig.accentOverrides.electricBlue || defaultElectricBlue;
  const interactiveAccent =
    normalizedConfig.accentOverrides.interactiveAccent || defaultInteractive;

  const mult = INTENSITY_MULTIPLIERS[normalizedConfig.animation.intensity] ?? 1;
  const speedFactor = SPEED_FACTORS[normalizedConfig.animation.speed] ?? 1;

  const clampAlpha = (baseAlpha) => Math.min(0.85, baseAlpha * mult);

  const webLineSource = isSpiderMan ? spiderRed : interactiveAccent;
  const cssVars = {
    ...(includeBaseVars ? BASE_MODE_DEFAULTS[safeMode] : {}),
    ...presetTokens,
  };

  if (normalizedConfig.accentOverrides.interactiveAccent) {
    cssVars['--color-primary'] = interactiveAccent;
    cssVars['--color-on-primary'] = getContrastOnColor(interactiveAccent);
  }

  if (isSpiderMan && normalizedConfig.accentOverrides.spiderRed && !normalizedConfig.accentOverrides.interactiveAccent) {
    cssVars['--color-primary'] = spiderRed;
    cssVars['--color-accent'] = spiderRed;
    cssVars['--color-on-primary'] = getContrastOnColor(spiderRed);
  }

  if (isSpiderMan && normalizedConfig.accentOverrides.electricBlue) {
    cssVars['--color-secondary'] = electricBlue;
    cssVars['--color-lavender'] = electricBlue;
  }

  cssVars['--color-spider-red'] = spiderRed;
  cssVars['--color-electric-blue'] = electricBlue;
  cssVars['--color-interactive-accent'] = interactiveAccent;
  cssVars['--color-web-line'] = hexToRgba(
    webLineSource,
    safeMode === 'dark' ? clampAlpha(0.28) : clampAlpha(0.2)
  );
  cssVars['--color-web-glow'] = hexToRgba(
    spiderRed,
    safeMode === 'dark' ? clampAlpha(0.36) : clampAlpha(0.28)
  );
  cssVars['--color-electric-glow'] = hexToRgba(
    electricBlue,
    safeMode === 'dark' ? clampAlpha(0.34) : clampAlpha(0.24)
  );
  cssVars['--color-spider-sense-glow'] = hexToRgba(
    spiderRed,
    safeMode === 'dark' ? clampAlpha(0.55) : clampAlpha(0.42)
  );
  cssVars['--sv-effect-scale'] = String(mult);
  cssVars['--sv-speed-factor'] = String(speedFactor);

  return {
    presetKey,
    isSpiderMan,
    mode: safeMode,
    config: normalizedConfig,
    palette: {
      spiderRed,
      electricBlue,
      interactiveAccent,
    },
    cssVars,
  };
}

export function applyThemeTokensToElement(el, resolved, previousKeys = []) {
  if (!el || !resolved?.cssVars) return [];
  const nextKeys = Object.keys(resolved.cssVars);
  const nextSet = new Set(nextKeys);

  for (const prevKey of previousKeys) {
    if (!nextSet.has(prevKey)) {
      el.style.removeProperty(prevKey);
    }
  }

  el.dataset.portfolioTheme = resolved.presetKey || 'razh_cyan';
  for (const [cssVar, value] of Object.entries(resolved.cssVars)) {
    el.style.setProperty(cssVar, value);
  }

  return nextKeys;
}

export function clearThemeTokensFromElement(el, keys = []) {
  if (!el) return;
  delete el.dataset.portfolioTheme;
  for (const cssVar of keys) {
    el.style.removeProperty(cssVar);
  }
}

export function savePublicThemeSnapshot({ colorPreset, themeConfig } = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      PUBLIC_THEME_SNAPSHOT_KEY,
      JSON.stringify({
        version: 1,
        colorPreset: colorPreset || 'razh_cyan',
        themeConfig: normalizeThemeConfig(themeConfig),
      })
    );
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

export function readPublicThemeSnapshot() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PUBLIC_THEME_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return {
      colorPreset: parsed.colorPreset || 'razh_cyan',
      themeConfig: normalizeThemeConfig(parsed.themeConfig),
    };
  } catch {
    return null;
  }
}
