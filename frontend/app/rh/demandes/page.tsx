"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, Application } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  X,
  Clock,
  Download,
  Building,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react"

export default function RHDemandesPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const breadcrumbs = [{ label: "RH", href: "/rh" }, { label: "Demandes de stage" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [applicationsResponse, statsResponse] = await Promise.all([
          apiClient.getApplications(),
          apiClient.getDashboardStats()
        ])
        
        setApplications(applicationsResponse.results || [])
        setStats({
          total: applicationsResponse.count || 0,
          pending: applicationsResponse.results?.filter(app => app.status === 'pending').length || 0,
          approved: applicationsResponse.results?.filter(app => app.status === 'approved').length || 0,
          rejected: applicationsResponse.results?.filter(app => app.status === 'rejected').length || 0
        })
      } catch (err: any) {
        console.error('Error fetching applications:', err)
        setError(err.message || 'Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await apiClient.approveApplication(id)
      // Refresh data
      const response = await apiClient.getApplications()
      setApplications(response.results || [])
    } catch (err: any) {
      console.error('Error approving application:', err)
      setError(err.message || 'Failed to approve application')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await apiClient.rejectApplication(id, 'Rejeté par RH')
      // Refresh data
      const response = await apiClient.getApplications()
      setApplications(response.results || [])
    } catch (err: any) {
      console.error('Error rejecting application:', err)
      setError(err.message || 'Failed to reject application')
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Demandes de stage</h1>
            <p className="text-gray-600 mt-1">Gérez les nouvelles candidatures reçues</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <FileText className="mr-2 h-4 w-4" />
              Traitement en lot
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-blue-600">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-green-600">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% du total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
              <p className="text-xs text-gray-600">Moyenne mensuelle</p>
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

        {/* Table des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des demandes</CardTitle>
            <CardDescription>Gérez les candidatures reçues</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Institut</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Type de stage</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {application.prenom || ''} {application.nom || ''}
                        </div>
                        <div className="text-sm text-gray-600">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {application.institut || ''}
                      </div>
                    </TableCell>
                    <TableCell>{application.specialite || ''}</TableCell>
                    <TableCell>{application.type_stage || ''}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(application.date_debut).toLocaleDateString()}</div>
                        <div className="text-gray-500">au {new Date(application.date_fin).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <Badge className={getStatusBadge(application.status)}>
                          {application.status === 'pending' ? 'En attente' :
                           application.status === 'approved' ? 'Acceptée' :
                           application.status === 'rejected' ? 'Rejetée' : application.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {application.cv && <Badge variant="outline" className="text-xs">CV</Badge>}
                        {application.lettre_motivation && <Badge variant="outline" className="text-xs">LM</Badge>}
                        {application.demande_stage && <Badge variant="outline" className="text-xs">DS</Badge>}
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
                          {application.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(application.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accepter
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(application.id)}>
                                <X className="mr-2 h-4 w-4" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger documents
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
