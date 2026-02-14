/**
 * Theme Service
 * Handles DOM manipulation for theme and dark mode
 */

export class ThemeService {
  /**
   * Apply dark mode to document element
   */
  static applyDarkMode(isDark: boolean): boolean {
    try {
      if (!document?.documentElement) {
        console.error('Cannot apply dark mode: document.documentElement not available')
        return false
      }

      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return true
    } catch (error) {
      console.error('Failed to apply dark mode:', error)
      return false
    }
  }

  /**
   * Apply theme to document element
   */
  static applyTheme(theme: string): boolean {
    try {
      if (!document?.documentElement) {
        console.error('Cannot apply theme: document.documentElement not available')
        return false
      }

      document.documentElement.dataset.theme = theme
      return true
    } catch (error) {
      console.error('Failed to apply theme:', error)
      return false
    }
  }

  /**
   * Get current theme from document
   */
  static getCurrentTheme(): string | undefined {
    return document?.documentElement?.dataset?.theme
  }

  /**
   * Check if dark mode is currently active
   */
  static isDarkModeActive(): boolean {
    return document?.documentElement?.classList?.contains('dark') ?? false
  }

  /**
   * Validate theme name
   */
  static isValidTheme(theme: string): boolean {
    const validThemes = ['default', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet']
    return validThemes.includes(theme)
  }
}
