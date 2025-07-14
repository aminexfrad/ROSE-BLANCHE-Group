/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, User, Demande, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIChart } from "@/components/kpi-chart"
import { BarChart3, TrendingUp, Users, Award, Clock, Target, Star, Loader2, AlertCircle, Shield, UserCheck, UserX } from "lucide-react"

export default function AdminStatistiquesPage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Statistiques" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [stages, setStages] = useState<Stage[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersRes, demandesRes, stagesRes] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getDemandes(),
          apiClient.getStages(),
        ])
        setUsers(usersRes.results || [])
        setDemandes(demandesRes.results || [])
        setStages(stagesRes.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Compute real statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.date_joined).length
  const adminUsers = users.filter(u => u.role === "admin").length
  const rhUsers = users.filter(u => u.role === "rh").length
  const tuteurUsers = users.filter(u => u.role === "tuteur").length
  const stagiaireUsers = users.filter(u => u.role === "stagiaire").length

  const totalDemandes = demandes.length
  const demandesAcceptees = demandes.filter(d => d.status === "accepted").length
  const demandesEnAttente = demandes.filter(d => d.status === "pending").length
  const demandesRejetees = demandes.filter(d => d.status === "rejected").length
  const tauxAcceptation = totalDemandes > 0 ? ((demandesAcceptees / totalDemandes) * 100).toFixed(1) : "0"

  const totalStages = stages.length
  const stagesActifs = stages.filter(s => s.status === "active").length
  const stagesTermines = stages.filter(s => s.status === "completed").length
  const tauxReussite = totalStages > 0 ? ((stagesTermines / totalStages) * 100).toFixed(1) : "0"

  // Real user distribution data
  const userDistribution = [
    { name: "Administrateurs", value: adminUsers, color: "#EF4444" },
    { name: "RH", value: rhUsers, color: "#3B82F6" },
    { name: "Tuteurs", value: tuteurUsers, color: "#10B981" },
    { name: "Stagiaires", value: stagiaireUsers, color: "#8B5CF6" },
  ]

  // Real demandes evolution data
  const demandesEvolution = demandes.slice(0, 6).map((d, index) => ({
    label: `Demande ${index + 1}`,
    value: d.status === "accepted" ? 100 : d.status === "rejected" ? 0 : 50,
    target: 80,
    trend: d.status === "accepted" ? "up" as const : "down" as const,
    color: d.status === "accepted" ? "bg-green-500" : d.status === "rejected" ? "bg-red-500" : "bg-yellow-500",
  }))

  // Real stages progression data
  const stagesProgression = stages.slice(0, 6).map((s) => ({
    label: s.title.substring(0, 10) + "...",
    value: s.progress || 0,
    target: 80,
    trend: "up" as const,
    color: "bg-blue-500",
  }))

  // Real monthly trends (based on creation dates)
  const monthlyUserTrends = users.reduce((acc, u) => {
    const month = new Date(u.date_joined).toLocaleDateString('fr-FR', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyUserData = Object.entries(monthlyUserTrends).map(([month, count]) => ({
    name: month,
    value: count,
  }))

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des statistiques</h2>
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
            Statistiques Administratives
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Vue d'ensemble complète de la plateforme</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total utilisateurs",
              value: totalUsers.toString(),
              change: "",
              icon: Users,
              color: "from-blue-500 to-blue-600",
              trend: "up",
            },
            {
              title: "Demandes totales",
              value: totalDemandes.toString(),
              change: "",
              icon: Award,
              color: "from-green-500 to-green-600",
              trend: "up",
            },
            {
              title: "Stages actifs",
              value: stagesActifs.toString(),
              change: "",
              icon: Target,
              color: "from-purple-500 to-purple-600",
              trend: "up",
            },
            {
              title: "Taux de réussite",
              value: tauxReussite + "%",
              change: "",
              icon: Star,
              color: "from-yellow-500 to-yellow-600",
              trend: "up",
            },
          ].map((kpi, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${kpi.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 2) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <kpi.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{kpi.value}</div>
                    <div className="text-sm opacity-90 flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4 rotate-180" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{kpi.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Répartition des utilisateurs */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                Répartition des utilisateurs
              </CardTitle>
              <CardDescription>
                Distribution par type de compte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {userDistribution.some(item => item.value > 0) ? (
                <div className="space-y-4">
                  {userDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun utilisateur disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Évolution des demandes */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
                Évolution des demandes
              </CardTitle>
              <CardDescription>Statut des demandes de stage</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {demandesEvolution.length > 0 ? (
                <KPIChart
                  title="Évolution des demandes"
                  description="Statut des demandes"
                  data={demandesEvolution}
                />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune donnée de demande disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progression des stages */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Target className="h-6 w-6 text-purple-600" />
                Progression des stages
              </CardTitle>
              <CardDescription>Progression actuelle des stages en cours</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {stagesProgression.length > 0 ? (
                <KPIChart
                  title="Progression des stages"
                  description="Progression actuelle"
                  data={stagesProgression}
                />
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun stage en cours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tendances mensuelles utilisateurs */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-900">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
                Inscriptions mensuelles
              </CardTitle>
              <CardDescription>Évolution des inscriptions par mois</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {monthlyUserData.length > 0 ? (
                <div className="space-y-4">
                  {monthlyUserData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((item.value / Math.max(...monthlyUserData.map(d => d.value))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-sm">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune donnée de tendance disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-1000">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-indigo-600" />
              Statistiques détaillées
            </CardTitle>
            <CardDescription>Métriques complètes de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{activeUsers}</div>
                <div className="text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{demandesAcceptees}</div>
                <div className="text-sm text-gray-600">Demandes acceptées</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-600">{stagesTermines}</div>
                <div className="text-sm text-gray-600">Stages terminés</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">{tauxAcceptation}%</div>
                <div className="text-sm text-gray-600">Taux d'acceptation</div>
              </div>
            </div>

            {/* Répartition par rôle */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Répartition par rôle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
                  <div className="text-sm text-gray-600">Administrateurs</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{rhUsers}</div>
                  <div className="text-sm text-gray-600">RH</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{tuteurUsers}</div>
                  <div className="text-sm text-gray-600">Tuteurs</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <UserX className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{stagiaireUsers}</div>
                  <div className="text-sm text-gray-600">Stagiaires</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
