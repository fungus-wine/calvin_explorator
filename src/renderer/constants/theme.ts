/**
 * Theme Constants
 * Re-exported from theminator for backwards compatibility
 */

export {
  BUILT_IN_THEMES as AVAILABLE_THEMES,
  THEME_LABELS,
  registerTheme
} from 'theminator'

export type { ThemeName } from 'theminator'

export { DEFAULT_THEME, DEFAULT_DARK_MODE } from 'theminator'

/**
 * Helper to validate theme name
 */
export function isValidTheme(theme: string): boolean {
  const { BUILT_IN_THEMES } = require('theminator')
  return BUILT_IN_THEMES.includes(theme)
}

/**
 * Get theme label
 */
export function getThemeLabel(theme: string): string {
  const { THEME_LABELS } = require('theminator')
  return THEME_LABELS[theme] || theme
}
