/**
 * WebSocket service for connecting to cogitator's gateway
 */

import { COGITATOR_CONNECTION, type ConnectionStatus } from '@/constants/connection'

export interface WebSocketEnvelope {
  topic: string
  data: Record<string, unknown>
}

type MessageHandler = (envelope: WebSocketEnvelope) => void
type StatusHandler = (status: ConnectionStatus, meta?: ReconnectMeta) => void

export interface ReconnectMeta {
  attempt: number
  nextRetryAt: number | null
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private host: string
  private port: number
  private onMessage: MessageHandler
  private onStatusChange: StatusHandler
  private reconnectDelay: number = COGITATOR_CONNECTION.RECONNECT_INITIAL_DELAY
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false
  private reconnectAttempt = 0

  constructor(onMessage: MessageHandler, onStatusChange: StatusHandler) {
    this.host = COGITATOR_CONNECTION.DEFAULT_HOST
    this.port = COGITATOR_CONNECTION.DEFAULT_PORT
    this.onMessage = onMessage
    this.onStatusChange = onStatusChange
  }

  connect(host?: string, port?: number): void {
    if (host !== undefined) this.host = host
    if (port !== undefined) this.port = port

    this.intentionalClose = false
    this.cleanup()

    this.reconnectAttempt++
    this.onStatusChange(this.reconnectAttempt === 1 ? 'connecting' : 'reconnecting', {
      attempt: this.reconnectAttempt,
      nextRetryAt: null,
    })

    const url = `ws://${this.host}:${this.port}`

    try {
      this.ws = new WebSocket(url)
    } catch {
      this.onStatusChange('disconnected')
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectDelay = COGITATOR_CONNECTION.RECONNECT_INITIAL_DELAY
      this.reconnectAttempt = 0
      this.onStatusChange('connected')
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const envelope = JSON.parse(event.data) as WebSocketEnvelope
        if (envelope.topic && envelope.data) {
          this.onMessage(envelope)
        }
      } catch {
        // Ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        if (this.reconnectAttempt >= COGITATOR_CONNECTION.MAX_RECONNECT_ATTEMPTS) {
          this.onStatusChange('offline')
        } else {
          this.scheduleReconnect()
        }
      } else {
        this.onStatusChange('disconnected')
      }
    }

    this.ws.onerror = () => {
      // onclose will fire after onerror, so reconnect logic is handled there
    }
  }

  retry(): void {
    this.reconnectAttempt = 0
    this.reconnectDelay = COGITATOR_CONNECTION.RECONNECT_INITIAL_DELAY
    this.connect(this.host, this.port)
  }

  disconnect(): void {
    this.intentionalClose = true
    this.cleanup()
    this.onStatusChange('disconnected')
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }
      this.ws = null
    }
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose) return

    const nextRetryAt = Date.now() + this.reconnectDelay

    this.onStatusChange('reconnecting', {
      attempt: this.reconnectAttempt,
      nextRetryAt,
    })

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(this.host, this.port)
    }, this.reconnectDelay)

    // Exponential backoff
    this.reconnectDelay = Math.min(
      this.reconnectDelay * COGITATOR_CONNECTION.RECONNECT_MULTIPLIER,
      COGITATOR_CONNECTION.RECONNECT_MAX_DELAY
    )
  }
}
