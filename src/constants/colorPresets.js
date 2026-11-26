/**
 * Static Tailwind v4 class dictionaries for safe, purge-proof CMS color presets.
 * Keys match persisted database enums while visual tokens adapt across
 * Editorial Sunset presets and themed editions (Spider-Man Crimson Web).
 */

export const SKILL_CATEGORY_COLORS = {
  teal: 'bg-gradient-to-br from-primary/[0.06] via-surface to-surface',
  purple: 'bg-gradient-to-br from-lavender/[0.08] via-surface to-surface',
  yellow: 'bg-gradient-to-br from-accent/[0.10] via-surface to-surface',
  blue: 'bg-gradient-to-br from-secondary/[0.08] via-surface to-deep-violet/[0.04]',
  cyan: 'bg-gradient-to-br from-sunset-orange/[0.08] via-surface to-surface',
  white: 'bg-surface',
  coral: 'bg-gradient-to-br from-primary/[0.09] via-surface to-surface',
  mint: 'bg-gradient-to-br from-lavender/[0.07] via-surface to-accent/[0.05]',
};

export const PROJECT_PANEL_COLORS = {
  primary:
    'bg-gradient-to-br from-primary/14 via-accent/10 to-deep-violet/10 dark:from-primary/18 dark:via-deep-violet/28 dark:to-canvas',
  secondary:
    'bg-gradient-to-br from-lavender/15 via-secondary/10 to-deep-violet/12 dark:from-lavender/20 dark:via-deep-violet/30 dark:to-canvas',
  accent:
    'bg-gradient-to-br from-accent/18 via-sunset-orange/10 to-secondary/10 dark:from-accent/18 dark:via-deep-violet/24 dark:to-canvas',
  teal: 'bg-gradient-to-br from-primary/12 via-secondary/10 to-lavender/10 dark:from-primary/15 dark:via-deep-violet/25 dark:to-canvas',
  purple:
    'bg-gradient-to-br from-lavender/16 via-deep-violet/10 to-secondary/10 dark:from-lavender/20 dark:via-deep-violet/32 dark:to-canvas',
  blue: 'bg-gradient-to-br from-deep-violet/12 via-lavender/10 to-accent/10 dark:from-deep-violet/35 dark:via-lavender/15 dark:to-canvas',
  white: 'bg-surface-subtle/60',
};

export const CERTIFICATION_CARD_COLORS = {
  white: 'bg-surface',
  primary: 'bg-gradient-to-br from-primary/[0.05] to-surface',
  accent: 'bg-gradient-to-br from-accent/[0.07] to-surface',
  teal: 'bg-gradient-to-br from-secondary/[0.06] to-surface',
  yellow: 'bg-gradient-to-br from-sunset-orange/[0.07] to-surface',
};

export const SOCIAL_LINK_COLORS = {
  white: 'hover:border-ink/40 hover:text-ink',
  secondary: 'hover:border-secondary/70 hover:text-ink',
  accent: 'hover:border-accent/80 hover:text-ink',
  primary: 'hover:border-primary/70 hover:text-ink',
};

export const THEME_COLOR_PRESETS = {
  razh_cyan: {
    label: 'Tropical Sunset (Default)',
    light: {
      '--color-primary': '#FF6B6B',
      '--color-secondary': '#F48FB1',
      '--color-accent': '#FFB38A',
    },
    dark: {
      '--color-primary': '#FF7B7B',
      '--color-secondary': '#F48FB1',
      '--color-accent': '#FFB38A',
    },
  },
  electric_amber: {
    label: 'Golden Horizon',
    light: {
      '--color-primary': '#FF9B71',
      '--color-secondary': '#FFB38A',
      '--color-accent': '#FF6B6B',
    },
    dark: {
      '--color-primary': '#FF9B71',
      '--color-secondary': '#FFB38A',
      '--color-accent': '#FF7B7B',
    },
  },
  cobalt_mint: {
    label: 'Twilight Violet',
    light: {
      '--color-primary': '#A78BFA',
      '--color-secondary': '#F48FB1',
      '--color-accent': '#FFB38A',
    },
    dark: {
      '--color-primary': '#A78BFA',
      '--color-secondary': '#F48FB1',
      '--color-accent': '#FFB38A',
    },
  },
  spider_man: {
    label: 'Spider-Man (Crimson Web)',
    badge: 'Themed Edition',
    description:
      'Palet Crimson & Cobalt + jaring laba-laba, emblem Spider-Man, & efek visual khusus di portofolio publik.',
    swatches: ['#E62429', '#1D4ED8', '#0B0E17'],
    light: {
      '--color-canvas': '#F7F6F9',
      '--color-surface': '#FFFFFF',
      '--color-surface-subtle': '#ECEEF5',
      '--color-ink': '#111524',
      '--color-muted': '#525B76',
      '--color-border-subtle': 'rgba(17, 21, 36, 0.11)',
      '--color-border-strong': 'rgba(17, 21, 36, 0.24)',
      '--color-primary': '#E62429',
      '--color-secondary': '#1D4ED8',
      '--color-accent': '#FF4D57',
      '--color-sunset-orange': '#F43F5E',
      '--color-lavender': '#2563EB',
      '--color-deep-violet': '#0F1E4A',
      '--color-on-primary': '#FFFFFF',
      '--shadow-editorial':
        '0 1px 2px rgba(15, 23, 42, 0.04), 0 16px 38px -22px rgba(29, 78, 216, 0.18)',
      '--shadow-editorial-hover':
        '0 10px 26px -10px rgba(230, 36, 41, 0.20), 0 2px 6px rgba(15, 23, 42, 0.06)',
    },
    dark: {
      '--color-canvas': '#0B0E17',
      '--color-surface': '#121726',
      '--color-surface-subtle': '#1A2238',
      '--color-ink': '#F4F6FB',
      '--color-muted': '#94A3B8',
      '--color-border-subtle': 'rgba(148, 163, 184, 0.14)',
      '--color-border-strong': 'rgba(230, 36, 41, 0.34)',
      '--color-primary': '#F43238',
      '--color-secondary': '#3B82F6',
      '--color-accent': '#FF6369',
      '--color-sunset-orange': '#FB7185',
      '--color-lavender': '#60A5FA',
      '--color-deep-violet': '#0D1B3E',
      '--color-on-primary': '#FFFFFF',
      '--shadow-editorial':
        '0 1px 2px rgba(0, 0, 0, 0.45), 0 18px 40px -22px rgba(15, 30, 74, 0.80)',
      '--shadow-editorial-hover':
        '0 12px 30px -12px rgba(244, 50, 56, 0.30), 0 4px 10px rgba(0, 0, 0, 0.55)',
    },
  },
};

export function isSpiderManPreset(preset) {
  return preset === 'spider_man';
}

export function getSkillCategoryColor(preset) {
  return SKILL_CATEGORY_COLORS[preset] || SKILL_CATEGORY_COLORS.teal;
}

export function getProjectPanelColor(preset) {
  return PROJECT_PANEL_COLORS[preset] || PROJECT_PANEL_COLORS.primary;
}

export function getCertificationCardColor(preset) {
  return CERTIFICATION_CARD_COLORS[preset] || CERTIFICATION_CARD_COLORS.white;
}

export function getSocialLinkColor(preset) {
  return SOCIAL_LINK_COLORS[preset] || SOCIAL_LINK_COLORS.white;
}

export function getThemeColorPreset(preset) {
  if (typeof preset === 'string' && Object.prototype.hasOwnProperty.call(THEME_COLOR_PRESETS, preset)) {
    return THEME_COLOR_PRESETS[preset];
  }
  return THEME_COLOR_PRESETS.razh_cyan;
}
