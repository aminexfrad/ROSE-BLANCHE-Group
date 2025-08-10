/**
 * Notification Bell Component
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 */

"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, CheckCircle, AlertCircle, Info, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface Notification {
  id: number
  title: string
  message: string
  notification_type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState({ total: 0, unread: 0 })

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getNotifications()
      const notifs = response.results || []
      setNotifications(notifs)
      setStats({
        total: response.count || 0,
        unread: notifs.filter((n: Notification) => !n.is_read).length
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markNotificationAsRead(id)
      fetchNotifications() // Refresh the list
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      fetchNotifications() // Refresh the list
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            setOpen(!open)
            if (!open) {
              fetchNotifications()
            }
          }}
        >
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {stats.unread > 99 ? '99+' : stats.unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {stats.unread > 0 ? 'Offline' : 'Online'}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchNotifications}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Total: {stats.total} | Non lues: {stats.unread}
          </div>

          {stats.unread > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              className="w-full"
            >
              Marquer tout comme lu
            </Button>
          )}

          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-4 w-4 mx-auto animate-spin" />
              <p className="text-xs text-muted-foreground mt-1">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    !notification.is_read ? 'bg-accent/50' : ''
                  } ${getNotificationColor(notification.notification_type)}`}
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.notification_type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-xs leading-tight">
                          {notification.title}
                        </h5>
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Marquer lu
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
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

          <div className="text-xs text-muted-foreground text-center">
            {stats.unread > 0 ? (
              <span className="text-red-500">● Déconnecté</span>
            ) : (
              <span className="text-green-500">● Connecté</span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
