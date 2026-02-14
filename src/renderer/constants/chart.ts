/**
 * Chart configuration constants
 * Centralized chart styling and layout values
 */

export const CHART_CONFIG = {
  /** Default chart height in pixels */
  HEIGHT: 300,
  /** Area fill opacity (0-1) */
  AREA_OPACITY: 0.6,
  /** Line stroke width in pixels */
  LINE_WIDTH: 2,
  /** Number of ticks on X axis */
  X_AXIS_TICKS: 6,
  /** Number of ticks on Y axis */
  Y_AXIS_TICKS: 3
} as const

/**
 * SVG gradient definitions for area charts
 * Provides gradients for chart-1 and chart-2 theme colors
 * Can be used by any area chart component
 */
export const CHART_GRADIENT_DEFS = `
  <linearGradient id="fillChart1" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stop-color="var(--chart-1)" stop-opacity="0.8"/>
    <stop offset="95%" stop-color="var(--chart-1)" stop-opacity="0.1"/>
  </linearGradient>
  <linearGradient id="fillChart2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stop-color="var(--chart-2)" stop-opacity="0.8"/>
    <stop offset="95%" stop-color="var(--chart-2)" stop-opacity="0.1"/>
  </linearGradient>
` as const

/**
 * FFT data generation constants
 */
export const FFT_CONFIG = {
  /** Number of data points to generate */
  DATA_POINTS: 100,
  /** Frequency step size in Hz */
  FREQ_STEP: 0.5,
  /** Maximum frequency in Hz */
  MAX_FREQ: 50
} as const

export type ChartConfig = typeof CHART_CONFIG
export type FFTConfig = typeof FFT_CONFIG
