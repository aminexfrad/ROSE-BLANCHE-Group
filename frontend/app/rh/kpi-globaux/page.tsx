/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Target,
  Star,
  Building,
  Loader2,
} from "lucide-react"

interface KPIData {
  taux_reussite: number
  satisfaction_moyenne: number
  temps_moyen_stage: number
  taux_abandon: number
  nombre_stagiaires: number
  objectifs: {
    taux_reussite: number
    satisfaction: number
    nombre_stagiaires: number
  }
  evolution: {
    taux_reussite: number
    satisfaction: number
    nombre_stagiaires: number
  }
  performance_par_institut: Array<{
    institut: string
    stagiaires: number
    reussite: number
    satisfaction: number
    abandon: number
  }>
  alertes: Array<{
    type: string
    titre: string
    description: string
    niveau: 'info' | 'warning' | 'error'
    icon?: string
  }>
  points_positifs: Array<{
    titre: string
    description: string
    icon: string
  }>
}

export default function RHKPIG() {
  const breadcrumbs = [{ label: "Responsable RH", href: "/rh" }, { label: "KPI Globaux" }]
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [surveyLoading, setSurveyLoading] = useState(false)
  const { toast } = useToast()

  const fetchKPIData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getRHKPIGlobaux()
      setKpiData(data)
    } catch (err) {
      console.error('Erreur lors du chargement des KPI:', err)
      setError('Impossible de charger les données KPI')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKPIData()
  }, [])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "excellent":
        return "text-green-600 bg-green-100"
      case "bon":
        return "text-red-600 bg-red-100"
      case "attention":
        return "text-yellow-600 bg-yellow-100"
      case "critique":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatut = (valeur: number, objectif: number) => {
    if (valeur >= objectif * 1.1) return "excellent"
    if (valeur >= objectif) return "bon"
    if (valeur >= objectif * 0.9) return "attention"
    return "critique"
  }

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Award, Star, Clock, AlertTriangle, TrendingUp, Users, CheckCircle
    }
    return icons[iconName] || Award
  }

  const handleTriggerSurvey = async () => {
    try {
      setSurveyLoading(true)
      const response = await apiClient.triggerKPISurvey()
      
      toast({
        title: "Succès",
        description: `Sondage KPI déclenché pour ${response.active_stagiaires} stagiaires`,
      })
      
      // Refresh KPI data
      fetchKPIData()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors du déclenchement du sondage",
        variant: "destructive",
      })
    } finally {
      setSurveyLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  if (!kpiData) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <Alert>
          <AlertDescription>Aucune donnée KPI disponible</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  const kpiPrincipaux = [
    {
      titre: "Taux de réussite global",
      valeur: `${kpiData.taux_reussite}%`,
      objectif: `${kpiData.objectifs.taux_reussite}%`,
      evolution: `${kpiData.evolution.taux_reussite > 0 ? '+' : ''}${kpiData.evolution.taux_reussite}%`,
      statut: getStatut(kpiData.taux_reussite, kpiData.objectifs.taux_reussite),
      icon: Award,
    },
    {
      titre: "Satisfaction moyenne",
      valeur: `${kpiData.satisfaction_moyenne}/5`,
      objectif: `${kpiData.objectifs.satisfaction}/5`,
      evolution: `${kpiData.evolution.satisfaction > 0 ? '+' : ''}${kpiData.evolution.satisfaction}`,
      statut: getStatut(kpiData.satisfaction_moyenne, kpiData.objectifs.satisfaction),
      icon: Star,
    },
    {
      titre: "Temps moyen de stage",
      valeur: `${kpiData.temps_moyen_stage} mois`,
      objectif: "3 mois",
      evolution: `${kpiData.temps_moyen_stage - 3 > 0 ? '+' : ''}${(kpiData.temps_moyen_stage - 3).toFixed(1)}`,
      statut: kpiData.temps_moyen_stage <= 3 ? "excellent" : "attention",
      icon: Clock,
    },
    {
      titre: "Taux d'abandon",
      valeur: `${kpiData.taux_abandon}%`,
      objectif: "10%",
      evolution: `${kpiData.taux_abandon - 10 > 0 ? '+' : ''}${kpiData.taux_abandon - 10}%`,
      statut: kpiData.taux_abandon <= 10 ? "excellent" : "critique",
      icon: AlertTriangle,
    },
  ]

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">KPI Globaux</h1>
            <p className="text-gray-600 mt-1">Analysez les performances globales des stages</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleTriggerSurvey}
              disabled={surveyLoading}
            >
              {surveyLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              Déclencher Sondage
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Période
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPI principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiPrincipaux.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{kpi.titre}</CardTitle>
                <kpi.icon className="h-4 w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{kpi.valeur}</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1">
                  <p className="text-xs text-gray-600">Objectif: {kpi.objectif}</p>
                  <Badge className={getStatutColor(kpi.statut)}>{kpi.evolution}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graphiques de performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Évolution mensuelle
              </CardTitle>
              <CardDescription>Tendances des KPI sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taux de réussite</span>
                    <span className="font-medium">{kpiData.taux_reussite}%</span>
                  </div>
                  <Progress value={kpiData.taux_reussite} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Satisfaction</span>
                    <span className="font-medium">{kpiData.satisfaction_moyenne}/5</span>
                  </div>
                  <Progress value={(kpiData.satisfaction_moyenne / 5) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Respect des délais</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Qualité des livrables</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Objectifs vs Réalisé
              </CardTitle>
              <CardDescription>Comparaison avec les objectifs fixés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nombre de stagiaires</h4>
                    <p className="text-sm text-gray-600">Objectif: {kpiData.objectifs.nombre_stagiaires}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{kpiData.nombre_stagiaires}</div>
                    <Badge className="bg-green-100 text-green-800">
                      {kpiData.evolution.nombre_stagiaires > 0 ? '+' : ''}{kpiData.evolution.nombre_stagiaires}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Taux de réussite</h4>
                    <p className="text-sm text-gray-600">Objectif: {kpiData.objectifs.taux_reussite}%</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{kpiData.taux_reussite}%</div>
                    <Badge className="bg-green-100 text-green-800">
                      {kpiData.evolution.taux_reussite > 0 ? '+' : ''}{kpiData.evolution.taux_reussite}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Satisfaction</h4>
                    <p className="text-sm text-gray-600">Objectif: {kpiData.objectifs.satisfaction}/5</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{kpiData.satisfaction_moyenne}</div>
                    <Badge className="bg-green-100 text-green-800">
                      {kpiData.evolution.satisfaction > 0 ? '+' : ''}{kpiData.evolution.satisfaction}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI par institut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-red-600" />
              Performance par institut
            </CardTitle>
            <CardDescription>Comparaison des KPI entre les différents instituts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {kpiData.performance_par_institut.map((institut, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{institut.institut}</h3>
                    <Badge variant="secondary">{institut.stagiaires} stagiaires</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{institut.reussite}%</div>
                      <p className="text-sm text-green-800">Taux de réussite</p>
                    </div>
                                          <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{institut.satisfaction}/5</div>
              <p className="text-sm text-red-800">Satisfaction</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{institut.abandon}%</div>
                      <p className="text-sm text-red-800">Taux d'abandon</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertes et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Alertes KPI
              </CardTitle>
              <CardDescription>Points d'attention nécessitant une action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiData.alertes.map((alerte, index) => {
                  const IconComponent = getIconComponent(alerte.icon || 'Award') // Default to Award if no icon
                  const bgColor = alerte.niveau === 'error' ? 'bg-red-50' : 
                                 alerte.niveau === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                  const textColor = alerte.niveau === 'error' ? 'text-red-600' : 
                                   alerte.niveau === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  const textColorDark = alerte.niveau === 'error' ? 'text-red-900' : 
                                       alerte.niveau === 'warning' ? 'text-yellow-900' : 'text-red-900'
                  const textColorLight = alerte.niveau === 'error' ? 'text-red-700' : 
                                        alerte.niveau === 'warning' ? 'text-yellow-700' : 'text-red-700'
                  
                  return (
                    <div key={index} className={`flex items-center space-x-4 p-3 ${bgColor} rounded-lg`}>
                      <IconComponent className={`h-5 w-5 ${textColor}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${textColorDark}`}>{alerte.titre}</p>
                        <p className={`text-sm ${textColorLight}`}>{alerte.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Points positifs
              </CardTitle>
              <CardDescription>Réussites et bonnes performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiData.points_positifs.map((point, index) => {
                  const IconComponent = getIconComponent(point.icon)
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <IconComponent className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{point.titre}</p>
                        <p className="text-sm text-green-700">{point.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
