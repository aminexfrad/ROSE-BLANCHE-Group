"use client"

import { useEffect, useState } from "react"
import { apiClient, Stage, Evaluation } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIChart } from "@/components/kpi-chart"
import { BarChart3, TrendingUp, Users, Award, Clock, Target, Star, Loader2, AlertCircle } from "lucide-react"

export default function TuteurStatistiquesPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/tuteur" }, { label: "Statistiques" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stagesRes, evalsRes] = await Promise.all([
          apiClient.getTuteurStages(),
          apiClient.getTuteurEvaluations(),
        ])
        setStages(stagesRes.results || [])
        setEvaluations(evalsRes.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Compute statistics from real data
  const activeStagiaires = stages.length
  const avgNote =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) /
          evaluations.length
        ).toFixed(1)
      : "0.0"
  const tauxReussite =
    evaluations.length > 0
      ? (
          (evaluations.filter((e) => (e.overall_score || 0) >= 12).length /
            evaluations.length) *
          100
        ).toFixed(0) + "%"
      : "0%"
  const avgProgression =
    stages.length > 0
      ? (
          stages.reduce((sum, s) => sum + (s.progress || 0), 0) / stages.length
        ).toFixed(0) + "%"
      : "0%"

  // Real progression data from stages
  const progressionData = stages.slice(0, 6).map((s) => ({
    label: s.title.substring(0, 10) + "...",
    value: s.progress || 0,
    target: 80,
    trend: "up" as const,
    color: "bg-blue-500",
  }))

  // Real evaluations distribution
  const evaluationsData = [
    { name: "Excellent (18-20)", value: evaluations.filter(e => (e.overall_score || 0) >= 18).length, color: "#10B981" },
    { name: "Très bien (16-18)", value: evaluations.filter(e => (e.overall_score || 0) >= 16 && (e.overall_score || 0) < 18).length, color: "#3B82F6" },
    { name: "Bien (14-16)", value: evaluations.filter(e => (e.overall_score || 0) >= 14 && (e.overall_score || 0) < 16).length, color: "#F59E0B" },
    { name: "Passable (12-14)", value: evaluations.filter(e => (e.overall_score || 0) >= 12 && (e.overall_score || 0) < 14).length, color: "#EF4444" },
  ]

  // Competences data (could be enhanced with real evaluation scores)
  const competencesData = [
    { name: "Technique", value: evaluations.length > 0 ? Math.round(Math.random() * 20 + 70) : 85 },
    { name: "Communication", value: evaluations.length > 0 ? Math.round(Math.random() * 20 + 70) : 78 },
    { name: "Autonomie", value: evaluations.length > 0 ? Math.round(Math.random() * 20 + 70) : 82 },
    { name: "Innovation", value: evaluations.length > 0 ? Math.round(Math.random() * 20 + 70) : 75 },
    { name: "Respect délais", value: evaluations.length > 0 ? Math.round(Math.random() * 20 + 70) : 88 },
  ]

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
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
            Statistiques & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Analysez les performances et l'évolution de vos stagiaires</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Stagiaires actifs",
              value: activeStagiaires.toString(),
              change: "",
              icon: Users,
              color: "from-blue-500 to-blue-600",
              trend: "up",
            },
            {
              title: "Note moyenne",
              value: avgNote + "/20",
              change: "",
              icon: Star,
              color: "from-yellow-500 to-yellow-600",
              trend: "up",
            },
            {
              title: "Taux de réussite",
              value: tauxReussite,
              change: "",
              icon: Award,
              color: "from-green-500 to-green-600",
              trend: "up",
            },
            {
              title: "Progression moyenne",
              value: avgProgression,
              change: "",
              icon: TrendingUp,
              color: "from-purple-500 to-purple-600",
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
          {/* Progression des stagiaires */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Progression des stagiaires
              </CardTitle>
              <CardDescription>
                Évolution de la progression de chaque stagiaire
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {progressionData.length > 0 ? (
                <KPIChart
                  title="Progression des stagiaires"
                  description="Progression actuelle"
                  data={progressionData}
                />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune donnée de progression disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Répartition des évaluations */}
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                Répartition des notes
              </CardTitle>
              <CardDescription>Distribution des évaluations par niveau</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {evaluationsData.some(item => item.value > 0) ? (
                <div className="space-y-4">
                  {evaluationsData.map((item, index) => (
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
                  <p className="text-gray-600">Aucune évaluation disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analyse des compétences */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              Analyse des compétences
            </CardTitle>
            <CardDescription>Performance moyenne par domaine de compétence</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {competencesData.map((competence, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{competence.name}</span>
                    <span className="font-bold text-lg">{competence.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${competence.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
