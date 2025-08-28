/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, User, PFEReport } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  AlertTriangle,
  Database,
  BarChart3,
  Cog,
  Archive,
  Download,
  Eye,
} from "lucide-react"

interface DashboardStats {
  total_users: number;
  total_applications: number;
  total_stages: number;
  recent_applications: number;
  active_stages: number;
  completed_stages: number;
  avg_progression: number;
  current_progression: number;
  status_stats: Array<{ status: string; count: number }>;
  role_stats: Array<{ role: string; count: number }>;
  pfe_reports_stats: {
    total: number;
    approved: number;
    archived: number;
    submitted: number;
  };
}

interface RecentUser extends User {
  // Extends the User interface which already has the correct field names
}



const quickActions = [
  {
    title: "User Management",
    description: "Manage users and permissions",
    icon: Users,
    href: "/admin/utilisateurs",
            color: "bg-red-500",
  },
  {
    title: "PFE Reports Archive",
    description: "Manage archived PFE reports",
    icon: Archive,
    href: "/admin/pfe-reports",
    color: "bg-indigo-500",
  },
  {
    title: "Database Management",
    description: "Manage database and backups",
    icon: Database,
    href: "/admin/database",
    color: "bg-purple-500",
  },
  {
    title: "Analytics",
    description: "View system analytics",
    icon: BarChart3,
    href: "/admin/statistiques",
    color: "bg-orange-500",
  },
  {
    title: "Offres de Stage",
    description: "Manage internship offers",
    icon: FileText,
    href: "/admin/offres-stage",
    color: "bg-emerald-500",
  },
]

const systemActions = [
  {
    title: "System Configuration",
    description: "Configure system settings",
    icon: Cog,
    href: "/admin/configuration",
    color: "bg-gray-500",
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [pfeReports, setPfeReports] = useState<PFEReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const breadcrumbs = [{ label: "Administration" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsData = await apiClient.getDashboardStats()
        setStats({
          total_users: statsData.stats?.total_users ?? 0,
          total_applications: statsData.stats?.total_applications ?? 0,
          total_stages: statsData.stats?.total_stages ?? 0,
          recent_applications: statsData.stats?.recent_applications ?? 0,
          active_stages: statsData.stats?.active_stages ?? 0,
          completed_stages: statsData.stats?.completed_stages ?? 0,
          avg_progression: statsData.stats?.avg_progression ?? 0,
          current_progression: statsData.stats?.current_progression ?? 0,
          status_stats: statsData.stats?.status_stats ?? [],
          role_stats: statsData.stats?.role_stats ?? [],
          pfe_reports_stats: {
            total: 0,
            approved: 0,
            archived: 0,
            submitted: 0
          }
        })
        
        // Fetch recent users
        const usersData = await apiClient.getUsers({ limit: 5 })
        setRecentUsers(usersData.results || [])
        
        // Fetch PFE reports
        const reportsData = await apiClient.getPfeReports()
        setPfeReports(reportsData.results || [])
        
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-red-100 text-red-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'rh':
        return 'bg-purple-100 text-purple-800'
      case 'tuteur':
        return 'bg-red-100 text-red-800'
      case 'stagiaire':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownloadReport = async (reportId: number) => {
    try {
      const response = await apiClient.downloadPFEReport(reportId)
      const link = document.createElement('a')
      link.href = response.download_url
      link.download = response.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', err)
    }
  }

  const handleViewReport = async (reportId: number) => {
    try {
      const response = await apiClient.downloadPFEReport(reportId)
      window.open(response.download_url, '_blank')
    } catch (err: any) {
      console.error('Erreur lors de l\'ouverture:', err)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-gray-600 mt-2">
              Gestion complète de la plateforme StageBloom
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Système Opérationnel
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  Total des utilisateurs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stages Actifs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_stages}</div>
                <p className="text-xs text-muted-foreground">
                  Stages en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rapports PFE</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pfe_reports_stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total des rapports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivés</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pfe_reports_stats?.archived || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Rapports archivés
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PFE Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Archive className="h-5 w-5" />
              <span>Rapports PFE - Archive</span>
            </CardTitle>
            <CardDescription>
              Gestion des rapports PFE archivés et approuvés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Statistics */}
              {stats?.pfe_reports_stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                                          <div className="text-2xl font-bold text-red-600">{stats.pfe_reports_stats.total}</div>
                      <div className="text-sm text-red-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.pfe_reports_stats.approved}</div>
                    <div className="text-sm text-green-600">Approuvés</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{stats.pfe_reports_stats.archived}</div>
                    <div className="text-sm text-gray-600">Archivés</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pfe_reports_stats.submitted}</div>
                    <div className="text-sm text-yellow-600">Soumis</div>
                  </div>
                </div>
              )}

              {/* Reports List */}
              <div className="space-y-3">
                {pfeReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Avatar>
                          <AvatarFallback>
                            {report.stagiaire.prenom?.[0]}{report.stagiaire.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">
                          {report.stagiaire.prenom} {report.stagiaire.nom} • {report.year} • {report.speciality}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pfeReports.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => window.location.href = '/admin/pfe-reports'}>
                    Voir tous les rapports ({pfeReports.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Récents</CardTitle>
            <CardDescription>
              Les derniers utilisateurs inscrits sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
