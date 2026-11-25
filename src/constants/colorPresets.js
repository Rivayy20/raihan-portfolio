/**
 * Static Tailwind v4 class dictionaries for safe, purge-proof CMS color presets.
 * Keys match persisted database enums while visual tokens implement the
 * Modern Minimalist Editorial + GTA VI Sunset atmosphere across Light & Dark themes.
 */

export const SKILL_CATEGORY_COLORS = {
  teal: 'bg-gradient-to-br from-[#FF6B6B]/[0.06] via-surface to-surface',
  purple: 'bg-gradient-to-br from-[#A78BFA]/[0.08] via-surface to-surface',
  yellow: 'bg-gradient-to-br from-[#FFB38A]/[0.10] via-surface to-surface',
  blue: 'bg-gradient-to-br from-[#F48FB1]/[0.08] via-surface to-[#49345F]/[0.04]',
  cyan: 'bg-gradient-to-br from-[#FF9B71]/[0.08] via-surface to-surface',
  white: 'bg-surface',
  coral: 'bg-gradient-to-br from-[#FF6B6B]/[0.09] via-surface to-surface',
  mint: 'bg-gradient-to-br from-[#A78BFA]/[0.07] via-surface to-[#FFB38A]/[0.05]',
};

export const PROJECT_PANEL_COLORS = {
  primary: 'bg-gradient-to-br from-[#FF6B6B]/14 via-[#FFB38A]/10 to-[#49345F]/10 dark:from-[#FF6B6B]/18 dark:via-[#49345F]/28 dark:to-[#171719]',
  secondary: 'bg-gradient-to-br from-[#A78BFA]/15 via-[#F48FB1]/10 to-[#49345F]/12 dark:from-[#A78BFA]/20 dark:via-[#49345F]/30 dark:to-[#171719]',
  accent: 'bg-gradient-to-br from-[#FFB38A]/18 via-[#FF9B71]/10 to-[#F48FB1]/10 dark:from-[#FFB38A]/18 dark:via-[#49345F]/24 dark:to-[#171719]',
  teal: 'bg-gradient-to-br from-[#FF6B6B]/12 via-[#F48FB1]/10 to-[#A78BFA]/10 dark:from-[#FF6B6B]/15 dark:via-[#49345F]/25 dark:to-[#171719]',
  purple: 'bg-gradient-to-br from-[#A78BFA]/16 via-[#49345F]/10 to-[#F48FB1]/10 dark:from-[#A78BFA]/20 dark:via-[#49345F]/32 dark:to-[#171719]',
  blue: 'bg-gradient-to-br from-[#49345F]/12 via-[#A78BFA]/10 to-[#FFB38A]/10 dark:from-[#49345F]/35 dark:via-[#A78BFA]/15 dark:to-[#171719]',
  white: 'bg-surface-subtle/60',
};

export const CERTIFICATION_CARD_COLORS = {
  white: 'bg-surface',
  primary: 'bg-gradient-to-br from-[#FF6B6B]/[0.05] to-surface',
  accent: 'bg-gradient-to-br from-[#FFB38A]/[0.07] to-surface',
  teal: 'bg-gradient-to-br from-[#F48FB1]/[0.06] to-surface',
  yellow: 'bg-gradient-to-br from-[#FF9B71]/[0.07] to-surface',
};

export const SOCIAL_LINK_COLORS = {
  white: 'hover:border-ink/40 hover:text-ink',
  secondary: 'hover:border-[#F48FB1]/70 hover:text-ink',
  accent: 'hover:border-[#FFB38A]/80 hover:text-ink',
  primary: 'hover:border-[#FF6B6B]/70 hover:text-ink',
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
