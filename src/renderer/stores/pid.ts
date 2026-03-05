/**
 * PID store - manages PID controller state and communication with cogitator
 */

import { defineStore } from 'pinia'
import { TOPICS } from '@/constants/connection'
import { useTelemetryStore } from '@/stores/telemetry'
import type { WebSocketEnvelope } from '@/services/websocketService'
import { toast } from 'vue-sonner'

interface PIDValues {
  kp: number
  ki: number
  kd: number
}

interface PIDController {
  id: string
  name: string
  description: string
  loop: 'inner' | 'outer'
  values: PIDValues
}

interface PendingAdjustment {
  controllerId: string
  previousValues: PIDValues
  resolve: () => void
  reject: (reason: string) => void
}

interface PIDState {
  controllers: PIDController[]
  loaded: boolean
  flashingParam: string | null
}

const RESPONSE_TIMEOUT_MS = 5000

let pendingAdjustment: PendingAdjustment | null = null
let pendingReadResolve: (() => void) | null = null
let pendingReadReject: ((reason: string) => void) | null = null
let boundHandler: ((envelope: WebSocketEnvelope) => void) | null = null

export const usePidStore = defineStore('pid', {
  state: (): PIDState => ({
    controllers: [
      {
        id: 'tilt',
        name: 'Tilt Controller',
        description: 'Main balancing PID for pitch control',
        loop: 'inner',
        values: { kp: 0, ki: 0, kd: 0 },
      },
      {
        id: 'velocity',
        name: 'Velocity Controller',
        description: 'Forward/backward movement control',
        loop: 'outer',
        values: { kp: 0, ki: 0, kd: 0 },
      },
    ] as PIDController[],
    loaded: false,
    flashingParam: null,
  }),

  getters: {
    isAvailable(): boolean {
      const telemetry = useTelemetryStore()
      return telemetry.isConnected && this.loaded
    },

    controllerByLoop(): (loop: 'inner' | 'outer') => PIDController | undefined {
      return (loop) => this.controllers.find(c => c.loop === loop)
    },
  },

  actions: {
    init() {
      const telemetry = useTelemetryStore()

      boundHandler = (envelope: WebSocketEnvelope) => {
        if (envelope.topic === TOPICS.RESPONSE_PID) {
          this.handlePidResponse(envelope.data)
        } else if (envelope.topic === TOPICS.RESPONSE_PID_READ) {
          this.handlePidReadResponse(envelope.data)
        }
      }

      telemetry.subscribe(boundHandler)
    },

    dispose() {
      if (boundHandler) {
        const telemetry = useTelemetryStore()
        telemetry.unsubscribe(boundHandler)
        boundHandler = null
      }
    },

    fetchCurrentValues(): Promise<void> {
      return new Promise((resolve, reject) => {
        const telemetry = useTelemetryStore()
        if (!telemetry.isConnected) {
          reject('Not connected to cogitator')
          return
        }

        pendingReadResolve = resolve
        pendingReadReject = reject

        telemetry.send(TOPICS.COMMAND_PID_READ, {})

        setTimeout(() => {
          if (pendingReadReject) {
            pendingReadReject('Timed out waiting for PID values')
            pendingReadResolve = null
            pendingReadReject = null
          }
        }, RESPONSE_TIMEOUT_MS)
      })
    },

    handlePidReadResponse(data: Record<string, unknown>) {
      if (data.status === 'error') {
        const error = (data.error as string) || 'Failed to read PID values'
        this.loaded = false
        if (pendingReadReject) {
          pendingReadReject(error)
          pendingReadResolve = null
          pendingReadReject = null
        }
        return
      }

      const inner = data.inner as PIDValues | undefined
      const outer = data.outer as PIDValues | undefined

      if (inner) {
        const ctrl = this.controllerByLoop('inner')
        if (ctrl) ctrl.values = { ...inner }
      }
      if (outer) {
        const ctrl = this.controllerByLoop('outer')
        if (ctrl) ctrl.values = { ...outer }
      }

      this.loaded = true

      if (pendingReadResolve) {
        pendingReadResolve()
        pendingReadResolve = null
        pendingReadReject = null
      }
    },

    adjustValue(
      controllerId: string,
      param: 'kp' | 'ki' | 'kd',
      newValue: number
    ): Promise<void> {
      const controller = this.controllers.find(c => c.id === controllerId)
      if (!controller) return Promise.reject('Controller not found')

      const previousValues: PIDValues = { ...controller.values }
      controller.values[param] = newValue

      return new Promise((resolve, reject) => {
        const telemetry = useTelemetryStore()

        pendingAdjustment = {
          controllerId,
          previousValues,
          resolve,
          reject,
        }

        telemetry.send(TOPICS.COMMAND_PID, {
          loop: controller.loop,
          kp: controller.values.kp,
          ki: controller.values.ki,
          kd: controller.values.kd,
        })

        setTimeout(() => {
          if (pendingAdjustment?.controllerId === controllerId) {
            controller.values = { ...previousValues }
            pendingAdjustment.reject('Timed out waiting for confirmation')
            pendingAdjustment = null
          }
        }, RESPONSE_TIMEOUT_MS)
      })
    },

    handlePidResponse(data: Record<string, unknown>) {
      if (!pendingAdjustment) return

      const loop = data.loop as string
      const controller = this.controllers.find(c => c.loop === loop)
      if (!controller || controller.id !== pendingAdjustment.controllerId) return

      if (data.status === 'confirmed') {
        pendingAdjustment.resolve()
      } else {
        controller.values = { ...pendingAdjustment.previousValues }
        const error = (data.error as string) || 'PID update rejected'
        pendingAdjustment.reject(error)
      }

      pendingAdjustment = null
    },

    flashParam(key: string) {
      this.flashingParam = key
      setTimeout(() => {
        if (this.flashingParam === key) {
          this.flashingParam = null
        }
      }, 200)
    },
  },
})
