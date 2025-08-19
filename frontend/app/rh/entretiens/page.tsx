/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare, Filter, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface InterviewRequest {
  id: number
  demande: {
    id: number
    candidat: {
      prenom: string
      nom: string
      email: string
      institut: string
      specialite: string
    }
    entreprise: {
      nom: string
    }
  }
  tuteur: {
    id: number
    prenom: string
    nom: string
    email: string
  }
  status: 'PENDING_TUTEUR' | 'VALIDATED' | 'REVISION_REQUESTED'
  proposed_date: string
  proposed_time: string
  suggested_date?: string
  suggested_time?: string
  location: string
  tuteur_comment?: string
  created_at: string
}

export default function RHInterviewsPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<InterviewRequest[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInterview, setSelectedInterview] = useState<InterviewRequest | null>(null)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decision, setDecision] = useState<"accepted" | "rejected">("accepted")
  const [decisionComment, setDecisionComment] = useState("")
  const [submittingDecision, setSubmittingDecision] = useState(false)

  const breadcrumbs = [
    { label: "Tableau de bord", href: "/rh" },
    { label: "Gestion des entretiens" }
  ]

  useEffect(() => {
    if (user) {
      fetchInterviews()
    }
  }, [user])

  useEffect(() => {
    filterInterviews()
  }, [interviews, searchTerm, statusFilter])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      // Get all demandes with interview requests
      const demandesResponse = await apiClient.getApplications({ limit: 100 })
      const allInterviews: InterviewRequest[] = []
      
      // Extract interview requests from all demandes
      demandesResponse.results.forEach((demande: any) => {
        if (demande.interview_requests && demande.interview_requests.length > 0) {
          demande.interview_requests.forEach((ir: any) => {
            allInterviews.push({
              id: ir.id,
              demande: {
                id: demande.id,
                candidat: {
                  prenom: demande.prenom || '',
                  nom: demande.nom || '',
                  email: demande.email || '',
                  institut: demande.institut || '',
                  specialite: demande.specialite || ''
                },
                entreprise: {
                  nom: demande.entreprise?.nom || 'N/A'
                }
              },
              tuteur: {
                id: ir.tuteur.id,
                prenom: ir.tuteur.first_name || '',
                nom: ir.tuteur.last_name || '',
                email: ir.tuteur.email || ''
              },
              status: ir.status,
              proposed_date: ir.proposed_date,
              proposed_time: ir.proposed_time,
              suggested_date: ir.suggested_date,
              suggested_time: ir.suggested_time,
              location: ir.location,
              tuteur_comment: ir.tuteur_comment,
              created_at: ir.created_at
            })
          })
        }
      })
      
      setInterviews(allInterviews)
    } catch (err: any) {
      console.error('Error fetching interviews:', err)
      setError(err.message || 'Failed to load interviews')
    } finally {
      setLoading(false)
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.demande.candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.demande.candidat.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.demande.candidat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.tuteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.tuteur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(interview => interview.status === statusFilter)
    }

    setFilteredInterviews(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente du tuteur</Badge>
      case 'VALIDATED':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>
      case 'REVISION_REQUESTED':
        return <Badge className="bg-blue-100 text-blue-800">Révision demandée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return 'text-yellow-600'
      case 'VALIDATED':
        return 'text-green-600'
      case 'REVISION_REQUESTED':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleViewDetails = (interview: InterviewRequest) => {
    setSelectedInterview(interview)
  }

  const handleMakeDecision = (interview: InterviewRequest) => {
    setSelectedInterview(interview)
    setDecisionModalOpen(true)
  }

  const submitDecision = async () => {
    if (!selectedInterview) return

    try {
      setSubmittingDecision(true)
      
      // Update the demande status based on decision
      if (decision === "accepted") {
        await apiClient.approveApplication(selectedInterview.demande.id)
      } else {
        await apiClient.rejectApplication(selectedInterview.demande.id, decisionComment)
      }

      // Update local state
      setInterviews(prev => prev.map(interview => 
        interview.id === selectedInterview.id 
          ? { ...interview, status: 'VALIDATED' as const }
          : interview
      ))

      setDecisionModalOpen(false)
      setSelectedInterview(null)
      setDecisionComment("")
      
      // Show success message
      // You can implement toast notification here
      alert(`Candidat ${decision === "accepted" ? "accepté" : "rejeté"} avec succès!`)
      
    } catch (err: any) {
      console.error('Error submitting decision:', err)
      alert('Erreur lors de la soumission de la décision')
    } finally {
      setSubmittingDecision(false)
    }
  }

  const getInterviewStats = () => {
    const total = interviews.length
    const pending = interviews.filter(i => i.status === 'PENDING_TUTEUR').length
    const validated = interviews.filter(i => i.status === 'VALIDATED').length
    const revision = interviews.filter(i => i.status === 'REVISION_REQUESTED').length

    return { total, pending, validated, revision }
  }

  const stats = getInterviewStats()

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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des entretiens</h1>
            <p className="text-gray-600 mt-1">Gérez tous les entretiens et prenez les décisions finales</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total entretiens</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Tous les entretiens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente tuteur</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Attendent confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
              <p className="text-xs text-muted-foreground">Prêts pour décision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Révision demandée</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.revision}</div>
              <p className="text-xs text-muted-foreground">Nouveaux créneaux</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Rechercher par nom, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="PENDING_TUTEUR">En attente tuteur</SelectItem>
                    <SelectItem value="VALIDATED">Validés</SelectItem>
                    <SelectItem value="REVISION_REQUESTED">Révision demandée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des entretiens</CardTitle>
            <CardDescription>
              {filteredInterviews.length} entretien(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun entretien</h3>
                  <p className="text-gray-600">
                    {interviews.length === 0 
                      ? "Aucun entretien n'a été planifié pour le moment"
                      : "Aucun entretien ne correspond à vos critères de recherche"
                    }
                  </p>
                </div>
              ) : (
                filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {interview.demande.candidat.prenom} {interview.demande.candidat.nom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {interview.demande.candidat.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {interview.demande.candidat.institut} • {interview.demande.candidat.specialite}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(interview.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(interview)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {interview.status === 'VALIDATED' && (
                          <Button
                            size="sm"
                            onClick={() => handleMakeDecision(interview)}
                          >
                            Prendre décision
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {interview.suggested_date || interview.proposed_date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {interview.suggested_time || interview.proposed_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{interview.location}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Tuteur:</strong> {interview.tuteur.prenom} {interview.tuteur.nom}
                      {interview.tuteur_comment && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <strong>Commentaire tuteur:</strong> {interview.tuteur_comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Decision Modal */}
        <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Décision finale</DialogTitle>
              <DialogDescription>
                Prenez la décision finale pour {selectedInterview?.demande.candidat.prenom} {selectedInterview?.demande.candidat.nom}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="decision">Décision</Label>
                <Select value={decision} onValueChange={(value: "accepted" | "rejected") => setDecision(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepted">Accepter le candidat</SelectItem>
                    <SelectItem value="rejected">Rejeter le candidat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  placeholder="Ajoutez un commentaire sur votre décision..."
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDecisionModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={submitDecision}
                  disabled={submittingDecision}
                  className={decision === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {submittingDecision ? "En cours..." : decision === "accepted" ? "Accepter" : "Rejeter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
