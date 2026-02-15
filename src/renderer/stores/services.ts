import { defineStore } from 'pinia'
import { SERVICES, type Service } from '@/constants/services'
import { ServicesService } from '@/services/servicesService'
import { STORAGE_KEYS } from '@/constants/storage'

interface ServicesState {
  services: Service[]
}

export const useServicesStore = defineStore('services', {
  state: (): ServicesState => ({
    services: [...SERVICES]
  }),

  getters: {
    /**
     * Get all services
     */
    allServices(state): Service[] {
      return state.services
    },

    /**
     * Get enabled services
     */
    enabledServices(state): Service[] {
      return ServicesService.getEnabledServices(state.services)
    },

    /**
     * Get disabled services
     */
    disabledServices(state): Service[] {
      return ServicesService.getDisabledServices(state.services)
    },

    /**
     * Get service by ID
     */
    getServiceById(state): (id: string) => Service | undefined {
      return (id: string): Service | undefined => {
        return ServicesService.findServiceById(state.services, id)
      }
    },

    /**
     * Check if a service is enabled
     */
    isServiceEnabled(state): (id: string) => boolean {
      return (id: string): boolean => {
        const service = ServicesService.findServiceById(state.services, id)
        return service?.enabled ?? false
      }
    },

    /**
     * Get enabled services count
     */
    enabledCount(state): number {
      return ServicesService.countEnabledServices(state.services)
    }
  },

  actions: {
    /**
     * Toggle a service's enabled state
     */
    toggleService(id: string): void {
      if (ServicesService.serviceExists(this.services, id)) {
        this.services = ServicesService.toggleService(this.services, id)
        this.saveToLocalStorage()
      }
    },

    /**
     * Set a service's enabled state
     */
    setServiceEnabled(id: string, enabled: boolean): void {
      if (ServicesService.serviceExists(this.services, id)) {
        this.services = ServicesService.setServiceEnabled(this.services, id, enabled)
        this.saveToLocalStorage()
      }
    },

    /**
     * Enable a service
     */
    enableService(id: string): void {
      this.setServiceEnabled(id, true)
    },

    /**
     * Disable a service
     */
    disableService(id: string): void {
      this.setServiceEnabled(id, false)
    },

    /**
     * Save services state to localStorage
     */
    saveToLocalStorage(): void {
      try {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(this.services))
      } catch (error) {
        console.warn('Failed to save services state to localStorage', error)
      }
    },

    /**
     * Load services state from localStorage
     */
    loadFromLocalStorage(): void {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SERVICES)
        if (saved) {
          const parsed = JSON.parse(saved) as Service[]
          if (ServicesService.isValidServicesArray(parsed)) {
            this.services = parsed
          }
        }
      } catch (error) {
        console.warn('Failed to load services state from localStorage', error)
      }
    },

    /**
     * Initialize services from localStorage
     */
    initialize(): void {
      this.loadFromLocalStorage()
    }
  }
})
