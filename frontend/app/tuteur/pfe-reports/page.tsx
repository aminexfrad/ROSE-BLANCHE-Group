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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Send,
  Loader2,
  Calendar,
  User,
  Building,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface PFEReport {
  id: number
  title: string
  abstract: string
  keywords: string
  speciality: string
  year: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'archived'
  submitted_at: string | null
  reviewed_at: string | null
  approved_at: string | null
  version: number
  download_count: number
  view_count: number
  created_at: string
  updated_at: string
  tuteur_feedback: string
  stagiaire_comment: string
  rejection_reason: string
  pdf_file: string
  presentation_file: string | null
  additional_files: string | null
  stagiaire: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  tuteur: {
    id: number
    first_name: string
    last_name: string
    email: string
  } | null
}

export default function TuteurPFEReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<PFEReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<PFEReport | null>(null)
  const [validationData, setValidationData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    tuteur_feedback: '',
    rejection_reason: ''
  })

  const breadcrumbs = [
    { label: "Tableau de bord", href: "/tuteur" },
    { label: "Rapports PFE" }
  ]

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pfe-reports/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rapports')
      }
      
      const data = await response.json()
      setReports(data.results || [])
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async () => {
    if (!selectedReport) return

    try {
      const response = await fetch(`/api/pfe-reports/${selectedReport.id}/validate/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la validation du rapport')
      }

      toast({
        title: "Succès",
        description: validationData.status === 'approved' 
          ? "Rapport approuvé avec succès" 
          : "Rapport rejeté avec succès",
      })

      setValidationModalOpen(false)
      setSelectedReport(null)
      setValidationData({
        status: 'approved',
        tuteur_feedback: '',
        rejection_reason: ''
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

  const openValidationModal = (report: PFEReport) => {
    setSelectedReport(report)
    setValidationData({
      status: 'approved',
      tuteur_feedback: '',
      rejection_reason: ''
    })
    setValidationModalOpen(true)
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

  const pendingReports = reports.filter(r => r.status === 'submitted')
  const approvedReports = reports.filter(r => r.status === 'approved')
  const rejectedReports = reports.filter(r => r.status === 'rejected')

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports PFE</h1>
          <p className="text-gray-600 mt-2">
            Validez les rapports de vos stagiaires
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReports.length}</div>
              <p className="text-xs text-muted-foreground">
                Rapports à valider
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedReports.length}</div>
              <p className="text-xs text-muted-foreground">
                Rapports validés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedReports.length}</div>
              <p className="text-xs text-muted-foreground">
                Rapports rejetés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reports */}
        {pendingReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Rapports en attente de validation
              </CardTitle>
              <CardDescription>
                {pendingReports.length} rapport(s) à valider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReports.map((report) => (
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
                          <span>Stagiaire: {report.stagiaire.first_name} {report.stagiaire.last_name}</span>
                        </div>
                        {report.stagiaire_comment && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>Commentaire stagiaire:</strong> {report.stagiaire_comment}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => openValidationModal(report)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setValidationData({ ...validationData, status: 'rejected' })
                            openValidationModal(report)
                          }}
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les rapports</CardTitle>
            <CardDescription>
              {reports.length} rapport(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport PFE</h3>
                <p className="text-gray-600">
                  Aucun de vos stagiaires n'a encore soumis de rapport PFE.
                </p>
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
                          <span>•</span>
                          <span>Stagiaire: {report.stagiaire.first_name} {report.stagiaire.last_name}</span>
                        </div>
                        {report.tuteur_feedback && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Votre feedback:</strong> {report.tuteur_feedback}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openValidationModal(report)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setValidationData({ ...validationData, status: 'rejected' })
                                openValidationModal(report)
                              }}
                            >
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        {report.status === 'approved' && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
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

        {/* Validation Modal */}
        <Dialog open={validationModalOpen} onOpenChange={setValidationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {validationData.status === 'approved' ? 'Approuver le rapport' : 'Rejeter le rapport'}
              </DialogTitle>
              <DialogDescription>
                {validationData.status === 'approved' 
                  ? 'Donnez votre feedback positif au stagiaire'
                  : 'Expliquez les raisons du rejet pour que le stagiaire puisse corriger'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={validationData.tuteur_feedback}
                  onChange={(e) => setValidationData({ ...validationData, tuteur_feedback: e.target.value })}
                  placeholder={validationData.status === 'approved' 
                    ? "Donnez votre feedback positif..." 
                    : "Expliquez les points à améliorer..."
                  }
                  rows={4}
                />
              </div>
              {validationData.status === 'rejected' && (
                <div>
                  <Label htmlFor="rejection_reason">Raison du rejet</Label>
                  <Textarea
                    id="rejection_reason"
                    value={validationData.rejection_reason}
                    onChange={(e) => setValidationData({ ...validationData, rejection_reason: e.target.value })}
                    placeholder="Expliquez en détail pourquoi le rapport est rejeté..."
                    rows={3}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setValidationModalOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleValidation}
                  className={validationData.status === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  {validationData.status === 'approved' ? 'Approuver' : 'Rejeter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 