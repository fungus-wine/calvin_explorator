/**
 * Storage Keys Constants
 * Centralized localStorage keys to avoid magic strings
 */

export const STORAGE_KEYS = {
  // Theme settings
  DARK_MODE: 'darkMode',
  THEME: 'theme',

  // Services state
  SERVICES: 'services',

  // User preferences (future use)
  USER_PREFERENCES: 'userPreferences',

  // PID tuning (future use)
  PID_PARAMETERS: 'pidParameters',

  // Telemetry settings (future use)
  TELEMETRY_CONFIG: 'telemetryConfig',

  // Last connection info
  LAST_CONNECTION: 'lastConnection',

  // Cogitator connection settings
  COGITATOR_CONNECTION: 'cogitatorConnection'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

/**
 * Helper to validate storage key
 */
export function isValidStorageKey(key: string): key is StorageKey {
  return Object.values(STORAGE_KEYS).includes(key as StorageKey)
}
