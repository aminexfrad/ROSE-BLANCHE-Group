/**
 * React hook for real-time notifications
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import websocketService, { 
  WebSocketEventMap, 
  NotificationMessage, 
  NotificationsListMessage 
} from '@/lib/websocket'
import { apiClient } from '@/lib/api'

export interface Notification {
  id: number
  title: string
  message: string
  notification_type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: {
    info: number
    success: number
    warning: number
    error: number
  }
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: { info: 0, success: 0, warning: 0, error: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  
  const handlersRef = useRef<{
    notification?: (data: NotificationMessage) => void
    notifications_list?: (data: NotificationsListMessage) => void
  }>({})

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated()) {
      const connectWebSocket = async () => {
        try {
          setConnectionState('connecting')
          await websocketService.connect()
          setConnectionState('connected')
          
          // Request current notifications
          websocketService.getNotifications()
        } catch (error) {
          console.error('Failed to connect WebSocket:', error)
          setConnectionState('disconnected')
          setError('Failed to connect to real-time notifications')
        }
      }

      connectWebSocket()

      return () => {
        websocketService.disconnect()
        setConnectionState('disconnected')
      }
    }
  }, [isAuthenticated, user])

  // Setup WebSocket event handlers
  useEffect(() => {
    if (!isAuthenticated()) return

    // Handle new notifications
    const handleNewNotification = (data: NotificationMessage) => {
      setNotifications(prev => [data.notification, ...prev])
      updateStats()
    }

    // Handle notifications list
    const handleNotificationsList = (data: NotificationsListMessage) => {
      setNotifications(data.notifications)
      updateStats()
    }

    // Store handlers for cleanup
    handlersRef.current.notification = handleNewNotification
    handlersRef.current.notifications_list = handleNotificationsList

    // Register handlers
    websocketService.on('notification', handleNewNotification)
    websocketService.on('notifications_list', handleNotificationsList)

    // Cleanup
    return () => {
      if (handlersRef.current.notification) {
        websocketService.off('notification', handlersRef.current.notification)
      }
      if (handlersRef.current.notifications_list) {
        websocketService.off('notifications_list', handlersRef.current.notifications_list)
      }
    }
  }, [isAuthenticated])

  // Update connection state
  useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(websocketService.getConnectionState())
    }

    // Update immediately
    updateConnectionState()

    // Set up interval to check connection state
    const interval = setInterval(updateConnectionState, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getNotifications()
      setNotifications(response.results || [])
      updateStats()
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      )

      // Send via WebSocket
      websocketService.markNotificationAsRead(notificationId)

      // Also send via API for persistence
      await apiClient.markNotificationAsRead(notificationId)
      
      updateStats()
    } catch (err: any) {
      console.error('Error marking notification as read:', err)
      // Revert optimistic update
      fetchNotifications()
    }
  }, [fetchNotifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      )

      // Send via API
      await apiClient.markAllNotificationsAsRead()
      
      updateStats()
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err)
      // Revert optimistic update
      fetchNotifications()
    }
  }, [fetchNotifications])

  // Update stats based on current notifications
  const updateStats = useCallback(() => {
    setStats(prev => {
      const total = notifications.length
      const unread = notifications.filter(n => !n.is_read).length
      
      const byType = {
        info: notifications.filter(n => n.notification_type === 'info').length,
        success: notifications.filter(n => n.notification_type === 'success').length,
        warning: notifications.filter(n => n.notification_type === 'warning').length,
        error: notifications.filter(n => n.notification_type === 'error').length
      }

      return { total, unread, byType }
    })
  }, [notifications])

  // Filter notifications
  const getFilteredNotifications = useCallback((filter: 'all' | 'unread' | 'read' | 'info' | 'success' | 'warning' | 'error') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read)
      case 'read':
        return notifications.filter(n => n.is_read)
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        return notifications.filter(n => n.notification_type === filter)
      default:
        return notifications
    }
  }, [notifications])

  // Get notifications by date range
  const getNotificationsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return notifications.filter(notification => {
      const notificationDate = new Date(notification.created_at)
      return notificationDate >= startDate && notificationDate <= endDate
    })
  }, [notifications])

  // Search notifications
  const searchNotifications = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return notifications.filter(notification => 
      notification.title.toLowerCase().includes(lowerQuery) ||
      notification.message.toLowerCase().includes(lowerQuery)
    )
  }, [notifications])

  // Get latest notification
  const getLatestNotification = useCallback(() => {
    return notifications.length > 0 ? notifications[0] : null
  }, [notifications])

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.is_read).length
  }, [notifications])

  return {
    // State
    notifications,
    stats,
    loading,
    error,
    connectionState,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    
    // Utilities
    getFilteredNotifications,
    getNotificationsByDateRange,
    searchNotifications,
    getLatestNotification,
    getUnreadCount,
    
    // WebSocket
    isConnected: websocketService.isConnected(),
    reconnect: () => websocketService.connect()
  }
}
