"use client"

import { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Filter,
  Download,
  Upload,
  Calendar,
  Award,
  AlertCircle,
  MapPin,
  User,
  BookOpen,
  Target,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, User as UserType, Application, DashboardStats } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StagiaireData extends UserType {
  active_stage?: {
    id: number;
    title: string;
    company: string;
    progress: number;
    start_date: string;
    end_date: string;
    tuteur?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export default function RHDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [stagiaires, setStagiaires] = useState<StagiaireData[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const breadcrumbs = [{ label: "Tableau de bord RH" }]

  const quickActions = [
    {
      title: "Tous les Stagiaires",
      description: "Gérez et supervisez tous les stagiaires",
      icon: Users,
      href: "/rh/stagiaires",
      badge: stagiaires.length.toString(),
    },
    {
      title: "KPI Globaux",
      description: "Analysez les performances globales",
      icon: TrendingUp,
      href: "/rh/kpi-globaux",
      badge: "Urgent",
    },
    {
      title: "Statistiques",
      description: "Rapports détaillés et analyses",
      icon: BarChart3,
      href: "/rh/statistiques",
      badge: null,
    },
    {
      title: "Témoignages",
      description: "Validez et modérez les témoignages",
      icon: MessageSquare,
      href: "/rh/temoignages",
      badge: "3",
    },
  ]

  const additionalActions = [
    {
      title: "Demandes de stage",
      description: "Nouvelles candidatures reçues",
      icon: FileText,
      href: "/rh/demandes",
      badge: applications.filter(app => app.status === 'pending').length.toString(),
    },
    {
      title: "Rapports",
      description: "Génération et export de rapports",
      icon: Upload,
      href: "/rh/rapports",
      badge: null,
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [applicationsResponse, stagiairesResponse, statsResponse] = await Promise.all([
          apiClient.getApplications({ limit: 5 }),
          apiClient.getRHStagiaires(),
          apiClient.getDashboardStats()
        ])
        
        setApplications(applicationsResponse.results || []);
        setStagiaires(stagiairesResponse.results || []);
        setStats(statsResponse.stats);
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
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
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

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bon retour, {user?.prenom} !</h1>
            <p className="text-gray-600">Vue d'ensemble de la gestion des stages</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Rapports
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stagiaires</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_stages}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recent_applications} nouveaux ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stages Actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_stages}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed_stages} terminés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg_progression}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% vs mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.filter(app => app.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">
                  À traiter rapidement
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-8 w-8 text-blue-600" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">
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

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-8 w-8 text-green-600" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">
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

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Demandes récentes
            </CardTitle>
            <CardDescription>Nouvelles candidatures à traiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(application.prenom?.charAt(0) || '')}{(application.nom?.charAt(0) || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{application.prenom || ''} {application.nom || ''}</div>
                      <div className="text-sm text-gray-600">
                        {application.institut || ''} • {application.specialite || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status === 'pending' ? 'En attente' :
                       application.status === 'approved' ? 'Approuvée' :
                       application.status === 'rejected' ? 'Rejetée' : application.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {applications.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/rh/demandes">
                    <Button variant="outline" size="sm">
                      Voir toutes les demandes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Stagiaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Stagiaires actifs
            </CardTitle>
            <CardDescription>Suivi des stages en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stagiaires.slice(0, 5).map((stagiaire) => (
                <div key={stagiaire.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(stagiaire.prenom?.charAt(0) || '')}{(stagiaire.nom?.charAt(0) || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{stagiaire.prenom || ''} {stagiaire.nom || ''}</div>
                      <div className="text-sm text-gray-600">
                        {stagiaire.institut || ''} • {stagiaire.specialite || ''}
                      </div>
                      {stagiaire.active_stage && (
                        <div className="text-xs text-gray-500">
                          {stagiaire.active_stage.title}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stagiaire.active_stage && (
                      <div className="text-right">
                        <div className={`font-medium ${getProgressColor(stagiaire.active_stage.progress)}`}>
                          {stagiaire.active_stage.progress}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {stagiaire.active_stage.tuteur ? 
                           `${stagiaire.active_stage.tuteur.first_name} ${stagiaire.active_stage.tuteur.last_name}` : 
                           'Tuteur non assigné'}
                        </div>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {stagiaires.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/rh/stagiaires">
                    <Button variant="outline" size="sm">
                      Voir tous les stagiaires
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
