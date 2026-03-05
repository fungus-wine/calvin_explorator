/**
 * Telemetry store - receives live data from cogitator via WebSocket
 */

import { defineStore } from 'pinia'
import { COGITATOR_CONNECTION, TOPICS, type ConnectionStatus } from '@/constants/connection'
import { STORAGE_KEYS } from '@/constants/storage'
import { WebSocketService, type WebSocketEnvelope, type ReconnectMeta } from '@/services/websocketService'

function loadSavedConnection(): { host: string; port: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COGITATOR_CONNECTION)
    if (raw) {
      const parsed = JSON.parse(raw) as { host: string; port: number }
      if (parsed.host && parsed.port) return parsed
    }
  } catch { /* ignore */ }
  return { host: COGITATOR_CONNECTION.DEFAULT_HOST, port: COGITATOR_CONNECTION.DEFAULT_PORT }
}

// -- ToF types --

interface ToFTimelinePoint {
  timestamp: number
  distance: number
}

interface ToFSensorState {
  distance: number
  rangeStatus: 'valid' | 'out_of_range' | 'error' | 'no_data'
  signalQuality: number
  timeline: ToFTimelinePoint[]
}

// -- I2C types --

interface I2CTimelinePoint {
  timestamp: number
  nacks: number
  timeouts: number
  resets: number
}

interface I2CHealthState {
  nacks: number
  timeouts: number
  resets: number
  status: 'healthy' | 'warning' | 'error' | 'no_data'
  timeline: I2CTimelinePoint[]
}

// -- IMU types --

interface IMURawReading {
  ax: number
  ay: number
  az: number
  gx: number
  gy: number
  gz: number
  mx: number
  my: number
  mz: number
}

export type IMUDataMode = 'accel' | 'gyro' | 'mag'

export interface IMUTimelinePoint {
  timestamp: number
  ax: number
  ay: number
  az: number
  gx: number
  gy: number
  gz: number
  mx: number
  my: number
  mz: number
}

export interface IMUSensorState {
  latest: IMURawReading | null
  timeline: IMUTimelinePoint[]
}

// -- Store state --

interface TelemetryState {
  connectionStatus: ConnectionStatus
  reconnectAttempt: number
  nextRetryAt: number | null
  host: string
  port: number
  tofFront: ToFSensorState
  tofRear: ToFSensorState
  i2cHealth: I2CHealthState
  imuBalancer: IMUSensorState
  imuOakd: IMUSensorState
}

const MAX_POINTS = COGITATOR_CONNECTION.TIMELINE_MAX_POINTS

// Non-reactive WebSocket instance (kept outside store to avoid Pinia reactivity)
let wsInstance: WebSocketService | null = null

// External message handlers (e.g. PID store subscribing to responses)
type ExternalMessageHandler = (envelope: WebSocketEnvelope) => void
const externalHandlers: ExternalMessageHandler[] = []

function appendToTimeline<T>(timeline: T[], point: T, max: number): T[] {
  const next = [...timeline, point]
  if (next.length > max) next.shift()
  return next
}

function emptyToF(): ToFSensorState {
  return {
    distance: 0,
    rangeStatus: 'no_data',
    signalQuality: 0,
    timeline: [],
  }
}

function emptyI2C(): I2CHealthState {
  return {
    nacks: 0,
    timeouts: 0,
    resets: 0,
    status: 'no_data',
    timeline: [],
  }
}

function emptyIMU(): IMUSensorState {
  return {
    latest: null,
    timeline: [],
  }
}

function deriveToFRangeStatus(distance: number): 'valid' | 'out_of_range' | 'error' {
  if (distance < 50) return 'error'
  if (distance > 4000) return 'out_of_range'
  return 'valid'
}

function deriveToFSignalQuality(distance: number): number {
  if (distance < 200) return 50 + Math.floor(Math.random() * 30)
  if (distance > 3000) return 60 + Math.floor(Math.random() * 30)
  return 85 + Math.floor(Math.random() * 15)
}

function deriveI2CStatus(nacks: number, timeouts: number, resets: number): 'healthy' | 'warning' | 'error' {
  const total = nacks + timeouts + resets
  if (total === 0) return 'healthy'
  if (resets > 0 || total > 5) return 'error'
  return 'warning'
}

export const useTelemetryStore = defineStore('telemetry', {
  state: (): TelemetryState => {
    const saved = loadSavedConnection()
    return {
      connectionStatus: 'disconnected',
      reconnectAttempt: 0,
      nextRetryAt: null,
      host: saved.host,
      port: saved.port,
      tofFront: emptyToF(),
      tofRear: emptyToF(),
      i2cHealth: emptyI2C(),
      imuBalancer: emptyIMU(),
      imuOakd: emptyIMU(),
    }
  },

  getters: {
    isConnected(state): boolean {
      return state.connectionStatus === 'connected'
    },
    frontTofWarning(state): boolean {
      return state.tofFront.rangeStatus === 'valid' && state.tofFront.distance < 200 && state.tofFront.distance > 0
    },
    rearTofWarning(state): boolean {
      return state.tofRear.rangeStatus === 'valid' && state.tofRear.distance < 200 && state.tofRear.distance > 0
    },
  },

  actions: {
    connect(host?: string, port?: number) {
      if (host !== undefined) this.host = host
      if (port !== undefined) this.port = port

      if (wsInstance) {
        wsInstance.disconnect()
      }

      wsInstance = new WebSocketService(
        (envelope) => this.handleMessage(envelope),
        (status, meta?: ReconnectMeta) => {
          this.connectionStatus = status
          this.reconnectAttempt = meta?.attempt ?? 0
          this.nextRetryAt = meta?.nextRetryAt ?? null
        }
      )

      wsInstance.connect(this.host, this.port)
    },

    disconnect() {
      if (wsInstance) {
        wsInstance.disconnect()
        wsInstance = null
      }
    },

    retry() {
      if (wsInstance) {
        wsInstance.retry()
      } else {
        this.connect()
      }
    },

    send(topic: string, data: Record<string, unknown>) {
      if (wsInstance) {
        wsInstance.send({ topic, data })
      }
    },

    subscribe(handler: ExternalMessageHandler) {
      externalHandlers.push(handler)
    },

    unsubscribe(handler: ExternalMessageHandler) {
      const idx = externalHandlers.indexOf(handler)
      if (idx !== -1) externalHandlers.splice(idx, 1)
    },

    handleMessage(envelope: WebSocketEnvelope) {
      const topicHandlers: Record<string, (data: Record<string, unknown>) => void> = {
        [TOPICS.TOF]: (data) => this.handleToF(data),
        [TOPICS.IMU]: (data) => this.handleIMU(data),
        [TOPICS.I2C_HEALTH]: (data) => this.handleI2CHealth(data),
      }

      const handler = topicHandlers[envelope.topic]
      if (handler) {
        handler(envelope.data)
      } else {
        for (const ext of externalHandlers) {
          ext(envelope)
        }
      }
    },

    handleToF(data: Record<string, unknown>) {
      const front = data.front as number | undefined
      const rear = data.rear as number | undefined
      const now = Date.now()

      if (front !== undefined) {
        const distance = Math.round(front)
        this.tofFront.distance = distance
        this.tofFront.rangeStatus = deriveToFRangeStatus(distance)
        this.tofFront.signalQuality = deriveToFSignalQuality(distance)
        this.tofFront.timeline = appendToTimeline(this.tofFront.timeline, { timestamp: now, distance }, MAX_POINTS)
      }

      if (rear !== undefined) {
        const distance = Math.round(rear)
        this.tofRear.distance = distance
        this.tofRear.rangeStatus = deriveToFRangeStatus(distance)
        this.tofRear.signalQuality = deriveToFSignalQuality(distance)
        this.tofRear.timeline = appendToTimeline(this.tofRear.timeline, { timestamp: now, distance }, MAX_POINTS)
      }
    },

    handleIMU(data: Record<string, unknown>) {
      const reading: IMURawReading = {
        ax: data.ax as number ?? 0,
        ay: data.ay as number ?? 0,
        az: data.az as number ?? 0,
        gx: data.gx as number ?? 0,
        gy: data.gy as number ?? 0,
        gz: data.gz as number ?? 0,
        mx: data.mx as number ?? 0,
        my: data.my as number ?? 0,
        mz: data.mz as number ?? 0,
      }

      const source = data.source as string | undefined
      const target = source === 'oakd' ? this.imuOakd : this.imuBalancer

      target.latest = reading
      target.timeline = appendToTimeline(
        target.timeline,
        {
          timestamp: Date.now(),
          ax: reading.ax, ay: reading.ay, az: reading.az,
          gx: reading.gx, gy: reading.gy, gz: reading.gz,
          mx: reading.mx, my: reading.my, mz: reading.mz,
        },
        MAX_POINTS
      )
    },

    handleI2CHealth(data: Record<string, unknown>) {
      const nacks = (data.nacks as number) ?? 0
      const timeouts = (data.timeouts as number) ?? 0
      const resets = (data.resets as number) ?? 0

      this.i2cHealth.nacks = nacks
      this.i2cHealth.timeouts = timeouts
      this.i2cHealth.resets = resets
      this.i2cHealth.status = deriveI2CStatus(nacks, timeouts, resets)
      this.i2cHealth.timeline = appendToTimeline(
        this.i2cHealth.timeline,
        { timestamp: Date.now(), nacks, timeouts, resets },
        MAX_POINTS
      )
    },
  },
})
