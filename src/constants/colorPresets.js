/**
 * Static Tailwind v4 class dictionaries for safe, purge-proof CMS color presets.
 * Database stores only semantic preset keys; raw CSS/HTML is never stored or injected.
 */

export const SKILL_CATEGORY_COLORS = {
  teal: 'bg-[#5EEAD4] dark:bg-[#008B8B]',
  purple: 'bg-[#D8B4FE] dark:bg-[#483D8B]',
  yellow: 'bg-[#FDE047] dark:bg-[#B8860B]',
  blue: 'bg-[#93C5FD] dark:bg-[#00008B]',
  cyan: 'bg-[#67E8F9] dark:bg-[#0891B2]',
  white: 'bg-white',
  coral: 'bg-[#FDA4AF] dark:bg-[#9F1239]',
  mint: 'bg-[#86EFAC] dark:bg-[#166534]',
};

export const PROJECT_PANEL_COLORS = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-[#FFD60A]',
  teal: 'bg-[#5EEAD4] dark:bg-[#008B8B]',
  purple: 'bg-[#D8B4FE] dark:bg-[#483D8B]',
  blue: 'bg-[#93C5FD] dark:bg-[#1E3A8A]',
  white: 'bg-white',
};

export const CERTIFICATION_CARD_COLORS = {
  white: 'bg-white',
  primary: 'bg-primary',
  accent: 'bg-accent',
  teal: 'bg-[#5EEAD4]',
  yellow: 'bg-[#FDE047]',
};

export const SOCIAL_LINK_COLORS = {
  white: 'bg-white',
  secondary: 'bg-[#00B4D8]',
  accent: 'bg-[#FFD60A]',
  primary: 'bg-primary',
};

export const THEME_COLOR_PRESETS = {
  razh_cyan: {
    label: 'RAZH Cyan & Yellow (Default)',
    light: {
      '--color-primary': '#00E5FF',
      '--color-secondary': '#00B4D8',
      '--color-accent': '#FFD60A',
    },
    dark: {
      '--color-primary': '#0891B2',
      '--color-secondary': '#00B4D8',
      '--color-accent': '#D4AF37',
    },
  },
  electric_amber: {
    label: 'Electric Amber & Sky',
    light: {
      '--color-primary': '#FFD60A',
      '--color-secondary': '#00B4D8',
      '--color-accent': '#00E5FF',
    },
    dark: {
      '--color-primary': '#D4AF37',
      '--color-secondary': '#0891B2',
      '--color-accent': '#00B4D8',
    },
  },
  cobalt_mint: {
    label: 'Cobalt & Mint',
    light: {
      '--color-primary': '#5EEAD4',
      '--color-secondary': '#3B82F6',
      '--color-accent': '#FDE047',
    },
    dark: {
      '--color-primary': '#0D9488',
      '--color-secondary': '#2563EB',
      '--color-accent': '#CA8A04',
    },
  },
};

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
  return THEME_COLOR_PRESETS[preset] || THEME_COLOR_PRESETS.razh_cyan;
}
