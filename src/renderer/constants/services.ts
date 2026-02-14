/**
 * Service configuration constants
 * Defines available services and their default states
 */

export interface Service {
  id: string
  title: string
  description: string
  enabled: boolean
}

/**
 * Default service configurations
 * Services that are enabled by default are critical for system operation
 */
export const DEFAULT_SERVICES: readonly Service[] = [
  {
    id: 'telemetry',
    title: 'Telemetry Service',
    description: 'Real-time monitoring and data collection from connected devices',
    enabled: true
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics Service',
    description: 'Automated system health checks and performance analysis',
    enabled: true
  },
  {
    id: 'logging',
    title: 'Logging Service',
    description: 'Centralized logging and event tracking across all services',
    enabled: false
  },
  {
    id: 'notifications',
    title: 'Notification Service',
    description: 'Alert system for critical events and system status changes',
    enabled: false
  },
  {
    id: 'analytics',
    title: 'Analytics Service',
    description: 'Data processing and statistical analysis of collected metrics',
    enabled: true
  },
  {
    id: 'backup',
    title: 'Backup Service',
    description: 'Automated backup and recovery of configuration and data',
    enabled: false
  }
] as const

export type ServiceId = typeof DEFAULT_SERVICES[number]['id']
