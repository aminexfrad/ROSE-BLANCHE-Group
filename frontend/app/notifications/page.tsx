/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, Notification } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Search, Filter, Check, X, Trash2, AlertCircle, Info, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react"

export default function NotificationsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getNotifications()
        setNotifications(response.results || [])
      } catch (err: any) {
        console.error("Error fetching notifications:", err)
        setError(err.message || "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setMarkingAsRead(notificationId)
      await apiClient.markNotificationAsRead(notificationId)
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      )
    } catch (err: any) {
      console.error("Error marking notification as read:", err)
    } finally {
      setMarkingAsRead(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      )
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Notifications</h2>
          <p className="text-gray-600">Please wait while we load your notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      (filter === "read" && notification.is_read) ||
      filter === notification.notification_type

    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All notifications read"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher dans les notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="unread">Non lues</SelectItem>
                  <SelectItem value="read">Lues</SelectItem>
                  <Separator />
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="info">Informations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications ({filteredNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== "all"
                    ? "No notifications match your current filters."
                    : "You're all caught up! No notifications at the moment."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.is_read
                        ? "bg-white opacity-75"
                        : getNotificationColor(notification.notification_type)
                    } ${!notification.is_read ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.notification_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingAsRead === notification.id}
                          >
                            {markingAsRead === notification.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
