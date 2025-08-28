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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Send,
  Download,
  Eye,
  Plus,
  Loader2,
  Calendar,
  User,
  Building,
} from "lucide-react"
import { apiClient } from '@/lib/api'

import { PFEReport } from '@/lib/api'

export default function StagiairePFEReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<PFEReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<PFEReport | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    speciality: "",
    year: new Date().getFullYear(),
    pdf_file: null as File | null,
    presentation_file: null as File | null,
    additional_files: null as File | null,
  })

  const breadcrumbs = [
    { label: "Tableau de bord", href: "/stagiaire" },
    { label: "Rapports PFE" }
  ]

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getPfeReports()
      setReports(data.results || [])
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async () => {
    try {
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('abstract', formData.abstract)
      formDataObj.append('keywords', formData.keywords)
      formDataObj.append('speciality', formData.speciality)
      formDataObj.append('year', formData.year.toString())
      
      if (formData.pdf_file) {
        formDataObj.append('pdf_file', formData.pdf_file)
      }
      if (formData.presentation_file) {
        formDataObj.append('presentation_file', formData.presentation_file)
      }
      if (formData.additional_files) {
        formDataObj.append('additional_files', formData.additional_files)
      }

      await apiClient.createPfeReport(formDataObj)

      toast({
        title: "Succès",
        description: "Rapport PFE créé avec succès",
      })

      setCreateModalOpen(false)
      setFormData({
        title: "",
        abstract: "",
        keywords: "",
        speciality: "",
        year: new Date().getFullYear(),
        pdf_file: null,
        presentation_file: null,
        additional_files: null,
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

  const handleSubmitReport = async (reportId: number) => {
    try {
      await apiClient.submitPfeReport(reportId)

      toast({
        title: "Succès",
        description: "Rapport soumis avec succès pour révision",
      })

      fetchReports()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission",
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
              submitted: { label: "Soumis", className: "bg-red-100 text-red-800" },
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

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Rapports PFE</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos rapports de Projet de Fin d'Études
            </p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Rapport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau rapport PFE</DialogTitle>
                <DialogDescription>
                  Remplissez les informations de votre rapport PFE
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du rapport</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de votre projet PFE"
                  />
                </div>
                <div>
                  <Label htmlFor="abstract">Résumé</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    placeholder="Résumé de votre projet"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keywords">Mots-clés</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="Mots-clés séparés par des virgules"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speciality">Spécialité</Label>
                    <Input
                      id="speciality"
                      value={formData.speciality}
                      onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                      placeholder="Votre spécialité"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pdf_file">Rapport PDF *</Label>
                  <Input
                    id="pdf_file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData({ ...formData, pdf_file: e.target.files?.[0] || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="presentation_file">Présentation (optionnel)</Label>
                  <Input
                    id="presentation_file"
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setFormData({ ...formData, presentation_file: e.target.files?.[0] || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="additional_files">Fichiers additionnels (optionnel)</Label>
                  <Input
                    id="additional_files"
                    type="file"
                    multiple
                    onChange={(e) => setFormData({ ...formData, additional_files: e.target.files?.[0] || null })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateReport}>
                    Créer le rapport
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Rapports PFE</CardTitle>
            <CardDescription>
              {reports.length} rapport(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport PFE</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore créé de rapport PFE.
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre premier rapport
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
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
                          {report.tuteur && (
                            <>
                              <span>•</span>
                              <span>Tuteur: {report.tuteur.prenom} {report.tuteur.nom}</span>
                            </>
                          )}
                        </div>
                        {report.tuteur_feedback && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                                                          <p className="text-sm text-red-800">
                              <strong>Feedback tuteur:</strong> {report.tuteur_feedback}
                            </p>
                          </div>
                        )}
                        {report.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Raison du rejet:</strong> {report.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReport(report.id)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Soumettre
                          </Button>
                        )}
                        {(report.status === 'draft' || report.status === 'rejected') && (
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                        )}
                        {report.status === 'approved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                        >
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