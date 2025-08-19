/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

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
      title: "Entretiens",
      description: "Gérer les entretiens et décisions",
      icon: Calendar,
      href: "/rh/entretiens",
      badge: "0", // Will be updated with actual count
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
    candidat: { label: "Candidat", color: "bg-gradient-to-r from-gray-500 to-slate-600 text-white" },
  }[user?.role || "rh"] || { label: "Responsable RH", color: "bg-gradient-to-r from-orange-500 to-red-600 text-white" }

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bon retour, {user?.prenom} !</h1>
            <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <BarChart3 className="mr-2 h-4 w-4" />
              Rapports
            </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
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

        {/* Additional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {additionalActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
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

        {/* Interview Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gestion des entretiens
            </CardTitle>
            <CardDescription>Entretiens en attente et décisions à prendre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-800">Entretiens planifiés</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-sm text-yellow-800">En attente de tuteur</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-800">Décisions à prendre</div>
                </div>
              </div>
              <div className="text-center pt-2">
                <Link href="/rh/entretiens">
                  <Button variant="outline" size="sm">
                    Gérer tous les entretiens
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <div key={application.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>
                        {(application.prenom?.charAt(0) || '')}{(application.nom?.charAt(0) || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{application.prenom || ''} {application.nom || ''}</div>
                      <div className="text-sm text-gray-600 truncate">
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
