/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, User } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, AlertTriangle, Lock, Eye, Ban, CheckCircle, Clock, Loader2, AlertCircle, Activity, Key } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface AuditLog {
  id: string
  user: User
  action: string
  resource: string
  ip_address: string
  user_agent: string
  timestamp: string
  status: "success" | "failed" | "blocked"
}

interface SecurityEvent {
  id: string
  type: "login_attempt" | "permission_denied" | "suspicious_activity" | "data_access"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  user?: User
  ip_address: string
  timestamp: string
  resolved: boolean
}

export default function AdminSecurityPage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Sécurité" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    ipWhitelist: "",
    enableAuditLog: true,
    enableBruteForceProtection: true,
    enableRateLimiting: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUsers()
        setUsers(response.results || [])
        
        // Generate mock audit logs and security events
        const mockAuditLogs: AuditLog[] = users.slice(0, 10).map((user, index) => ({
          id: `log-${index}`,
          user,
          action: ["login", "logout", "data_access", "permission_change"][Math.floor(Math.random() * 4)],
          resource: ["dashboard", "documents", "users", "settings"][Math.floor(Math.random() * 4)],
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          status: ["success", "failed", "blocked"][Math.floor(Math.random() * 3)] as any
        }))
        
        const mockSecurityEvents: SecurityEvent[] = [
          {
            id: "1",
            type: "login_attempt",
            severity: "medium",
            description: "Tentative de connexion échouée depuis une IP suspecte",
            user: users[0],
            ip_address: "203.0.113.45",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            resolved: false
          },
          {
            id: "2",
            type: "permission_denied",
            severity: "low",
            description: "Accès refusé à une ressource protégée",
            user: users[1],
            ip_address: "192.168.1.100",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            resolved: true
          },
          {
            id: "3",
            type: "suspicious_activity",
            severity: "high",
            description: "Activité suspecte détectée sur le compte utilisateur",
            user: users[2],
            ip_address: "198.51.100.23",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            resolved: false
          }
        ]
        
        setAuditLogs(mockAuditLogs)
        setSecurityEvents(mockSecurityEvents)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données de sécurité")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>
      case "blocked":
        return <Badge className="bg-yellow-100 text-yellow-800">Bloqué</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Élevé</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Faible</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login_attempt":
        return <Key className="h-4 w-4 text-blue-600" />
      case "permission_denied":
        return <Ban className="h-4 w-4 text-red-600" />
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "data_access":
        return <Eye className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Compute statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.date_joined).length
  const blockedUsers = users.filter(u => !u.date_joined).length
  const totalSecurityEvents = securityEvents.length
  const unresolvedEvents = securityEvents.filter(e => !e.resolved).length
  const criticalEvents = securityEvents.filter(e => e.severity === "critical").length

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement de la sécurité</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Sécurité & Audit
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Surveillance et gestion de la sécurité</p>
        </div>

        {/* Statistiques de sécurité */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Utilisateurs actifs",
              value: activeUsers.toString(),
              icon: Users,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Utilisateurs bloqués",
              value: blockedUsers.toString(),
              icon: Ban,
              color: "from-red-500 to-red-600",
            },
            {
              title: "Événements de sécurité",
              value: totalSecurityEvents.toString(),
              icon: AlertTriangle,
              color: "from-orange-500 to-orange-600",
            },
            {
              title: "Événements critiques",
              value: criticalEvents.toString(),
              icon: Shield,
              color: "from-purple-500 to-purple-600",
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

        {/* Paramètres de sécurité */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Lock className="h-6 w-6 text-blue-600" />
              Paramètres de sécurité
            </CardTitle>
            <CardDescription>
              Configuration des paramètres de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Authentification</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Authentification à deux facteurs</label>
                      <p className="text-sm text-gray-500">Obligatoire pour tous les utilisateurs</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Protection contre la force brute</label>
                      <p className="text-sm text-gray-500">Bloquer les tentatives répétées</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableBruteForceProtection}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableBruteForceProtection: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Limitation de débit</label>
                      <p className="text-sm text-gray-500">Limiter les requêtes par IP</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableRateLimiting}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableRateLimiting: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de session (secondes)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentatives de connexion max
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration des mots de passe (jours)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Événements de sécurité */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Événements de sécurité
            </CardTitle>
            <CardDescription>
              {unresolvedEvents} événement(s) non résolu(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {securityEvents.length > 0 ? (
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{event.description}</h4>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(event.severity)}
                          {!event.resolved && (
                            <Badge className="bg-red-100 text-red-800">Non résolu</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>IP: {event.ip_address}</span>
                        <span>•</span>
                        <span>{event.user ? `${event.user.prenom} ${event.user.nom}` : "Utilisateur inconnu"}</span>
                        <span>•</span>
                        <span>{format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {!event.resolved && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun événement de sécurité</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Journal d'audit */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Activity className="h-6 w-6 text-purple-600" />
              Journal d'audit
            </CardTitle>
            <CardDescription>
              Activités récentes des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {auditLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {log.user.prenom?.[0]}{log.user.nom?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">{log.user.prenom} {log.user.nom}</div>
                            <div className="text-sm text-gray-500">{log.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {format(new Date(log.timestamp), 'dd/MM HH:mm', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun journal d'audit disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions de sécurité */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-900">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-indigo-600" />
              Actions de sécurité
            </CardTitle>
            <CardDescription>
              Actions rapides pour la sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Gérer les utilisateurs</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Ban className="h-6 w-6" />
                <span>Bloquer IP suspecte</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>Exporter les logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
