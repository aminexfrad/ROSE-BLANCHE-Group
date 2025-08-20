/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Calendar, Clock, MapPin, User, FileText, CheckCircle, Eye, Mail, Phone, Building, GraduationCap, MapPin as MapPinIcon, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { ScheduleInterviewModal } from "@/components/schedule-interview-modal"
import { RHProposalResponseModal } from "@/components/rh-proposal-response-modal"

interface Application {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  institut: string
  specialite: string
  type_stage: string
  niveau: string
  date_debut: string
  date_fin: string
  status: string
  created_at: string
  cv?: string
  lettre_motivation?: string
  demande_stage?: string
  cv_binome?: string
  lettre_motivation_binome?: string
  demande_stage_binome?: string
  entreprise?: {
    id: number
    nom: string
  }
  offres?: Array<{
    id: number
    titre: string
    entreprise: {
      id: number
      nom: string
    }
    status: string
  }>
  interview_requests?: Array<{
    id: number
    status: string
    proposed_date: string
    proposed_time: string
    suggested_date?: string
    suggested_time?: string
    location: string
    tuteur: {
      id: number
      name: string
      email: string
    }
    filiale: {
      id: number
      name: string
    }
    tuteur_comment?: string
    created_at: string
  }>
}

interface FilePreviewCardProps {
  label: string
  url?: string
}

function FilePreviewCard({ label, url }: FilePreviewCardProps) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <FileText className="h-4 w-4" />
        <span className="text-sm">{label} - Non fourni</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-blue-600" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline"
      >
        {label}
      </a>
    </div>
  )
}

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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [selectedDemandeForInterview, setSelectedDemandeForInterview] = useState<Application | null>(null)
  const [selectedInterviewRequest, setSelectedInterviewRequest] = useState<any>(null)
  const [proposalResponseModalOpen, setProposalResponseModalOpen] = useState(false)
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const breadcrumbs = [{ label: "Responsable RH", href: "/rh" }, { label: "Demandes de stage" }]

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

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      case 'interview_scheduled':
        return <Badge variant="outline">Entretien planifié</Badge>
      case 'approved':
        return <Badge variant="default">Approuvée</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInterviewStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente du tuteur</Badge>
      case 'VALIDATED':
        return <Badge className="bg-green-100 text-green-800">Entretien validé</Badge>
      case 'REVISION_REQUESTED':
        return <Badge className="bg-blue-100 text-blue-800">Révision demandée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInterviewStatusInfo = (application: Application) => {
    if (!application.interview_requests || application.interview_requests.length === 0) {
      return null
    }
    
    const latestRequest = application.interview_requests[0] // Most recent
    return {
      status: latestRequest.status,
      tuteur: latestRequest.tuteur.name,
      date: latestRequest.proposed_date,
      time: latestRequest.proposed_time,
      location: latestRequest.location,
      suggestedDate: latestRequest.suggested_date,
      suggestedTime: latestRequest.suggested_time,
      comment: latestRequest.tuteur_comment
    }
  }

  const canMakeFinalDecision = (application: Application) => {
    const interviewInfo = getInterviewStatusInfo(application)
    return interviewInfo && interviewInfo.status === 'VALIDATED'
  }

  const handleDirectReject = async (application: Application) => {
    try {
      await apiClient.rejectApplication(application.id, 'Candidature rejetée directement par RH');
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ 
        title: 'Succès', 
        description: `Candidature de ${application.prenom} ${application.nom} rejetée.`,
        variant: 'default'
      });
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      toast({ 
        title: 'Erreur', 
        description: 'Erreur lors du rejet de la candidature',
        variant: 'destructive'
      });
    }
  }

  const handleAcceptCandidate = async (application: Application) => {
    try {
      await apiClient.approveApplication(application.id);
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ 
        title: 'Candidat accepté! 🎉', 
        description: `${application.prenom} ${application.nom} est maintenant stagiaire dans votre filiale.`,
        variant: 'default'
      });
    } catch (err: any) {
      console.error('Error accepting candidate:', err);
      toast({ 
        title: 'Erreur', 
        description: 'Erreur lors de la conversion en stagiaire',
        variant: 'destructive'
      });
    }
  }

  const handleScheduleInterview = (application: Application) => {
    setSelectedDemandeForInterview(application);
    setInterviewModalOpen(true);
  }

  const handleInterviewScheduled = () => {
    fetchData();
  }

  const handleProposalResponseSuccess = () => {
    fetchData();
  }

  const matchesFilters = (app: Application) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = q === "" ||
      app.nom.toLowerCase().includes(q) ||
      app.prenom.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.institut.toLowerCase().includes(q) ||
      app.specialite.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  }

  const filteredApplications = applications.filter(matchesFilters)

  const hasExistingInterview = (app: Application) => {
    const hasRequest = (app.interview_requests && app.interview_requests.length > 0)
    const scheduled = app.status === 'interview_scheduled'
    return hasRequest || scheduled
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Demandes de stage</h1>
            <p className="text-gray-600 mt-1">Gérez les candidatures et prenez les décisions</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-1 md:col-span-2">
                <Input
                  placeholder="Rechercher par nom, email, institut ou spécialité"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="interview_scheduled">Entretien planifié</SelectItem>
                    <SelectItem value="approved">Approuvée</SelectItem>
                    <SelectItem value="rejected">Rejetée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Toutes les candidatures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Candidats acceptés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">Candidatures refusées</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des candidatures</CardTitle>
            <CardDescription>
              {filteredApplications.length} candidature(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande de stage</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {application.prenom?.[0]}{application.nom?.[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">
                              {application.prenom} {application.nom}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(application.status)}
                              <span className="text-sm text-gray-500">
                                {new Date(application.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-green-600" />
                            <span>{application.institut}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                            <span>{application.specialite}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span>
                              {new Date(application.date_debut).toLocaleDateString()} - {new Date(application.date_fin).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Selected Offers Summary */}
                        {application.offres && application.offres.length > 0 ? (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPinIcon className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-sm text-blue-900">
                                Offres sélectionnées ({application.offres.length})
                              </span>
                            </div>
                            <div className="space-y-2">
                              {application.offres.slice(0, 3).map((offre) => (
                                <div key={offre.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-900">{offre.titre}</span>
                                      <span className="text-xs text-gray-500">Ref: {offre.id}</span>
                                    </div>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-blue-700 font-medium">{offre.entreprise.nom}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(offre.status)}
                                  </div>
                                </div>
                              ))}
                              {application.offres.length > 3 && (
                                <div className="text-xs text-blue-600 font-medium text-center py-1">
                                  +{application.offres.length - 3} autre(s) offre(s)
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Aucune offre sélectionnée</span>
                            </div>
                          </div>
                        )}

                        {/* Interview Status */}
                        {getInterviewStatusInfo(application) && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              <span className="font-semibold text-sm text-orange-900">
                                Statut de l'entretien
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Tuteur:</span>
                                <span>{getInterviewStatusInfo(application)?.tuteur}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Date proposée:</span>
                                <span>{getInterviewStatusInfo(application)?.date} à {getInterviewStatusInfo(application)?.time}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Lieu:</span>
                                <span>{getInterviewStatusInfo(application)?.location}</span>
                              </div>
                              {getInterviewStatusInfo(application)?.suggestedDate && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">Nouvelle proposition:</span>
                                  <span>{getInterviewStatusInfo(application)?.suggestedDate} à {getInterviewStatusInfo(application)?.suggestedTime}</span>
                                </div>
                              )}
                              {getInterviewStatusInfo(application)?.comment && (
                                <div className="text-sm">
                                  <span className="font-medium">Commentaire:</span>
                                  <span className="ml-2 text-gray-600">{getInterviewStatusInfo(application)?.comment}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Statut:</span>
                                {getInterviewStatusBadge(getInterviewStatusInfo(application)?.status || '')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setDetailsOpen(true);
                          }}
                          className="w-full bg-white hover:bg-gray-50 border-gray-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (hasExistingInterview(application)) {
                                  toast({ title: 'Info', description: 'Un entretien existe déjà pour cette candidature.', variant: 'default' })
                                  return
                                }
                                handleScheduleInterview(application)
                              }}
                              disabled={hasExistingInterview(application)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              title={hasExistingInterview(application) ? 'Entretien déjà proposé' : undefined}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Proposer entretien
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDirectReject(application)}
                              className="w-full"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        {/* Final Decision - Accept candidate after validated interview */}
                        {canMakeFinalDecision(application) && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptCandidate(application)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Décision finale: Accepter candidat
                          </Button>
                        )}

                        {/* Respond to tuteur proposal if revision requested */}
                        {getInterviewStatusInfo(application)?.status === 'REVISION_REQUESTED' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInterviewRequest(application.interview_requests?.[0]);
                              setProposalResponseModalOpen(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Répondre au tuteur
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview Scheduling Modal */}
      {selectedDemandeForInterview && (
        <ScheduleInterviewModal
          isOpen={interviewModalOpen}
          onClose={() => {
            setInterviewModalOpen(false);
            setSelectedDemandeForInterview(null);
          }}
          demandeId={selectedDemandeForInterview.id}
          candidateName={`${selectedDemandeForInterview.prenom} ${selectedDemandeForInterview.nom}`}
          onSuccess={handleInterviewScheduled}
          mode="propose"
        />
      )}

      {/* RH Proposal Response Modal */}
      {selectedInterviewRequest && (
        <RHProposalResponseModal
          isOpen={proposalResponseModalOpen}
          onClose={() => {
            setProposalResponseModalOpen(false);
            setSelectedInterviewRequest(null);
          }}
          requestId={selectedInterviewRequest.id}
          candidateName={`${selectedInterviewRequest.demande?.prenom || ''} ${selectedInterviewRequest.demande?.nom || ''}`}
          suggestedDate={selectedInterviewRequest.suggested_date}
          suggestedTime={selectedInterviewRequest.suggested_time}
          originalDate={selectedInterviewRequest.proposed_date}
          originalTime={selectedInterviewRequest.proposed_time}
          location={selectedInterviewRequest.location}
          tuteurComment={selectedInterviewRequest.tuteur_comment}
          onSuccess={handleProposalResponseSuccess}
        />
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande de stage
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations du candidat
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nom complet:</span>
                      <span>{selectedApplication.prenom} {selectedApplication.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedApplication.telephone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informations académiques
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Institut:</span>
                      <span>{selectedApplication.institut}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Spécialité:</span>
                      <span>{selectedApplication.specialite}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Niveau:</span>
                      <span>{selectedApplication.niveau}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations du stage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type de stage:</span>
                    <span>{selectedApplication.type_stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Période:</span>
                    <span>
                      {new Date(selectedApplication.date_debut).toLocaleDateString()} - {new Date(selectedApplication.date_fin).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interview Information */}
              {getInterviewStatusInfo(selectedApplication) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informations de l'entretien
                  </h3>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Tuteur assigné:</span>
                        <span>{getInterviewStatusInfo(selectedApplication)?.tuteur}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Statut:</span>
                        {getInterviewStatusBadge(getInterviewStatusInfo(selectedApplication)?.status || '')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Date proposée:</span>
                        <span>{getInterviewStatusInfo(selectedApplication)?.date} à {getInterviewStatusInfo(selectedApplication)?.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Lieu:</span>
                        <span>{getInterviewStatusInfo(selectedApplication)?.location}</span>
                      </div>
                    </div>
                    {getInterviewStatusInfo(selectedApplication)?.suggestedDate && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-blue-900">Nouvelle proposition du tuteur:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Date:</span>
                            <span>{getInterviewStatusInfo(selectedApplication)?.suggestedDate} à {getInterviewStatusInfo(selectedApplication)?.suggestedTime}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {getInterviewStatusInfo(selectedApplication)?.comment && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">Commentaire du tuteur:</span>
                        </div>
                        <p className="text-sm text-gray-700">{getInterviewStatusInfo(selectedApplication)?.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FilePreviewCard label="CV" url={selectedApplication.cv} />
                  <FilePreviewCard label="Lettre de motivation" url={selectedApplication.lettre_motivation} />
                  <FilePreviewCard label="Demande de stage" url={selectedApplication.demande_stage} />
                </div>
              </div>

              {/* Selected Offers */}
              {selectedApplication.offres && selectedApplication.offres.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Offres sélectionnées
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.offres.map((offre) => (
                      <div key={offre.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-blue-900">{offre.titre}</h4>
                            <div className="text-xs text-gray-500 mb-1">Référence: {offre.id}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{offre.entreprise.nom}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(offre.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedApplication.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleScheduleInterview(selectedApplication)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Proposer entretien
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDirectReject(selectedApplication)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter la candidature
                    </Button>
                  </>
                )}
                
                {/* Final Decision - Accept candidate after validated interview */}
                {canMakeFinalDecision(selectedApplication) && (
                  <Button
                    onClick={() => handleAcceptCandidate(selectedApplication)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Décision finale: Accepter candidat
                  </Button>
                )}

                {/* Respond to tuteur proposal if revision requested */}
                {getInterviewStatusInfo(selectedApplication)?.status === 'REVISION_REQUESTED' && (
                  <Button
                    onClick={() => {
                      setSelectedInterviewRequest(selectedApplication.interview_requests?.[0]);
                      setProposalResponseModalOpen(true);
                      setDetailsOpen(false); // Close details modal
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Répondre au tuteur
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
