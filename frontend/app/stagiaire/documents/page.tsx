"use client"

import { useEffect, useState } from "react"
import { apiClient, Stage, Document } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Download, Eye, Upload, CheckCircle, XCircle, Clock, Loader2, AlertCircle, FileUp } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function StagiaireDocumentsPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/stagiaire" }, { label: "Documents" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internship, setInternship] = useState<Stage | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getMyInternshipDocuments()
        setInternship(response.internship)
        setDocuments(response.documents || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des documents")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "rapport":
        return <Badge className="bg-blue-100 text-blue-800">Rapport</Badge>
      case "fiche_suivi":
        return <Badge className="bg-green-100 text-green-800">Fiche de suivi</Badge>
      case "pfe":
        return <Badge className="bg-purple-100 text-purple-800">PFE</Badge>
      case "presentation":
        return <Badge className="bg-orange-100 text-orange-800">Présentation</Badge>
      case "other":
        return <Badge className="bg-gray-100 text-gray-800">Autre</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
    )
  }

  const getStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-600" />
    )
  }

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "approved" && doc.is_approved) ||
                         (statusFilter === "pending" && !doc.is_approved)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Compute statistics
  const totalDocuments = documents.length
  const approvedDocuments = documents.filter(d => d.is_approved).length
  const pendingDocuments = documents.filter(d => !d.is_approved).length
  const totalSize = documents.reduce((sum, d) => sum + (d.file_size || 0), 0)

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des documents</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Mes Documents
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Gérez vos documents de stage</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total documents",
              value: totalDocuments.toString(),
              icon: FileText,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Approuvés",
              value: approvedDocuments.toString(),
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
            },
            {
              title: "En attente",
              value: pendingDocuments.toString(),
              icon: Clock,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              title: "Taille totale",
              value: (totalSize / 1024 / 1024).toFixed(1) + " MB",
              icon: FileUp,
              color: "from-purple-500 to-purple-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 2) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{stat.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres et actions */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Search className="h-6 w-6 text-blue-600" />
              Recherche et filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="rapport">Rapport</SelectItem>
                  <SelectItem value="fiche_suivi">Fiche de suivi</SelectItem>
                  <SelectItem value="pfe">PFE</SelectItem>
                  <SelectItem value="presentation">Présentation</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Nouveau document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-600" />
              Mes documents
            </CardTitle>
            <CardDescription>
              {filteredDocuments.length} document(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4" />
                              {doc.uploaded_by?.prenom} {doc.uploaded_by?.nom}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusIcon(doc.is_approved)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {doc.description && (
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {doc.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {getTypeBadge(doc.document_type)}
                          {getStatusBadge(doc.is_approved)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(1) + " MB" : "N/A"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>

                        {doc.feedback && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-1">Feedback:</h5>
                            <p className="text-blue-800 text-sm">{doc.feedback}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun document trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone de téléchargement */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Upload className="h-6 w-6 text-purple-600" />
              Ajouter un document
            </CardTitle>
            <CardDescription>
              Téléchargez de nouveaux documents pour votre stage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Glissez-déposez vos fichiers ici
              </h3>
              <p className="text-gray-600 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Sélectionner des fichiers
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
