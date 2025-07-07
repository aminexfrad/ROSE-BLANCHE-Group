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
import {
  Database,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react"

interface DatabaseStats {
  taille_totale: string
  croissance_mensuelle: string
  connexions_actives: number
  connexions_max: number
  derniere_sauvegarde: string
  statut_sauvegarde: string
  performance: string
  temps_reponse: string
  tables: Array<{
    nom: string
    entrees: number
    taille: string
    croissance: string
    pourcentage_utilisation: number
  }>
  sauvegardes: Array<{
    date: string
    type: string
    taille: string
    statut: string
    duree: string
  }>
  metriques: {
    requetes_par_seconde: number
    temps_reponse_moyen: string
    cache_hit_ratio: number
    connexions_utilisees: number
    connexions_max: number
    espace_libre: string
  }
}

export default function AdminDatabasePage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Base de données" }]
  const [dbData, setDbData] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDatabaseData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAdminDatabaseStats()
      setDbData(data)
    } catch (err) {
      console.error('Erreur lors du chargement des données de la base:', err)
      setError('Impossible de charger les statistiques de la base de données')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDatabaseData()
    setRefreshing(false)
  }

  const handleManualBackup = async () => {
    try {
      await apiClient.postAdminDatabaseBackup()
      // Refresh data after backup
      await fetchDatabaseData()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError('Erreur lors de la création de la sauvegarde')
    }
  }

  useEffect(() => {
    fetchDatabaseData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  if (!dbData) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <Alert>
          <AlertDescription>Aucune donnée de base de données disponible</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion base de données</h1>
            <p className="text-gray-600 mt-1">Maintenance et surveillance de la base de données</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Actualiser
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleManualBackup}>
              <Download className="mr-2 h-4 w-4" />
              Sauvegarde manuelle
            </Button>
          </div>
        </div>

        {/* État de la base de données */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbData.taille_totale}</div>
              <p className="text-xs text-gray-600">{dbData.croissance_mensuelle} ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexions actives</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbData.connexions_actives}</div>
              <p className="text-xs text-gray-600">Max: {dbData.connexions_max}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière sauvegarde</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbData.derniere_sauvegarde}</div>
              <p className="text-xs text-green-600">{dbData.statut_sauvegarde}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbData.performance}</div>
              <p className="text-xs text-gray-600">Temps réponse: {dbData.temps_reponse}</p>
            </CardContent>
          </Card>
        </div>

        {/* Utilisation de l'espace */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-red-600" />
              Utilisation de l'espace
            </CardTitle>
            <CardDescription>Répartition de l'espace disque par table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dbData.tables.map((table, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{table.nom}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{table.entrees.toLocaleString()} entrées</span>
                        <span className="text-sm font-medium">{table.taille}</span>
                        <Badge variant="secondary" className="text-xs">
                          {table.croissance}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={table.pourcentage_utilisation} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sauvegardes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-red-600" />
              Historique des sauvegardes
            </CardTitle>
            <CardDescription>Dernières sauvegardes effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dbData.sauvegardes.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">{backup.date}</h4>
                      <p className="text-sm text-gray-600">
                        {backup.type} • {backup.taille} • {backup.duree}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">{backup.statut}</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions de maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-600" />
                Actions de maintenance
              </CardTitle>
              <CardDescription>Opérations de maintenance de la base de données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Optimiser les tables
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Database className="mr-2 h-4 w-4" />
                  Analyser les index
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Nettoyer les logs anciens
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurer une sauvegarde
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Métriques de performance
              </CardTitle>
              <CardDescription>Indicateurs de performance en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requêtes par seconde</span>
                  <span className="text-sm font-medium">{dbData.metriques.requetes_par_seconde}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Temps de réponse moyen</span>
                  <span className="text-sm font-medium">{dbData.metriques.temps_reponse_moyen}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache hit ratio</span>
                  <span className="text-sm font-medium">{dbData.metriques.cache_hit_ratio}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connexions utilisées</span>
                  <span className="text-sm font-medium">{dbData.metriques.connexions_utilisees}/{dbData.metriques.connexions_max}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Espace libre</span>
                  <span className="text-sm font-medium">{dbData.metriques.espace_libre}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
