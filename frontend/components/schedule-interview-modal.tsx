"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, FileText, Send, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"

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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.time || !formData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
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
            notes: formData.notes
          })
        : await apiClient.proposeInterview(demandeId, {
            date: formData.date,
            time: formData.time,
            location: formData.location
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
        notes: ''
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
              : `Proposez un entretien pour ${candidateName}. Le tuteur sera notifié pour confirmer sa disponibilité.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Heure *
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lieu *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Adresse ou salle de réunion"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          {mode === 'schedule' && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Informations supplémentaires pour le candidat..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'schedule' ? 'Planification...' : 'Envoi...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {mode === 'schedule' ? 'Planifier' : 'Proposer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
