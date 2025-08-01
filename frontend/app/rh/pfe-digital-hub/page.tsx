/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient, PFEReport } from "@/lib/api"
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Archive,
  Calendar,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  BarChart3,
  TrendingUp,
  Database,
} from "lucide-react"

export default function RHPFEDigitalHubPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<PFEReport[]>([])
  const [filteredReports, setFilteredReports] = useState<PFEReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [specialityFilter, setSpecialityFilter] = useState("all")

  const breadcrumbs = [
    { label: "RH", href: "/rh" },
    { label: "PFE Digital Hub" }
  ]

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, statusFilter, yearFilter, specialityFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPfeReports()
      setReports(response.results || [])
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.stagiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.stagiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter(report => report.year.toString() === yearFilter)
    }

    // Filter by speciality
    if (specialityFilter !== "all") {
      filtered = filtered.filter(report => report.speciality === specialityFilter)
    }

    setFilteredReports(filtered)
  }

  const handleArchiveReport = async (reportId: number) => {
    try {
      await apiClient.archivePfeReport(reportId)
      
      toast({
        title: "Succès",
        description: "Rapport archivé avec succès",
      })

      fetchReports()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDownloadReport = async (reportId: number) => {
    try {
      const response = await apiClient.downloadPFEReport(reportId)
      
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = response.download_url
      link.download = response.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Succès",
        description: "Téléchargement démarré",
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors du téléchargement",
        variant: "destructive",
      })
    }
  }

  const handleViewReport = async (reportId: number) => {
    try {
      const response = await apiClient.downloadPFEReport(reportId)
      
      // Open the report in a new tab
      window.open(response.download_url, '_blank')

      toast({
        title: "Succès",
        description: "Rapport ouvert dans un nouvel onglet",
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de l'ouverture du rapport",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", className: "bg-gray-100 text-gray-800" },
      submitted: { label: "Soumis", className: "bg-blue-100 text-blue-800" },
      under_review: { label: "En révision", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approuvé", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejeté", className: "bg-red-100 text-red-800" },
      archived: { label: "Archivé", className: "bg-purple-100 text-purple-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  // Get unique values for filters
  const years = [...new Set(reports.map(r => r.year))].sort((a, b) => b - a)
  const specialities = [...new Set(reports.map(r => r.speciality))].sort()

  // Statistics
  const totalReports = reports.length
  const approvedReports = reports.filter(r => r.status === 'approved').length
  const archivedReports = reports.filter(r => r.status === 'archived').length
  const totalDownloads = reports.reduce((sum, r) => sum + r.download_count, 0)
  const totalViews = reports.reduce((sum, r) => sum + r.view_count, 0)

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh", "admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["rh", "admin"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["rh", "admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PFE Digital Hub</h1>
          <p className="text-gray-600 mt-2">
            Centre de gestion des rapports de Projets de Fin d'Études
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Tous les rapports
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedReports}</div>
              <p className="text-xs text-muted-foreground">
                Rapports validés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archivés</CardTitle>
              <Archive className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{archivedReports}</div>
              <p className="text-xs text-muted-foreground">
                Rapports archivés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
              <Download className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">
                Total téléchargements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher par titre, résumé, mots-clés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="approved">Approuvés</SelectItem>
                    <SelectItem value="archived">Archivés</SelectItem>
                    <SelectItem value="submitted">Soumis</SelectItem>
                    <SelectItem value="rejected">Rejetés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specialities.map(speciality => (
                      <SelectItem key={speciality} value={speciality}>
                        {speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports PFE</CardTitle>
            <CardDescription>
              {filteredReports.length} rapport(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
                <p className="text-gray-600">
                  Aucun rapport ne correspond aux critères de recherche.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(report.status)}
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{report.abstract}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Version {report.version}</span>
                          <span>•</span>
                          <span>Spécialité: {report.speciality}</span>
                          <span>•</span>
                          <span>Année: {report.year}</span>
                          <span>•</span>
                          <span>Stagiaire: {report.stagiaire.prenom} {report.stagiaire.nom}</span>
                          {report.tuteur && (
                            <>
                              <span>•</span>
                              <span>Tuteur: {report.tuteur.prenom} {report.tuteur.nom}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span>📥 {report.download_count} téléchargements</span>
                          <span>👁️ {report.view_count} vues</span>
                          {report.submitted_at && (
                            <span>📅 Soumis le {new Date(report.submitted_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArchiveReport(report.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archiver
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewReport(report.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 