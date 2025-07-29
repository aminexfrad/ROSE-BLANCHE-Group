/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Archive,
  Download,
  Eye,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  BookOpen,
} from "lucide-react"

interface PFEReport {
  id: number;
  title: string;
  stagiaire: {
    nom: string;
    prenom: string;
    email: string;
  };
  tuteur?: {
    nom: string;
    prenom: string;
  };
  status: string;
  year: number;
  speciality: string;
  created_at: string;
  submitted_at?: string;
  approved_at?: string;
  archived_at?: string;
  download_count: number;
  view_count: number;
}

export default function AdminPFEReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<PFEReport[]>([])
  const [filteredReports, setFilteredReports] = useState<PFEReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  const breadcrumbs = [
    { label: "Administration", href: "/admin" },
    { label: "Rapports PFE" }
  ]

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getPfeReports()
        setReports(data.results || [])
        setFilteredReports(data.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des rapports")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  useEffect(() => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.stagiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.stagiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.speciality.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, yearFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-orange-100 text-orange-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'archived':
        return 'Archivé'
      case 'approved':
        return 'Approuvé'
      case 'submitted':
        return 'Soumis'
      case 'draft':
        return 'Brouillon'
      case 'rejected':
        return 'Rejeté'
      default:
        return status
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

  const stats = {
    total: reports.length,
    archived: reports.filter(r => r.status === 'archived').length,
    approved: reports.filter(r => r.status === 'approved').length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    draft: reports.filter(r => r.status === 'draft').length,
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rapports PFE</h1>
            <p className="text-gray-600 mt-2">
              Administration complète des rapports PFE archivés et approuvés
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredReports.length} rapport(s)
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-green-600">Approuvés</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
                <div className="text-sm text-gray-600">Archivés</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
                <div className="text-sm text-yellow-600">Soumis</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
                <div className="text-sm text-orange-600">Brouillons</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, stagiaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="submitted">Soumis</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports PFE</CardTitle>
            <CardDescription>
              Liste complète des rapports PFE avec options de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rapport trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all" || yearFilter !== "all"
                      ? "Aucun rapport ne correspond aux filtres sélectionnés"
                      : "Aucun rapport PFE disponible"}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {report.stagiaire.prenom?.[0]}{report.stagiaire.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusLabel(report.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{report.stagiaire.prenom} {report.stagiaire.nom}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{report.year}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{report.speciality}</span>
                            </div>
                          </div>
                          {report.tuteur && (
                            <div className="text-sm text-gray-500 mt-1">
                              Tuteur: {report.tuteur.prenom} {report.tuteur.nom}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Téléchargements: {report.download_count}</span>
                            <span>Vues: {report.view_count}</span>
                            <span>Créé: {new Date(report.created_at).toLocaleDateString()}</span>
                            {report.submitted_at && (
                              <span>Soumis: {new Date(report.submitted_at).toLocaleDateString()}</span>
                            )}
                            {report.approved_at && (
                              <span>Approuvé: {new Date(report.approved_at).toLocaleDateString()}</span>
                            )}
                            {report.archived_at && (
                              <span>Archivé: {new Date(report.archived_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 