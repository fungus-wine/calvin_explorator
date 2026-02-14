/**
 * PID Utilities
 * Helper functions for PID controller calculations
 */

/**
 * Round number to specified decimal places
 */
export function roundToDecimalPlaces(value: number, places: number): number {
  const multiplier = Math.pow(10, places)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Calculate new PID parameter value based on percentage adjustment
 */
export function adjustPIDValue(
  currentValue: number,
  percentage: number,
  direction: 'up' | 'down'
): number {
  const multiplier = direction === 'up' ? (1 + percentage) : (1 - percentage)
  const newValue = currentValue * multiplier
  return roundToDecimalPlaces(newValue, 3)
}

/**
 * Get percentage multiplier for tuning mode
 */
export function getTuningPercentage(mode: 'ultrafine' | 'fine' | 'coarse'): number {
  switch (mode) {
    case 'ultrafine':
      return 0.01
    case 'fine':
      return 0.10
    case 'coarse':
      return 0.25
    default:
      return 0.10
  }
}

/**
 * Adjust PID parameter with tuning mode
 */
export function adjustWithTuningMode(
  currentValue: number,
  mode: 'ultrafine' | 'fine' | 'coarse',
  direction: 'up' | 'down'
): number {
  const percentage = getTuningPercentage(mode)
  return adjustPIDValue(currentValue, percentage, direction)
}
