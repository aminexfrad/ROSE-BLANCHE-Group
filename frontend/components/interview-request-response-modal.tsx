"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Check, Clock4, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface InterviewRequestResponseModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: number
  candidateName: string
  proposedDate: string
  proposedTime: string
  location: string
  onSuccess?: () => void
}

export function InterviewRequestResponseModal({
  isOpen,
  onClose,
  requestId,
  candidateName,
  proposedDate,
  proposedTime,
  location,
  onSuccess
}: InterviewRequestResponseModalProps) {
  const [action, setAction] = useState<'accept' | 'propose_new_time' | null>(null)
  const [comment, setComment] = useState('')
  const [suggestedDate, setSuggestedDate] = useState('')
  const [suggestedTime, setSuggestedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!action) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une action",
        variant: "destructive"
      })
      return
    }

    if (action === 'propose_new_time' && (!suggestedDate || !suggestedTime)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir la nouvelle date et heure",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const payload: any = {
        action,
        comment
      }

      if (action === 'propose_new_time') {
        payload.suggested_date = suggestedDate
        payload.suggested_time = suggestedTime
      }

      await apiClient.respondToInterviewRequest(requestId, payload)

      toast({
        title: "Succès",
        description: action === 'accept' 
          ? "Entretien accepté. Le candidat a été notifié." 
          : "Nouvelle proposition envoyée au RH.",
      })

      // Reset form
      setAction(null)
      setComment('')
      setSuggestedDate('')
      setSuggestedTime('')

      // Close modal and refresh data
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error responding to interview request:', error)
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la réponse à la demande d'entretien",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setAction(null)
      setComment('')
      setSuggestedDate('')
      setSuggestedTime('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Répondre à la demande d'entretien
          </DialogTitle>
          <DialogDescription>
            Répondez à la demande d'entretien pour {candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Détails de la proposition</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Date: {proposedDate}</div>
            <div>Heure: {proposedTime}</div>
            <div>Lieu: {location}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={action === 'accept' ? 'default' : 'outline'}
                onClick={() => setAction('accept')}
                className="flex-1"
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-2" />
                Accepter
              </Button>
              <Button
                type="button"
                variant={action === 'propose_new_time' ? 'default' : 'outline'}
                onClick={() => setAction('propose_new_time')}
                className="flex-1"
                disabled={loading}
              >
                <Clock4 className="h-4 w-4 mr-2" />
                Proposer un autre créneau
              </Button>
            </div>
          </div>

          {action === 'propose_new_time' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="suggested-date">Nouvelle date</Label>
                  <Input
                    id="suggested-date"
                    type="date"
                    value={suggestedDate}
                    onChange={(e) => setSuggestedDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="suggested-time">Nouvelle heure</Label>
                  <Input
                    id="suggested-time"
                    type="time"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajoutez un commentaire si nécessaire..."
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !action}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === 'accept' ? 'Accepter' : action === 'propose_new_time' ? 'Proposer' : 'Confirmer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
