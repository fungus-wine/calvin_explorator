/**
 * Services Business Logic Service
 * Handles service-related operations and validation
 */

import type { Service } from '@/constants/services'

export class ServicesService {
  /**
   * Validate service object
   */
  static isValidService(service: unknown): service is Service {
    if (!service || typeof service !== 'object') return false

    const s = service as Service
    return (
      typeof s.id === 'string' &&
      typeof s.title === 'string' &&
      typeof s.description === 'string' &&
      typeof s.enabled === 'boolean'
    )
  }

  /**
   * Validate array of services
   */
  static isValidServicesArray(services: unknown): services is Service[] {
    if (!Array.isArray(services)) return false
    return services.every(s => this.isValidService(s))
  }

  /**
   * Find service by ID
   */
  static findServiceById(services: Service[], id: string): Service | undefined {
    return services.find(service => service.id === id)
  }

  /**
   * Check if service exists
   */
  static serviceExists(services: Service[], id: string): boolean {
    return services.some(service => service.id === id)
  }

  /**
   * Toggle service enabled state
   */
  static toggleService(services: Service[], id: string): Service[] {
    return services.map(service =>
      service.id === id
        ? { ...service, enabled: !service.enabled }
        : service
    )
  }

  /**
   * Set service enabled state
   */
  static setServiceEnabled(services: Service[], id: string, enabled: boolean): Service[] {
    return services.map(service =>
      service.id === id
        ? { ...service, enabled }
        : service
    )
  }

  /**
   * Get enabled services
   */
  static getEnabledServices(services: Service[]): Service[] {
    return services.filter(service => service.enabled)
  }

  /**
   * Get disabled services
   */
  static getDisabledServices(services: Service[]): Service[] {
    return services.filter(service => !service.enabled)
  }

  /**
   * Count enabled services
   */
  static countEnabledServices(services: Service[]): number {
    return services.filter(service => service.enabled).length
  }
}
