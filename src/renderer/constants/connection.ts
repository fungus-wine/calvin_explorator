/**
 * Cogitator WebSocket connection constants
 */

export const COGITATOR_CONNECTION = {
  DEFAULT_HOST: 'localhost',
  DEFAULT_PORT: 5560,
  /** Max data points in rolling timeline buffers */
  TIMELINE_MAX_POINTS: 60,
  /** Reconnect backoff: initial delay in ms */
  RECONNECT_INITIAL_DELAY: 1000,
  /** Reconnect backoff: max delay in ms */
  RECONNECT_MAX_DELAY: 30000,
  /** Reconnect backoff: multiplier */
  RECONNECT_MULTIPLIER: 2,
  /** Stop retrying after this many failed attempts */
  MAX_RECONNECT_ATTEMPTS: 5,
} as const

export const TOPICS = {
  TOF: 'sensor.tof',
  IMU: 'sensor.imu',
  I2C_HEALTH: 'sensor.i2c_health',
} as const

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'offline'
