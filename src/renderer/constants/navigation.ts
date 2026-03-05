/**
 * Navigation configuration constants
 * Defines the application navigation structure
 */

import type { Component } from 'vue'

export interface NavigationItem {
  title: string
  url: string
  icon: Component
}

/**
 * Navigation item titles
 * Centralized to ensure consistency across the app
 */
export const NAV_TITLES = {
  DASHBOARD: 'Dashboard',
  SERVICES: 'Services',
  DIAGNOSTICS: 'Diagnostics',
  TELEMETRY: 'Telemetry',
  PID_TUNING: 'PID Tuning',
  MOTOR_CONTROL: 'Motor Control',
  SETTINGS: 'Settings'
} as const

/**
 * Navigation routes
 * Centralized to ensure consistency with router configuration
 */
export const NAV_ROUTES = {
  DASHBOARD: '/dashboard',
  SERVICES: '/services',
  DIAGNOSTICS: '/diagnostics',
  TELEMETRY: '/telemetry',
  PID_TUNING: '/pid-tuning',
  MOTOR_CONTROL: '/motor-control',
  SETTINGS: '/settings'
} as const

export type NavTitle = typeof NAV_TITLES[keyof typeof NAV_TITLES]
export type NavRoute = typeof NAV_ROUTES[keyof typeof NAV_ROUTES]
