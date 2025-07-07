"use client"

import { useEffect, useState } from "react"
import { apiClient, Notification, User } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Search, Plus, Users, Clock, Loader2, AlertCircle, Bell, Mail } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Message {
  id: string
  content: string
  sender: User
  receiver: User
  timestamp: string
  isRead: boolean
}

export default function TuteurMessagesPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/tuteur" }, { label: "Messages" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getTuteurNotifications()
        setNotifications(response.results || [])
        
        // Generate mock messages from notifications for demo
        const mockMessages: Message[] = notifications.slice(0, 10).map((notif, index) => ({
          id: `msg-${index}`,
          content: notif.message,
          sender: { id: index % 2 === 0 ? 1 : 2, email: "stagiaire@example.com", nom: "Stagiaire", prenom: "Test", role: "stagiaire" as const, date_joined: new Date().toISOString() },
          receiver: { id: 1, email: "tuteur@example.com", nom: "Tuteur", prenom: "Test", role: "tuteur" as const, date_joined: new Date().toISOString() },
          timestamp: notif.created_at,
          isRead: notif.is_read
        }))
        setMessages(mockMessages)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des messages")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Bell className="h-4 w-4 text-green-600" />
      case "warning":
        return <Bell className="h-4 w-4 text-yellow-600" />
      case "error":
        return <Bell className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
    }
  }

  // Filter messages based on search
  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique conversations
  const conversations = Array.from(new Set(messages.map(m => m.sender.id))).map(senderId => {
    const sender = messages.find(m => m.sender.id === senderId)?.sender
    const lastMessage = messages.filter(m => m.sender.id === senderId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]
    return { senderId, sender, lastMessage }
  })

  // Compute statistics
  const totalMessages = messages.length
  const unreadMessages = messages.filter(m => !m.isRead).length
  const totalNotifications = notifications.length
  const unreadNotifications = notifications.filter(n => !n.is_read).length

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: { id: 1, email: "tuteur@example.com", nom: "Tuteur", prenom: "Test", role: "tuteur" as const, date_joined: new Date().toISOString() },
      receiver: { id: parseInt(selectedConversation), email: "stagiaire@example.com", nom: "Stagiaire", prenom: "Test", role: "stagiaire" as const, date_joined: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    setMessages(prev => [...prev, newMsg])
    setNewMessage("")
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des messages</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Messages & Communication
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Communiquez avec vos stagiaires</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total messages",
              value: totalMessages.toString(),
              icon: MessageSquare,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Non lus",
              value: unreadMessages.toString(),
              icon: Mail,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              title: "Notifications",
              value: totalNotifications.toString(),
              icon: Bell,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Conversations",
              value: conversations.length.toString(),
              icon: Users,
              color: "from-green-500 to-green-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 2) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{stat.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  Conversations
                </CardTitle>
                <CardDescription>
                  {conversations.length} conversation(s) active(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.senderId}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedConversation === conv.senderId.toString()
                          ? "bg-blue-100 border-blue-300"
                          : "bg-white hover:bg-gray-50 border border-gray-200"
                      }`}
                      onClick={() => setSelectedConversation(conv.senderId.toString())}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.sender?.avatar} />
                          <AvatarFallback>
                            {conv.sender?.prenom?.[0]}{conv.sender?.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conv.sender?.prenom} {conv.sender?.nom}
                            </h4>
                            {conv.lastMessage && !conv.lastMessage.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-500 truncate">
                              {conv.lastMessage.content.substring(0, 30)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone de chat */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                  {selectedConversation ? (
                    `Conversation avec ${conversations.find(c => c.senderId.toString() === selectedConversation)?.sender?.prenom}`
                  ) : (
                    "Sélectionnez une conversation"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
                      {messages
                        .filter(m => m.sender.id.toString() === selectedConversation || m.receiver.id.toString() === selectedConversation)
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender.id === 1 ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              message.sender.id === 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender.id === 1 ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Input pour nouveau message */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1"
                        rows={2}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez un stagiaire pour commencer à discuter
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notifications récentes */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Bell className="h-6 w-6 text-purple-600" />
              Notifications récentes
            </CardTitle>
            <CardDescription>
              Dernières notifications reçues
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {getNotificationBadge(notification.notification_type)}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune notification récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
