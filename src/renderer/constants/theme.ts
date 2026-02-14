/**
 * Theme Constants
 * Centralized theme configuration values
 */

export const AVAILABLE_THEMES = [
  'default',
  'red',
  'rose',
  'orange',
  'green',
  'blue',
  'yellow',
  'violet'
] as const

export type ThemeName = typeof AVAILABLE_THEMES[number]

export const THEME_LABELS: Record<ThemeName, string> = {
  default: 'Default',
  red: 'Red',
  rose: 'Rose',
  orange: 'Orange',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow',
  violet: 'Violet'
}

export const DEFAULT_THEME: ThemeName = 'default'
export const DEFAULT_DARK_MODE = true

/**
 * Helper to validate theme name
 */
export function isValidTheme(theme: string): theme is ThemeName {
  return AVAILABLE_THEMES.includes(theme as ThemeName)
}

/**
 * Get theme label
 */
export function getThemeLabel(theme: ThemeName): string {
  return THEME_LABELS[theme]
}
