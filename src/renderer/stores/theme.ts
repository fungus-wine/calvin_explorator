import { defineStore } from 'pinia'
import { ThemeService } from '@/services/themeService'
import { StorageService } from '@/services/storageService'
import { STORAGE_KEYS } from '@/constants/storage'
import { DEFAULT_THEME, DEFAULT_DARK_MODE, type ThemeName } from '@/constants/theme'

interface ThemeState {
  darkMode: boolean
  selectedTheme: ThemeName
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    darkMode: DEFAULT_DARK_MODE,
    selectedTheme: DEFAULT_THEME
  }),

  getters: {
    /**
     * Get current theme settings
     */
    settings(state): ThemeState {
      return {
        darkMode: state.darkMode,
        selectedTheme: state.selectedTheme
      }
    }
  },

  actions: {
    /**
     * Apply dark mode class to document root
     */
    applyDarkMode(): void {
      ThemeService.applyDarkMode(this.darkMode)
    },

    /**
     * Apply theme data attribute to document root
     */
    applyTheme(): void {
      ThemeService.applyTheme(this.selectedTheme)
    },

    /**
     * Set dark mode state and apply it
     */
    setDarkMode(isDark: boolean): void {
      this.darkMode = isDark
      this.applyDarkMode()
      this.saveToLocalStorage()
    },

    /**
     * Set theme and apply it
     */
    setTheme(theme: string): void {
      this.selectedTheme = theme
      this.applyTheme()
      this.saveToLocalStorage()
    },

    /**
     * Save current settings to localStorage
     */
    saveToLocalStorage(): void {
      StorageService.setBoolean(STORAGE_KEYS.DARK_MODE, this.darkMode)
      StorageService.setString(STORAGE_KEYS.THEME, this.selectedTheme)
    },

    /**
     * Load settings from localStorage
     */
    loadFromLocalStorage(): void {
      this.darkMode = StorageService.getBoolean(STORAGE_KEYS.DARK_MODE, DEFAULT_DARK_MODE)
      const savedTheme = StorageService.getString(STORAGE_KEYS.THEME, DEFAULT_THEME)
      this.selectedTheme = savedTheme as ThemeName
    },

    /**
     * Initialize theme from localStorage and apply it
     */
    initialize(): void {
      this.loadFromLocalStorage()
      this.applyDarkMode()
      this.applyTheme()
    }
  }
})
