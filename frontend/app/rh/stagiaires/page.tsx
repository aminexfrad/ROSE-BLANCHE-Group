"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, User, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react"

interface StagiaireWithStage extends User {
  active_stage?: Stage
  progression: number
  statut: string
  dateDebut: string
  dateFin: string
}

export default function RHStagiairesPage() {
  const { user } = useAuth()
  const [stagiaires, setStagiaires] = useState<StagiaireWithStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    termine: 0,
    alerte: 0
  })

  const breadcrumbs = [{ label: "RH", href: "/rh" }, { label: "Tous les Stagiaires" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stagiairesResponse, stagesResponse, statsResponse] = await Promise.all([
          apiClient.getRHStagiaires(),
          apiClient.getRHStages(),
          apiClient.getDashboardStats()
        ])
        
        // Combine stagiaires with their active stages
        const stagiairesWithStages = (stagiairesResponse.results || []).map((stagiaire: User) => {
          const activeStage = (stagesResponse.results || []).find((stage: Stage) => 
            stage.stagiaire.id === stagiaire.id && stage.status === 'active'
          )
          
          return {
            ...stagiaire,
            active_stage: activeStage,
            progression: activeStage?.progress || 0,
            statut: activeStage ? 'en_cours' : 'termine',
            dateDebut: activeStage?.start_date || '',
            dateFin: activeStage?.end_date || ''
          }
        })
        
        setStagiaires(stagiairesWithStages)
        setStats({
          total: stagiairesResponse.count || 0,
          en_cours: stagiairesWithStages.filter(s => s.statut === 'en_cours').length,
          termine: stagiairesWithStages.filter(s => s.statut === 'termine').length,
          alerte: stagiairesWithStages.filter(s => s.progression < 30).length
        })
      } catch (err: any) {
        console.error('Error fetching stagiaires:', err)
        setError(err.message || 'Failed to load stagiaires')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatutBadge = (statut: string) => {
    const colors = {
      en_cours: "bg-blue-100 text-blue-800",
      termine: "bg-green-100 text-green-800",
      alerte: "bg-red-100 text-red-800",
      suspendu: "bg-yellow-100 text-yellow-800",
    }
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "en_cours":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "termine":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "alerte":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressionColor = (progression: number) => {
    if (progression >= 80) return "text-green-600"
    if (progression >= 50) return "text-blue-600"
    if (progression >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tous les stagiaires</h1>
            <p className="text-gray-600 mt-1">Gérez et supervisez tous les stagiaires</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <Users className="mr-2 h-4 w-4" />
              Ajouter stagiaire
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total stagiaires</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600">+12 ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.en_cours}</div>
              <p className="text-xs text-gray-600">{stats.total > 0 ? Math.round((stats.en_cours / stats.total) * 100) : 0}% du total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.termine}</div>
              <p className="text-xs text-green-600">{stats.total > 0 ? Math.round((stats.termine / stats.total) * 100) : 0}% du total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alerte}</div>
              <p className="text-xs text-red-600">Nécessitent attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Rechercher par nom, email, institut..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par statut
              </Button>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Filtrer par institut
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Filtrer par période
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table des stagiaires */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des stagiaires</CardTitle>
            <CardDescription>Vue d'ensemble de tous les stagiaires avec leur progression</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stagiaire</TableHead>
                  <TableHead>Institut</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Tuteur</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stagiaires.map((stagiaire) => (
                  <TableRow key={stagiaire.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {stagiaire.prenom || ''} {stagiaire.nom || ''}
                        </div>
                        <div className="text-sm text-gray-600">{stagiaire.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {stagiaire.institut || ''}
                      </div>
                    </TableCell>
                    <TableCell>{stagiaire.specialite || ''}</TableCell>
                    <TableCell>
                      {stagiaire.active_stage?.tuteur ? 
                        `${stagiaire.active_stage.tuteur.prenom || ''} ${stagiaire.active_stage.tuteur.nom || ''}` : 
                        'Non assigné'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${stagiaire.progression}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getProgressionColor(stagiaire.progression)}`}>
                          {stagiaire.progression}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatutIcon(stagiaire.statut)}
                        <Badge className={getStatutBadge(stagiaire.statut)}>{stagiaire.statut.replace("_", " ")}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{stagiaire.dateDebut ? new Date(stagiaire.dateDebut).toLocaleDateString() : '-'}</div>
                        <div className="text-gray-500">au {stagiaire.dateFin ? new Date(stagiaire.dateFin).toLocaleDateString() : '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Valider étape
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Exporter profil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
