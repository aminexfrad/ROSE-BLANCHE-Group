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
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Calendar, Clock, MapPin, User, FileText, CheckCircle, Clock4, Eye, Download, Mail, Phone, Building, GraduationCap, CalendarDays, MapPin as MapPinIcon, XCircle } from "lucide-react"
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
  // Track loading state for each offer action
  const [loadingOffers, setLoadingOffers] = useState<{ [key: string]: boolean }>({});

  const breadcrumbs = [{ label: "Responsable RH", href: "/rh" }, { label: "Demandes de stage" }]

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
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>
      case 'REVISION_REQUESTED':
        return <Badge className="bg-blue-100 text-blue-800">Révision demandée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }



  const handleApproveOffer = async (demandeId: number, offerId: number) => {
    const key = `${demandeId}-${offerId}`;
    setLoadingOffers((prev) => ({ ...prev, [key]: true }));
    try {
      await apiClient.updateDemandeOffreStatus(demandeId, offerId, 'accepted');
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ title: 'Succès', description: 'Offre approuvée.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur lors de l\'approbation de l\'offre', variant: 'destructive' });
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [key]: false }));
    }
  }
  
  const handleRejectOffer = async (demandeId: number, offerId: number) => {
    const key = `${demandeId}-${offerId}`;
    setLoadingOffers((prev) => ({ ...prev, [key]: true }));
    try {
      await apiClient.updateDemandeOffreStatus(demandeId, offerId, 'rejected');
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ title: 'Succès', description: 'Offre rejetée.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur lors du rejet de l\'offre', variant: 'destructive' });
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [key]: false }));
    }
  }

  const handleScheduleInterview = (application: Application) => {
    setSelectedDemandeForInterview(application);
    setInterviewModalOpen(true);
  }

  const handleInterviewScheduled = () => {
    // Refresh the applications list to show updated status
    const fetchData = async () => {
      try {
        const response = await apiClient.getApplications();
        setApplications(response.results || []);
      } catch (err: any) {
        console.error('Error refreshing applications:', err);
      }
    };
    fetchData();
  }

  const handleProposalResponse = (interviewRequest: any) => {
    setSelectedInterviewRequest(interviewRequest);
    setProposalResponseModalOpen(true);
  }

  const handleProposalResponseSuccess = () => {
    // Refresh applications to get updated interview requests
    const fetchData = async () => {
      try {
        const response = await apiClient.getApplications();
        setApplications(response.results || []);
      } catch (err: any) {
        console.error('Error refreshing applications:', err);
      }
    };
    fetchData();
  }

  const handleDirectReject = async (application: Application) => {
    try {
      // Reject the entire application
      await apiClient.rejectApplication(application.id, 'Candidature rejetée directement par RH');
      
      // Refresh the applications list
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
      // Accept the candidate and convert to stagiaire
      await apiClient.approveApplication(application.id);
      
      // Refresh the applications list
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
                    <GraduationCap className="h-5 w-5" />
                    Informations académiques
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type de stage:</span>
                      <span>{selectedApplication.type_stage}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Period */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Période de stage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Date de début:</span>
                    <span>{new Date(selectedApplication.date_debut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Date de fin:</span>
                    <span>{new Date(selectedApplication.date_fin).toLocaleDateString()}</span>
                    </div>
                    </div>
              </div>

              {/* Selected Offers */}
              {selectedApplication.offres && selectedApplication.offres.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Offres sélectionnées ({selectedApplication.offres.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.offres.map((offre) => (
                      <div key={offre.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-blue-900">{offre.titre}</h4>
                            <div className="text-xs text-gray-500 mb-1">Référence: {offre.id}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{offre.entreprise.nom}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Statut:</span>
                                {getStatusBadge(offre.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {offre.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveOffer(selectedApplication.id, offre.id)}
                                  disabled={loadingOffers[`${selectedApplication.id}-${offre.id}`]}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectOffer(selectedApplication.id, offre.id)}
                                  disabled={loadingOffers[`${selectedApplication.id}-${offre.id}`]}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                    </div>
                            )}
                            {offre.status === 'accepted' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approuvée
                              </Badge>
                            )}
                            {offre.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejetée
                      </Badge>
                            )}
                    </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Requests */}
              {selectedApplication.interview_requests && selectedApplication.interview_requests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Demandes d'entretien
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.interview_requests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Tuteur:</span>
                              <span>{request.tuteur.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Filiale:</span>
                              <span>{request.filiale.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {request.proposed_date} à {request.proposed_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {request.location}
                              </span>
                            </div>
                            {request.suggested_date && request.suggested_time && (
                              <div className="text-sm text-blue-600">
                                <span className="font-medium">Nouvelle proposition:</span> {request.suggested_date} à {request.suggested_time}
                              </div>
                            )}
                            {request.tuteur_comment && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Commentaire:</span> {request.tuteur_comment}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getInterviewStatusBadge(request.status)}
                            {request.status === 'REVISION_REQUESTED' && (
                              <Button
                                size="sm"
                                onClick={() => handleProposalResponse(request)}
                              >
                                Répondre
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents du candidat principal
                </h3>
                <div className="space-y-2">
                <FilePreviewCard label="CV" url={selectedApplication.cv} />
                <FilePreviewCard label="Lettre de motivation" url={selectedApplication.lettre_motivation} />
                <FilePreviewCard label="Demande de stage" url={selectedApplication.demande_stage} />
              </div>
                {selectedApplication.cv_binome && (
                  <>
                    <h4 className="text-md font-semibold mt-4">Documents du binôme</h4>
                    <div className="space-y-2">
                      <FilePreviewCard label="CV Binôme" url={selectedApplication.cv_binome} />
                      <FilePreviewCard label="Lettre de motivation Binôme" url={selectedApplication.lettre_motivation_binome} />
                      <FilePreviewCard label="Demande de stage Binôme" url={selectedApplication.demande_stage_binome} />
                    </div>
                  </>
                )}
                  </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Statut:</span>
                  {getStatusBadge(selectedApplication.status)}
                </div>
                <div className="flex gap-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button onClick={() => handleScheduleInterview(selectedApplication)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Proposer un entretien
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
                  
                  {(selectedApplication.status === 'interview_completed' || selectedApplication.status === 'interview_validated') && (
                    <Button 
                      onClick={() => handleAcceptCandidate(selectedApplication)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter candidat → Stagiaire
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

            {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

            {/* Applications List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Demandes de stage</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Gérez les candidatures reçues et prenez les décisions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </CardHeader>
          <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande de stage</p>
            </div>
          ) : (
            <div className="space-y-4">
                              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {application.prenom?.[0]}{application.nom?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-gray-900">
                            {application.prenom} {application.nom}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(application.status)}
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Building className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{application.institut}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">{application.specialite}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">
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

                      {/* Interview Requests Summary */}
                      {application.interview_requests && application.interview_requests.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Demandes d'entretien</span>
                          </div>
                          <div className="space-y-1">
                            {application.interview_requests.map((request) => (
                              <div key={request.id} className="flex items-center justify-between text-sm">
                                <span>{request.tuteur.name} - {request.filiale.name}</span>
                                {getInterviewStatusBadge(request.status)}
                              </div>
                            ))}
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
                            onClick={() => handleScheduleInterview(application)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                      
                      {/* Accept candidate after successful interview */}
                      {(application.status === 'interview_completed' || application.status === 'interview_validated') && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptCandidate(application)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accepter candidat → Stagiaire
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
    </DashboardLayout>
  )
}
