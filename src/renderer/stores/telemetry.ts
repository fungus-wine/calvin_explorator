/**
 * Telemetry store - receives live data from cogitator via WebSocket
 */

import { defineStore } from 'pinia'
import { COGITATOR_CONNECTION, TOPICS, type ConnectionStatus } from '@/constants/connection'
import { WebSocketService, type WebSocketEnvelope } from '@/services/websocketService'

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
}

// -- Store state --

interface TelemetryState {
  connectionStatus: ConnectionStatus
  host: string
  port: number
  tofFront: ToFSensorState
  tofRear: ToFSensorState
  i2cHealth: I2CHealthState
  imuLatest: IMURawReading | null
}

const MAX_POINTS = COGITATOR_CONNECTION.TIMELINE_MAX_POINTS

// Non-reactive WebSocket instance (kept outside store to avoid Pinia reactivity)
let wsInstance: WebSocketService | null = null

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
  state: (): TelemetryState => ({
    connectionStatus: 'disconnected',
    host: COGITATOR_CONNECTION.DEFAULT_HOST,
    port: COGITATOR_CONNECTION.DEFAULT_PORT,
    tofFront: emptyToF(),
    tofRear: emptyToF(),
    i2cHealth: emptyI2C(),
    imuLatest: null,
  }),

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
        (status) => { this.connectionStatus = status }
      )

      wsInstance.connect(this.host, this.port)
    },

    disconnect() {
      if (wsInstance) {
        wsInstance.disconnect()
        wsInstance = null
      }
    },

    handleMessage(envelope: WebSocketEnvelope) {
      const topicHandlers: Record<string, (data: Record<string, unknown>) => void> = {
        [TOPICS.TOF]: (data) => this.handleToF(data),
        [TOPICS.IMU]: (data) => this.handleIMU(data),
        [TOPICS.I2C_HEALTH]: (data) => this.handleI2CHealth(data),
      }

      const handler = topicHandlers[envelope.topic]
      if (handler) handler(envelope.data)
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
      this.imuLatest = {
        ax: data.ax as number ?? 0,
        ay: data.ay as number ?? 0,
        az: data.az as number ?? 0,
        gx: data.gx as number ?? 0,
        gy: data.gy as number ?? 0,
        gz: data.gz as number ?? 0,
      }
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
