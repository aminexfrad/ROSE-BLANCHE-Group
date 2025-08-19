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

interface RHProposalResponseModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: number
  candidateName: string
  suggestedDate: string
  suggestedTime: string
  originalDate: string
  originalTime: string
  location: string
  tuteurComment?: string
  onSuccess?: () => void
}

export function RHProposalResponseModal({
  isOpen,
  onClose,
  requestId,
  candidateName,
  suggestedDate,
  suggestedTime,
  originalDate,
  originalTime,
  location,
  tuteurComment,
  onSuccess
}: RHProposalResponseModalProps) {
  const [action, setAction] = useState<'accept' | 'modify' | null>(null)
  const [comment, setComment] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
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

    if (action === 'modify' && (!newDate || !newTime)) {
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

      if (action === 'modify') {
        payload.new_date = newDate
        payload.new_time = newTime
      }

      await apiClient.rhRespondToProposal(requestId, payload)

      toast({
        title: "Succès",
        description: action === 'accept' 
          ? "Proposition acceptée. Le candidat a été notifié." 
          : "Nouvelle proposition envoyée au tuteur.",
      })

      // Reset form
      setAction(null)
      setComment('')
      setNewDate('')
      setNewTime('')

      // Close modal and refresh data
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error responding to proposal:', error)
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la réponse à la proposition",
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
      setNewDate('')
      setNewTime('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Répondre à la proposition du tuteur
          </DialogTitle>
          <DialogDescription>
            Répondez à la proposition du tuteur pour {candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Proposition du tuteur</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Créneau original:</span> {originalDate} à {originalTime}</div>
            <div><span className="font-medium">Nouvelle proposition:</span> {suggestedDate} à {suggestedTime}</div>
            <div><span className="font-medium">Lieu:</span> {location}</div>
            {tuteurComment && (
              <div><span className="font-medium">Commentaire:</span> {tuteurComment}</div>
            )}
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
                variant={action === 'modify' ? 'default' : 'outline'}
                onClick={() => setAction('modify')}
                className="flex-1"
                disabled={loading}
              >
                <Clock4 className="h-4 w-4 mr-2" />
                Proposer un autre créneau
              </Button>
            </div>
          </div>

          {action === 'modify' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-date">Nouvelle date</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="new-time">Nouvelle heure</Label>
                  <Input
                    id="new-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
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
              {action === 'accept' ? 'Accepter' : action === 'modify' ? 'Proposer' : 'Confirmer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
