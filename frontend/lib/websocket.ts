/**
 * WebSocket service for real-time notifications
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 */

import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { websocket } from './env'

export interface WebSocketMessage {
  type: string
  [key: string]: any
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'notification'
  notification: {
    id: number
    title: string
    message: string
    notification_type: 'info' | 'success' | 'warning' | 'error'
    is_read: boolean
    read_at?: string
    created_at: string
  }
  timestamp: string
}

export interface SystemMessage extends WebSocketMessage {
  type: 'system_message'
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

export interface BroadcastMessage extends WebSocketMessage {
  type: 'broadcast'
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
  sender?: string
  timestamp: string
}

export interface ConnectionMessage extends WebSocketMessage {
  type: 'connection_established'
  connection_id: string
  user_id: number
  timestamp: string
}

export interface NotificationsListMessage extends WebSocketMessage {
  type: 'notifications_list'
  notifications: Array<{
    id: number
    title: string
    message: string
    notification_type: 'info' | 'success' | 'warning' | 'error'
    is_read: boolean
    read_at?: string
    created_at: string
  }>
  timestamp: string
}

export type WebSocketEventMap = {
  notification: NotificationMessage
  system_message: SystemMessage
  broadcast: BroadcastMessage
  connection_established: ConnectionMessage
  notifications_list: NotificationsListMessage
  pong: { type: 'pong'; timestamp: string }
  notification_read: { type: 'notification_read'; notification_id: number; timestamp: string }
}

class WebSocketService {
  private socket: any = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = websocket.reconnectAttempts
  private reconnectDelay = websocket.reconnectDelay
  private isConnecting = false
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected'

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Handle page visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.disconnect()
        } else {
          this.connect()
        }
      })

      // Handle beforeunload
      window.addEventListener('beforeunload', () => {
        this.disconnect()
      })
    }
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.connectionState === 'connected') {
        resolve()
        return
      }

      this.isConnecting = true
      this.connectionState = 'connecting'

      console.log('Attempting WebSocket connection to:', websocket.url)
      console.log('WebSocket path:', websocket.path)

      try {
        this.socket = io(websocket.url, {
          path: websocket.path,
          auth: {
            token: token || this.getAuthToken()
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000
        })

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected successfully')
          this.connectionState = 'connected'
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve()
        })

        this.socket.on('disconnect', (reason: string) => {
          console.log('❌ WebSocket disconnected:', reason)
          this.connectionState = 'disconnected'
          this.isConnecting = false
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.socket?.connect()
          }
        })

        this.socket.on('connect_error', (error: Error) => {
          console.error('❌ WebSocket connection error:', error)
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            url: websocket.url,
            path: websocket.path
          })
          this.connectionState = 'disconnected'
          this.isConnecting = false
          
          // Don't reject the promise, just log the error
          // This allows the app to continue working with API-only mode
          console.warn('⚠️ WebSocket connection failed, falling back to API-only mode')
          resolve()
        })

        this.socket.on('notification', (data: NotificationMessage) => {
          this.handleMessage('notification', data)
          
          // Show toast notification
          const { notification } = data
          toast(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to notifications page or show notification details
                window.location.href = '/notifications'
              }
            }
          })
        })

        this.socket.on('system_message', (data: SystemMessage) => {
          this.handleMessage('system_message', data)
          
          // Show system message toast
          toast(data.message, {
            description: `System message - ${new Date(data.timestamp).toLocaleString()}`,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          })
        })

        this.socket.on('broadcast', (data: BroadcastMessage) => {
          this.handleMessage('broadcast', data)
          
          // Show broadcast message toast
          toast('Broadcast Message', {
            description: data.message,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          })
        })

        this.socket.on('connection_established', (data: ConnectionMessage) => {
          this.handleMessage('connection_established', data)
          console.log('Connection established:', data)
        })

        this.socket.on('notifications_list', (data: NotificationsListMessage) => {
          this.handleMessage('notifications_list', data)
        })

        this.socket.on('pong', (data: { type: 'pong'; timestamp: string }) => {
          this.handleMessage('pong', data)
        })

        this.socket.on('notification_read', (data: { type: 'notification_read'; notification_id: number; timestamp: string }) => {
          this.handleMessage('notification_read', data)
        })

        // Start ping interval
        this.startPingInterval()

      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
        this.connectionState = 'disconnected'
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionState = 'disconnected'
    this.isConnecting = false
    this.stopPingInterval()
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping')
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private pingInterval: NodeJS.Timeout | null = null

  sendMessage(type: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(type, data)
    } else {
      console.warn('WebSocket not connected, cannot send message:', type)
    }
  }

  markNotificationAsRead(notificationId: number): void {
    this.sendMessage('mark_read', { notification_id: notificationId })
  }

  getNotifications(): void {
    this.sendMessage('get_notifications')
  }

  on<T extends keyof WebSocketEventMap>(
    event: T,
    handler: (data: WebSocketEventMap[T]) => void
  ): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set())
    }
    this.messageHandlers.get(event)!.add(handler)
  }

  off<T extends keyof WebSocketEventMap>(
    event: T,
    handler: (data: WebSocketEventMap[T]) => void
  ): void {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  private handleMessage<T extends keyof WebSocketEventMap>(
    event: T,
    data: WebSocketEventMap[T]
  ): void {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in WebSocket handler for ${event}:`, error)
        }
      })
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState
  }

  isConnected(): boolean {
    return this.connectionState === 'connected' && this.socket?.connected === true
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Export for use in components
export default websocketService
