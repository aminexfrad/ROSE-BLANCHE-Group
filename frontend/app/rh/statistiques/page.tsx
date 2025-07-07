"use client"

import { useEffect, useState } from "react"
import { apiClient, Demande, Stage, Stagiaire } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIChart } from "@/components/kpi-chart"
import { BarChart3, TrendingUp, Users, Award, Clock, Target, Star, Loader2, AlertCircle, FileText, CheckCircle, XCircle } from "lucide-react"

export default function RHStatistiquesPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/rh" }, { label: "Statistiques" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [demandesRes, stagesRes, stagiairesRes] = await Promise.all([
          apiClient.getDemandes(),
          apiClient.getStages(),
          apiClient.getStagiaires(),
        ])
        setDemandes(demandesRes.results || [])
        setStages(stagesRes.results || [])
        setStagiaires(stagiairesRes.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Compute real statistics
  const totalDemandes = demandes.length
  const demandesAcceptees = demandes.filter(d => d.status === "accepted").length
  const demandesEnAttente = demandes.filter(d => d.status === "pending").length
  const demandesRejetees = demandes.filter(d => d.status === "rejected").length
  const tauxAcceptation = totalDemandes > 0 ? ((demandesAcceptees / totalDemandes) * 100).toFixed(1) + "%" : "0%"
  
  const stagesActifs = stages.filter(s => s.status === "active").length
  const stagesTermines = stages.filter(s => s.status === "completed").length
  const tauxReussite = stages.length > 0 ? ((stagesTermines / stages.length) * 100).toFixed(1) + "%" : "0%"
  
  const stagiairesActifs = stages.filter(s => s.status === "active").length
  const stagiairesTermines = stages.filter(s => s.status === "completed").length

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

  // Real status distribution
  const statusDistribution = [
    { name: "Acceptées", value: demandesAcceptees, color: "#10B981" },
    { name: "En attente", value: demandesEnAttente, color: "#F59E0B" },
    { name: "Rejetées", value: demandesRejetees, color: "#EF4444" },
  ]

  // Real monthly trends (based on creation dates)
  const monthlyTrends = demandes.reduce((acc, d) => {
    const month = new Date(d.created_at).toLocaleDateString('fr-FR', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyData = Object.entries(monthlyTrends).map(([month, count]) => ({
    name: month,
    value: count,
  }))

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
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
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Statistiques RH
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Analysez les performances et l'évolution des stages</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total demandes",
              value: totalDemandes.toString(),
              change: "",
              icon: FileText,
              color: "from-blue-500 to-blue-600",
              trend: "up",
            },
            {
              title: "Taux d'acceptation",
              value: tauxAcceptation,
              change: "",
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
              trend: "up",
            },
            {
              title: "Stages actifs",
              value: stagesActifs.toString(),
              change: "",
              icon: Users,
              color: "from-purple-500 to-purple-600",
              trend: "up",
            },
            {
              title: "Taux de réussite",
              value: tauxReussite,
              change: "",
              icon: Award,
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
          {/* Évolution des demandes */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Évolution des demandes
              </CardTitle>
              <CardDescription>
                Statut des demandes de stage
              </CardDescription>
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

          {/* Répartition des statuts */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                Répartition des statuts
              </CardTitle>
              <CardDescription>Distribution des demandes par statut</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {statusDistribution.some(item => item.value > 0) ? (
                <div className="space-y-4">
                  {statusDistribution.map((item, index) => (
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
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune demande disponible</p>
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

          {/* Tendances mensuelles */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-900">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
                Tendances mensuelles
              </CardTitle>
              <CardDescription>Évolution des demandes par mois</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {monthlyData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((item.value / Math.max(...monthlyData.map(d => d.value))) * 100, 100)}%` }}
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
              <Star className="h-6 w-6 text-indigo-600" />
              Statistiques détaillées
            </CardTitle>
            <CardDescription>Vue d'ensemble complète des métriques RH</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{stagiairesActifs}</div>
                <div className="text-sm text-gray-600">Stagiaires actifs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{stagiairesTermines}</div>
                <div className="text-sm text-gray-600">Stages terminés</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-600">{demandesEnAttente}</div>
                <div className="text-sm text-gray-600">Demandes en attente</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">{demandesRejetees}</div>
                <div className="text-sm text-gray-600">Demandes rejetées</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
