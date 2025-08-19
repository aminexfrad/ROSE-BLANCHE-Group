/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  FileText,
  TrendingUp,
  Award,
  Target,
  Upload,
  Star,
  Activity,
  AlertCircle,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient, Stage, Step, Evaluation } from "@/lib/api"

interface DashboardStats {
  total_interns: number
  active_interns: number
  completed_interns: number
  avg_progress: number
  pending_evaluations: number
  recent_activities: number
}

export default function TuteurDashboard() {
  const { user } = useAuth()
  const [internships, setInternships] = useState<Stage[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [interviewRequestsCount, setInterviewRequestsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [internshipsResponse, statsResponse, interviewReqs] = await Promise.all([
          apiClient.getTuteurStages(),
          apiClient.getTuteurStatistics(),
          apiClient.getTuteurInterviewRequests().catch(() => ({ count: 0 }))
        ])
        
        setInternships(internshipsResponse.results || [])
        setStats({
          total_interns: statsResponse.total_stages || 0,
          active_interns: statsResponse.active_stages || 0,
          completed_interns: statsResponse.completed_stages || 0,
          avg_progress: statsResponse.avg_progress || 0,
          pending_evaluations: statsResponse.pending_evaluations || 0,
          recent_activities: 0, // Not available in tuteur stats
        })
        setInterviewRequestsCount(interviewReqs.count || 0)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-red-100 text-red-800'
      case 'validated':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    if (progress >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // Role badge color mapping
  const roleInfo = {
    rh: { label: "Responsable RH", color: "bg-gradient-to-r from-orange-500 to-red-600 text-white" },
    stagiaire: { label: "Stagiaire", color: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white" },
    tuteur: { label: "Tuteur", color: "bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
    admin: { label: "Administrateur", color: "bg-gradient-to-r from-purple-500 to-pink-600 text-white" },
  }[user?.role || "tuteur"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

  const breadcrumbs = [{ label: "Tableau de bord Tuteur" }]

  const quickActions = [
    {
      title: "Mes Stagiaires",
      description: "Gérez et suivez tous vos stagiaires",
      icon: Users,
      href: "/tuteur/stagiaires",
      badge: internships.length.toString(),
    },
    {
      title: "Demandes d'entretien",
      description: "Confirmez votre disponibilité pour les entretiens",
      icon: Calendar,
      href: "/tuteur/evaluations", // Placeholder, dedicated page can be added
      badge: interviewRequestsCount > 0 ? interviewRequestsCount.toString() : null,
    },
    {
      title: "Évaluations",
      description: "Validez les étapes et évaluez les livrables",
      icon: FileText,
      href: "/tuteur/evaluations",
      badge: "5",
    },
    {
      title: "Statistiques",
      description: "Analysez les performances et l'évolution",
      icon: BarChart3,
      href: "/tuteur/statistiques",
      badge: null,
    },
  ]

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bon retour, {user?.prenom} !</h1>
            <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Planning and Messages buttons removed */}
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stagiaires</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_interns}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_interns} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stages Actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_interns}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed_interns} terminés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg_progress}%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% vs semaine dernière
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Évaluations en Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_evaluations}</div>
                <p className="text-xs text-muted-foreground">
                  À traiter rapidement
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base sm:text-lg">{action.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full">
                    Accéder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Stagiaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mes Stagiaires
            </CardTitle>
            <CardDescription>Suivi des stages en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {internships.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun stagiaire</h3>
                <p className="text-gray-600">Vous n'avez pas de stagiaires assignés pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {internships.map((internship) => (
                  <div key={internship.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={internship.stagiaire?.avatar || undefined} />
                        <AvatarFallback>
                          {(internship.stagiaire?.prenom?.charAt(0) || '')}{(internship.stagiaire?.nom?.charAt(0) || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold truncate">
                          {internship.stagiaire?.prenom || ''} {internship.stagiaire?.nom || ''}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">{internship.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {internship.company} • {internship.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-right sm:text-left">
                        <div className={`font-medium ${getProgressColor(internship.progress ?? 0)}`}>
                          {internship.progress ?? 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(internship.start_date).toLocaleDateString()} - {new Date(internship.end_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/tuteur/stagiaires/${internship.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/tuteur/evaluations/${internship.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {internships.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/tuteur/stagiaires">
                      <Button variant="outline">
                        Voir tous mes stagiaires
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activités récentes
            </CardTitle>
            <CardDescription>Dernières actions et mises à jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {internships.slice(0, 3).map((internship) => (
                <div key={internship.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-red-100 rounded-full">
                                          <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      Nouveau document de {internship.stagiaire?.prenom || ''} {internship.stagiaire?.nom || ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      Rapport de progression téléversé
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Il y a 2h
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  Voir toutes les activités
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Aperçu des performances
            </CardTitle>
            <CardDescription>Statistiques de vos stagiaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-1">Taux de réussite</h4>
                <p className="text-2xl font-bold text-green-700">95%</p>
                <p className="text-xs text-green-600">Stages validés</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-900 mb-1">Progression moyenne</h4>
                <p className="text-2xl font-bold text-red-700">{stats?.avg_progress || 0}%</p>
                <p className="text-xs text-red-600">Tous stagiaires confondus</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900 mb-1">Satisfaction</h4>
                <p className="text-2xl font-bold text-purple-700">4.8/5</p>
                <p className="text-xs text-purple-600">Évaluations stagiaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
