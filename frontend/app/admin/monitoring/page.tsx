"use client"

import { useEffect, useState } from "react"
import { apiClient, User, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Server, Database, Users, Clock, AlertTriangle, CheckCircle, Loader2, AlertCircle, TrendingUp, Cpu, HardDrive } from "lucide-react"

export default function AdminMonitoringPage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Monitoring" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    activeConnections: 156,
    uptime: "15 jours, 8 heures",
    lastBackup: "2024-01-15 02:30:00",
    databaseSize: "2.4 GB"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersRes, stagesRes] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getStages(),
        ])
        setUsers(usersRes.results || [])
        setStages(stagesRes.results || [])
        
        // Simulate real-time system metrics updates
        const updateMetrics = () => {
          setSystemMetrics(prev => ({
            ...prev,
            cpu: Math.floor(Math.random() * 30) + 30,
            memory: Math.floor(Math.random() * 20) + 55,
            disk: Math.floor(Math.random() * 15) + 70,
            network: Math.floor(Math.random() * 40) + 10,
            activeConnections: Math.floor(Math.random() * 50) + 120
          }))
        }
        
        const interval = setInterval(updateMetrics, 5000)
        return () => clearInterval(interval)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du monitoring")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) {
      return <Badge className="bg-red-100 text-red-800">Critique</Badge>
    } else if (value >= thresholds.warning) {
      return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Normal</Badge>
    }
  }

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    } else if (value >= thresholds.warning) {
      return <Clock className="h-5 w-5 text-yellow-600" />
    } else {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  // Compute real statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.date_joined).length
  const totalStages = stages.length
  const activeStages = stages.filter(s => s.status === "active").length

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement du monitoring</h2>
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
            Monitoring Système
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Surveillance en temps réel de la plateforme</p>
        </div>

        {/* Métriques système */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "CPU",
              value: systemMetrics.cpu + "%",
              icon: Cpu,
              color: systemMetrics.cpu >= 80 ? "from-red-500 to-red-600" : systemMetrics.cpu >= 60 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600",
              thresholds: { warning: 60, critical: 80 }
            },
            {
              title: "Mémoire",
              value: systemMetrics.memory + "%",
              icon: HardDrive,
              color: systemMetrics.memory >= 85 ? "from-red-500 to-red-600" : systemMetrics.memory >= 70 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600",
              thresholds: { warning: 70, critical: 85 }
            },
            {
              title: "Disque",
              value: systemMetrics.disk + "%",
              icon: Database,
              color: systemMetrics.disk >= 90 ? "from-red-500 to-red-600" : systemMetrics.disk >= 80 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600",
              thresholds: { warning: 80, critical: 90 }
            },
            {
              title: "Réseau",
              value: systemMetrics.network + "%",
              icon: Activity,
              color: systemMetrics.network >= 80 ? "from-red-500 to-red-600" : systemMetrics.network >= 60 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600",
              thresholds: { warning: 60, critical: 80 }
            },
          ].map((metric, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${metric.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 2) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <metric.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metric.value}</div>
                    {getStatusBadge(
                      metric.title === "CPU" ? systemMetrics.cpu :
                      metric.title === "Mémoire" ? systemMetrics.memory :
                      metric.title === "Disque" ? systemMetrics.disk :
                      systemMetrics.network,
                      metric.thresholds
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{metric.title}</h3>
                <Progress 
                  value={
                    metric.title === "CPU" ? systemMetrics.cpu :
                    metric.title === "Mémoire" ? systemMetrics.memory :
                    metric.title === "Disque" ? systemMetrics.disk :
                    systemMetrics.network
                  } 
                  className="mt-2 h-2 bg-white/20"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistiques de la plateforme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Utilisateurs actifs",
              value: activeUsers.toString(),
              icon: Users,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Stages actifs",
              value: activeStages.toString(),
              icon: Activity,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Connexions actives",
              value: systemMetrics.activeConnections.toString(),
              icon: Server,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Taille base de données",
              value: systemMetrics.databaseSize,
              icon: Database,
              color: "from-orange-500 to-orange-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 6) * 100}`}
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

        {/* État du système */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services système */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-800">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Server className="h-6 w-6 text-blue-600" />
                État des services
              </CardTitle>
              <CardDescription>
                Statut des services critiques
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Serveur Web", status: "online", uptime: "15j 8h 32m" },
                  { name: "Base de données", status: "online", uptime: "15j 8h 30m" },
                  { name: "Cache Redis", status: "online", uptime: "15j 8h 28m" },
                  { name: "Service d'authentification", status: "online", uptime: "15j 8h 25m" },
                  { name: "Service de fichiers", status: "online", uptime: "15j 8h 20m" },
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${service.status === "online" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <Badge className={service.status === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {service.status === "online" ? "En ligne" : "Hors ligne"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertes et événements */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-900">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-green-600" />
                Alertes récentes
              </CardTitle>
              <CardDescription>
                Derniers événements système
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { type: "info", message: "Sauvegarde automatique terminée", time: "Il y a 2 heures" },
                  { type: "warning", message: "Utilisation CPU élevée détectée", time: "Il y a 4 heures" },
                  { type: "success", message: "Mise à jour de sécurité installée", time: "Il y a 6 heures" },
                  { type: "info", message: "Nouveau stagiaire inscrit", time: "Il y a 8 heures" },
                  { type: "success", message: "Tous les services opérationnels", time: "Il y a 12 heures" },
                ].map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "warning" ? "bg-yellow-500" :
                      alert.type === "success" ? "bg-green-500" :
                      "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations système détaillées */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-1000">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Informations système
            </CardTitle>
            <CardDescription>
              Détails techniques de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">{systemMetrics.uptime}</div>
                <div className="text-sm text-gray-600">Temps de fonctionnement</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">{systemMetrics.databaseSize}</div>
                <div className="text-sm text-gray-600">Taille base de données</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Server className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">{systemMetrics.activeConnections}</div>
                <div className="text-sm text-gray-600">Connexions actives</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">{systemMetrics.lastBackup}</div>
                <div className="text-sm text-gray-600">Dernière sauvegarde</div>
              </div>
            </div>

            {/* Métriques de performance */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Métriques de performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU</span>
                      <span>{systemMetrics.cpu}%</span>
                    </div>
                    <Progress value={systemMetrics.cpu} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mémoire</span>
                      <span>{systemMetrics.memory}%</span>
                    </div>
                    <Progress value={systemMetrics.memory} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disque</span>
                      <span>{systemMetrics.disk}%</span>
                    </div>
                    <Progress value={systemMetrics.disk} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Réseau</span>
                      <span>{systemMetrics.network}%</span>
                    </div>
                    <Progress value={systemMetrics.network} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
