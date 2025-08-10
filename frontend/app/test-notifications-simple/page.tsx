/**
 * Simple test page for notifications
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, CheckCircle, AlertCircle, Info, XCircle, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { websocketService } from "@/lib/websocket"

export default function TestNotificationsSimplePage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [stats, setStats] = useState({ total: 0, unread: 0 })

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect().catch(console.error)
    
    // Listen for connection state changes
    const updateConnectionState = () => {
      setConnectionState(websocketService.getConnectionState())
    }
    
    updateConnectionState()
    const interval = setInterval(updateConnectionState, 1000)
    
    return () => {
      clearInterval(interval)
      websocketService.disconnect()
    }
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.getNotifications()
      setNotifications(response.results || [])
      setStats({
        total: response.count || 0,
        unread: (response.results || []).filter((n: any) => !n.is_read).length
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id)
      fetchNotifications() // Refresh the list
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      fetchNotifications() // Refresh the list
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Test Notifications (Simple)</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionState === 'connected' ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm">
              {connectionState === 'connected' ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Connection Status</CardTitle>
          <CardDescription>Real-time notification connection information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Connection State:</p>
              <Badge variant={connectionState === 'connected' ? 'default' : 'destructive'}>
                {connectionState}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Is Connected:</p>
              <Badge variant={connectionState === 'connected' ? 'default' : 'destructive'}>
                {connectionState === 'connected' ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Test notification actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={fetchNotifications} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Notifications
                </>
              )}
            </Button>
            <Button 
              onClick={markAllAsRead} 
              disabled={stats.unread === 0}
              variant="outline"
            >
              Mark All as Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Statistics</CardTitle>
          <CardDescription>Current notification counts and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.unread}</p>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest notifications from the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No notifications found</p>
              <p className="text-sm text-muted-foreground">Click "Refresh Notifications" to load them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    !notification.is_read ? 'bg-accent/50' : ''
                  } ${
                    notification.notification_type === 'success' ? 'border-l-green-500 bg-green-50' :
                    notification.notification_type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    notification.notification_type === 'error' ? 'border-l-red-500 bg-red-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.notification_type)}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-sm leading-tight">
                          {notification.title}
                        </h5>
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
