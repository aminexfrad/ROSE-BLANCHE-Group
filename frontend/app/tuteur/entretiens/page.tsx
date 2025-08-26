'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building, 
  Mail, 
  Phone, 
  GraduationCap,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react'

interface InterviewRequest {
  id: number
  demande: {
    id: number
    candidat: {
      id: number
      prenom: string
      nom: string
      email: string
      telephone: string
      institut: string
      specialite: string
    }
  }
  tuteur: {
    id: number
    name: string
    email: string
  }
  filiale: {
    id: number
    name: string
  }
  proposed_date: string
  proposed_time: string
  location: string
  mode?: 'in_person' | 'online'
  meeting_link?: string
  status: 'PENDING_TUTEUR' | 'VALIDATED' | 'REVISION_REQUESTED'
  suggested_date?: string
  suggested_time?: string
  created_at: string
}

export default function TuteurEntretiensPage() {
  const [interviews, setInterviews] = useState<InterviewRequest[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInterview, setSelectedInterview] = useState<InterviewRequest | null>(null)
  const [responseModalOpen, setResponseModalOpen] = useState(false)
  const [responseInterview, setResponseInterview] = useState<InterviewRequest | null>(null)
  const [action, setAction] = useState<'accept' | 'propose_new_time'>('accept')
  const [suggestedDate, setSuggestedDate] = useState('')
  const [suggestedTime, setSuggestedTime] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInterviews()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [interviews, searchTerm, statusFilter])

  const fetchInterviews = async () => {
    try {
      console.log('Fetching interviews for tuteur...')
      
      // First try the dedicated tuteur interview endpoint
      try {
        const tuteurInterviews = await apiClient.getTuteurInterviewRequests()
        console.log('Tuteur interviews response:', tuteurInterviews)
        
        if (tuteurInterviews.results && tuteurInterviews.results.length > 0) {
          const formattedInterviews = tuteurInterviews.results.map((request: any) => ({
            id: request.id,
            demande: {
              id: request.demande?.id || 0,
              candidat: {
                id: request.demande?.candidat?.id || 0,
                prenom: request.demande?.candidat?.prenom || '',
                nom: request.demande?.candidat?.nom || '',
                email: request.demande?.candidat?.email || '',
                telephone: request.demande?.candidat?.telephone || '',
                institut: request.demande?.candidat?.institut || '',
                specialite: request.demande?.candidat?.specialite || ''
              }
            },
            tuteur: request.tuteur,
            filiale: request.filiale,
            proposed_date: request.proposed_date,
            proposed_time: request.proposed_time,
            location: request.location,
            mode: request.mode,
            meeting_link: request.meeting_link,
            status: request.status,
            suggested_date: request.suggested_date,
            suggested_time: request.suggested_time,
            created_at: request.created_at
          }))
          setInterviews(formattedInterviews)
          return
        }
      } catch (tuteurEndpointError) {
        console.log('Tuteur endpoint not available, falling back to applications...')
      }

      // Fallback: Fetch all applications and extract interview requests for this tuteur
      const response = await apiClient.getApplications()
      console.log('Applications response:', response)
      const allInterviews: InterviewRequest[] = []
      const currentUser = apiClient.getCurrentUser()
      console.log('Current user:', currentUser)
      
      response.results?.forEach((application: any) => {
        if (application.interview_requests) {
          application.interview_requests.forEach((request: any) => {
            console.log('Interview request:', request)
            console.log('Request tuteur ID:', request.tuteur?.id, 'Current user ID:', currentUser?.id)
            
            // Only show interviews assigned to current tuteur
            if (request.tuteur && (request.tuteur.id === currentUser?.id || request.tuteur.email === currentUser?.email)) {
              allInterviews.push({
                id: request.id,
                demande: {
                  id: application.id,
                  candidat: {
                    id: application.candidat?.id || 0,
                    prenom: application.prenom,
                    nom: application.nom,
                    email: application.email,
                    telephone: application.telephone,
                    institut: application.institut,
                    specialite: application.specialite
                  }
                },
                tuteur: request.tuteur,
                filiale: request.filiale,
                proposed_date: request.proposed_date,
                proposed_time: request.proposed_time,
                location: request.location,
                mode: request.mode,
                meeting_link: request.meeting_link,
                status: request.status,
                suggested_date: request.suggested_date,
                suggested_time: request.suggested_time,
                created_at: request.created_at
              })
            }
          })
        }
      })
      
      console.log('Total interviews found:', allInterviews.length)
      setInterviews(allInterviews)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement des entretiens',
        variant: 'destructive'
      })
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.demande.candidat.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.demande.candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.demande.candidat.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter)
    }

    setFilteredInterviews(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente de réponse</Badge>
      case 'VALIDATED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Validé</Badge>
      case 'REVISION_REQUESTED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Révision demandée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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

  const handleRespond = (interview: InterviewRequest, actionType: 'accept' | 'propose_new_time') => {
    setAction(actionType)
    setResponseModalOpen(true)
    setSuggestedDate('')
    setSuggestedTime('')
    setComment('')
    
    // Store the interview data for the response modal (separate from details modal)
    setResponseInterview(interview)
  }

  const handleSubmitResponse = async () => {
    if (!responseInterview) return

    setSubmitting(true)
    try {
      if (action === 'accept') {
        await apiClient.tuteurRespondToInterview(responseInterview.id, 'accept')
        toast({
          title: 'Entretien accepté',
          description: 'L\'entretien a été accepté et le candidat a été notifié.',
          variant: 'default'
        })
      } else {
        if (!suggestedDate || !suggestedTime) {
          toast({
            title: 'Erreur',
            description: 'Veuillez proposer une nouvelle date et heure',
            variant: 'destructive'
          })
          return
        }
        
        await apiClient.tuteurRespondToInterview(responseInterview.id, 'propose_new_time', {
          suggested_date: suggestedDate,
          suggested_time: suggestedTime,
          comment: comment
        })
        toast({
          title: 'Nouvelle proposition envoyée',
          description: 'Votre proposition de nouvelle date a été envoyée au RH.',
          variant: 'default'
        })
      }
      
      setResponseModalOpen(false)
      setResponseInterview(null) // Clear the response interview data
      fetchInterviews() // Refresh the list
    } catch (error) {
      console.error('Error responding to interview:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la réponse à l\'entretien',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
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

  return (
    <DashboardLayout allowedRoles={["tuteur"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entretiens</h1>
            <p className="text-gray-600">Gérez vos entretiens avec les candidats</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total entretiens</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.validated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Révision demandée</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revision}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="PENDING_TUTEUR">En attente</SelectItem>
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
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun entretien trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">
                            {interview.demande.candidat.prenom} {interview.demande.candidat.nom}
                          </h4>
                          {getStatusBadge(interview.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{interview.demande.candidat.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{interview.demande.candidat.institut}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{interview.proposed_date} à {interview.proposed_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{interview.location}</span>
                          </div>
                        </div>

                        {interview.suggested_date && interview.suggested_time && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-sm text-blue-800">
                              <strong>Nouvelle proposition:</strong> {interview.suggested_date} à {interview.suggested_time}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(interview)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                        
                        {interview.status === 'PENDING_TUTEUR' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRespond(interview, 'accept')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accepter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRespond(interview, 'propose_new_time')}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Proposer nouvelle date
                            </Button>
                          </>
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

      {/* Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'accept' ? 'Accepter l\'entretien' : 'Proposer une nouvelle date'}
            </DialogTitle>
            <DialogDescription>
              {action === 'accept' 
                ? `Confirmez que vous acceptez l'entretien avec ${responseInterview?.demande.candidat.prenom} ${responseInterview?.demande.candidat.nom}. Le candidat sera notifié.`
                : `Proposez une nouvelle date et heure pour l'entretien avec ${responseInterview?.demande.candidat.prenom} ${responseInterview?.demande.candidat.nom}.`
              }
            </DialogDescription>
          </DialogHeader>

          {/* Current Interview Details */}
          {responseInterview && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <h4 className="font-medium text-sm mb-2">Entretien actuel:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Date: {responseInterview.proposed_date} à {responseInterview.proposed_time}</div>
                <div>
                  {responseInterview.mode === 'online' ? (
                    <>Mode: En ligne • Lien: <a className="text-blue-600 underline" href={responseInterview.meeting_link} target="_blank" rel="noreferrer">{responseInterview.meeting_link}</a></>
                  ) : (
                    <>Lieu: {responseInterview.location}</>
                  )}
                </div>
              </div>
            </div>
          )}

          {action === 'propose_new_time' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="suggestedDate">Nouvelle date</Label>
                <Input
                  id="suggestedDate"
                  type="date"
                  value={suggestedDate}
                  onChange={(e) => setSuggestedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="suggestedTime">Nouvelle heure</Label>
                <Input
                  id="suggestedTime"
                  type="time"
                  value={suggestedTime}
                  onChange={(e) => setSuggestedTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Je ne suis pas disponible à cette date..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResponseModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitResponse}
              disabled={submitting}
              className={action === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {submitting ? 'Envoi...' : action === 'accept' ? 'Accepter' : 'Proposer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'entretien</DialogTitle>
          </DialogHeader>
          
          {selectedInterview && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informations du candidat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedInterview.demande.candidat.prenom} {selectedInterview.demande.candidat.nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedInterview.demande.candidat.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedInterview.demande.candidat.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{selectedInterview.demande.candidat.institut}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{selectedInterview.demande.candidat.specialite}</span>
                  </div>
                </div>
              </div>

              {/* Interview Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Détails de l'entretien</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date proposée: {selectedInterview.proposed_date} à {selectedInterview.proposed_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedInterview.mode === 'online' ? (
                      <span>Mode: En ligne • Lien: <a className="text-blue-600 underline" href={selectedInterview.meeting_link} target="_blank" rel="noreferrer">{selectedInterview.meeting_link}</a></span>
                    ) : (
                      <span>Lieu: {selectedInterview.location}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Statut: {getStatusBadge(selectedInterview.status)}</span>
                  </div>
                </div>

                {selectedInterview.suggested_date && selectedInterview.suggested_time && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Nouvelle proposition</h4>
                    <div className="text-sm text-blue-800">
                      <div>Date: {selectedInterview.suggested_date} à {selectedInterview.suggested_time}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedInterview.status === 'PENDING_TUTEUR' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRespond(selectedInterview, 'accept')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter l'entretien
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRespond(selectedInterview, 'propose_new_time')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Proposer nouvelle date
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
