"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, FileText, Send, Loader2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface Tuteur {
  id: number
  first_name: string
  last_name: string
  email: string
  telephone?: string
  departement?: string
  stagiaires_assignes: number
  disponible: boolean
  entreprise?: string
}

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  demandeId: number
  candidateName: string
  onSuccess?: () => void
  mode?: 'propose' | 'schedule'
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  demandeId,
  candidateName,
  onSuccess,
  mode = 'propose'
}: ScheduleInterviewModalProps) {
  
  const [formData, setFormData] = useState<{
    date: string
    time: string
    location: string
    mode: 'in_person' | 'online'
    meeting_link: string
    notes: string
    tuteur_id: string
  }>({
    date: '',
    time: '',
    location: '',
    mode: 'in_person',
    meeting_link: '',
    notes: '',
    tuteur_id: ''
  })
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [loadingTuteurs, setLoadingTuteurs] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch available tuteurs when modal opens in propose mode
  useEffect(() => {
    if (isOpen && mode === 'propose') {
      fetchTuteurs()
    }
  }, [isOpen, mode, demandeId])

  const fetchTuteurs = async () => {
    try {
      setLoadingTuteurs(true)
      const response = await apiClient.getAvailableTuteursForDemande(demandeId)
      setTuteurs(response.results || [])
    } catch (error: any) {
      console.error('Error fetching tuteurs:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des tuteurs",
        variant: "destructive"
      })
    } finally {
      setLoadingTuteurs(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'propose' && !formData.tuteur_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un tuteur",
        variant: "destructive"
      })
      return
    }
    
    if (!formData.date || !formData.time || !formData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    if (formData.mode === 'online' && !formData.meeting_link) {
      toast({
        title: "Lien requis",
        description: "Veuillez fournir un lien de réunion pour un entretien en ligne",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const response = mode === 'schedule'
        ? await apiClient.scheduleInterview(demandeId, {
            date: formData.date,
            time: formData.time,
            location: formData.location,
            mode: formData.mode,
            meeting_link: formData.meeting_link,
            notes: formData.notes
          })
        : await apiClient.proposeInterview(demandeId, {
            date: formData.date,
            time: formData.time,
            location: formData.location,
            mode: formData.mode,
            meeting_link: formData.meeting_link,
            tuteur_id: parseInt(formData.tuteur_id)
          })

      toast({
        title: "Succès",
        description: response.message,
      })

      // Reset form
      setFormData({
        date: '',
        time: '',
        location: '',
        mode: 'in_person',
        meeting_link: '',
        notes: '',
        tuteur_id: ''
      })

      // Close modal and refresh data
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error(`Error ${mode === 'schedule' ? 'scheduling' : 'proposing'} interview:`, error)
      toast({
        title: "Erreur",
        description: error.message || (mode === 'schedule' ? "Erreur lors de la planification de l'entretien" : "Erreur lors de l'envoi de la proposition d'entretien"),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

  const getDisponibiliteColor = (disponible: boolean, stagiairesAssignes: number) => {
    if (!disponible) return "bg-red-100 text-red-800"
    if (stagiairesAssignes >= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getDisponibiliteText = (disponible: boolean, stagiairesAssignes: number) => {
    if (!disponible) return "Complet"
    if (stagiairesAssignes >= 3) return `${stagiairesAssignes}/5`
    return "Disponible"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {mode === 'schedule' ? 'Planifier un entretien' : 'Proposer un entretien'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'schedule' 
              ? `Planifiez un entretien pour ${candidateName}. Le candidat et le tuteur seront notifiés.` 
              : `Proposez un entretien pour ${candidateName}. Sélectionnez un tuteur et il sera notifié pour confirmer sa disponibilité.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tuteur Selection - Only in propose mode */}
          {mode === 'propose' && (
            <div className="space-y-2">
              <Label htmlFor="tuteur">Tuteur *</Label>
              <Select value={formData.tuteur_id} onValueChange={(value) => handleInputChange('tuteur_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un tuteur..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingTuteurs ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement des tuteurs...
                    </div>
                  ) : tuteurs.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      Aucun tuteur disponible pour cette filiale
                    </div>
                  ) : (
                    tuteurs.map((tuteur) => (
                      <SelectItem key={tuteur.id} value={tuteur.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{tuteur.first_name} {tuteur.last_name}</span>
                          </div>
                          <Badge className={getDisponibiliteColor(tuteur.disponible, tuteur.stagiaires_assignes)}>
                            {getDisponibiliteText(tuteur.disponible, tuteur.stagiaires_assignes)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {tuteurs.length > 0 && (
                <p className="text-xs text-gray-500">
                  Les tuteurs sont limités à 5 stagiaires maximum
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time">Heure *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Lieu *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Adresse ou salle de réunion"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mode *</Label>
              <Select value={formData.mode} onValueChange={(v) => handleInputChange('mode', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">Présentiel</SelectItem>
                  <SelectItem value="online">En ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.mode === 'online' && (
              <div>
                <Label htmlFor="meeting_link">Lien de réunion *</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link}
                  onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                  placeholder="https://teams.microsoft.com/..."
                  disabled={loading}
                  required={formData.mode === 'online'}
                />
              </div>
            )}
          </div>

          {mode === 'schedule' && (
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informations supplémentaires pour le candidat..."
                disabled={loading}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || (mode === 'propose' && !formData.tuteur_id)}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'schedule' ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Planifier
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Proposer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
