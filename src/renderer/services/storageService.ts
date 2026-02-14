/**
 * Storage Service
 * Handles all localStorage operations with error handling and type safety
 */

export class StorageService {
  /**
   * Get item from localStorage
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue ?? null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error)
      return defaultValue ?? null
    }
  }

  /**
   * Set item in localStorage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Clear all localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage', error)
      return false
    }
  }

  /**
   * Check if key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get string value (no JSON parsing)
   */
  static getString(key: string, defaultValue = ''): string {
    try {
      return localStorage.getItem(key) ?? defaultValue
    } catch (error) {
      console.error(`Failed to get string from localStorage: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * Set string value (no JSON stringifying)
   */
  static setString(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error(`Failed to set string in localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Get boolean value
   */
  static getBoolean(key: string, defaultValue = false): boolean {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return defaultValue
      return value === 'true'
    } catch (error) {
      console.error(`Failed to get boolean from localStorage: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * Set boolean value
   */
  static setBoolean(key: string, value: boolean): boolean {
    return this.setString(key, String(value))
  }
}
