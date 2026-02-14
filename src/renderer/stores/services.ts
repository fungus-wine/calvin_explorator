import { defineStore } from 'pinia'
import { DEFAULT_SERVICES, type Service } from '@/constants/services'
import { ServicesService } from '@/services/servicesService'
import { StorageService } from '@/services/storageService'
import { STORAGE_KEYS } from '@/constants/storage'

interface ServicesState {
  services: Service[]
}

export const useServicesStore = defineStore('services', {
  state: (): ServicesState => ({
    // Deep clone to avoid mutating the constant
    services: JSON.parse(JSON.stringify(DEFAULT_SERVICES))
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
    getServiceById(state) {
      return (id: string): Service | undefined => {
        return ServicesService.findServiceById(state.services, id)
      }
    },

    /**
     * Check if a service is enabled
     */
    isServiceEnabled(state) {
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
     * Reset all services to default state
     */
    resetToDefaults(): void {
      this.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES))
      this.saveToLocalStorage()
    },

    /**
     * Save services state to localStorage
     */
    saveToLocalStorage(): void {
      StorageService.set(STORAGE_KEYS.SERVICES, this.services)
    },

    /**
     * Load services state from localStorage
     */
    loadFromLocalStorage(): void {
      const saved = StorageService.get<Service[]>(STORAGE_KEYS.SERVICES)
      if (saved && ServicesService.isValidServicesArray(saved)) {
        this.services = saved
      } else {
        this.resetToDefaults()
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
