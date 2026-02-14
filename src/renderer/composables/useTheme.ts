interface ThemeSettings {
  darkMode: boolean
  theme: string
}

const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  THEME: 'theme'
} as const

const DEFAULT_SETTINGS: ThemeSettings = {
  darkMode: true,
  theme: 'default'
} as const

export function useTheme() {
  /**
   * Apply dark mode class to document root
   */
  function applyDarkMode(isDark: boolean): void {
    try {
      if (!document?.documentElement) {
        console.error('Cannot apply dark mode: document.documentElement not available')
        return
      }

      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('Failed to apply dark mode:', error)
    }
  }

  /**
   * Apply theme data attribute to document root
   */
  function applyTheme(theme: string): void {
    try {
      if (!document?.documentElement) {
        console.error('Cannot apply theme: document.documentElement not available')
        return
      }

      document.documentElement.dataset.theme = theme
    } catch (error) {
      console.error('Failed to apply theme:', error)
    }
  }

  /**
   * Save theme settings to localStorage
   */
  function saveSettings(settings: Partial<ThemeSettings>): void {
    try {
      if (settings.darkMode !== undefined) {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(settings.darkMode))
      }
      if (settings.theme !== undefined) {
        localStorage.setItem(STORAGE_KEYS.THEME, settings.theme)
      }
    } catch (error) {
      console.error('Failed to save theme settings:', error)
    }
  }

  /**
   * Load theme settings from localStorage
   */
  function loadSettings(): ThemeSettings {
    try {
      const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
      const darkMode = savedDarkMode !== null
        ? savedDarkMode === 'true'
        : DEFAULT_SETTINGS.darkMode

      const theme = localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_SETTINGS.theme

      return { darkMode, theme }
    } catch (error) {
      console.error('Failed to load theme settings, using defaults:', error)
      return { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * Initialize theme from saved settings
   */
  function initializeTheme(): ThemeSettings {
    const settings = loadSettings()
    applyDarkMode(settings.darkMode)
    applyTheme(settings.theme)
    return settings
  }

  return {
    applyDarkMode,
    applyTheme,
    saveSettings,
    loadSettings,
    initializeTheme
  }
}
