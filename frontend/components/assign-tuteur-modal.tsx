/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Users, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Tuteur {
  id: number
  first_name: string
  last_name: string
  email: string
  telephone?: string
  departement?: string
  stagiaires_assignes: number
  disponible: boolean
}

interface AssignTuteurModalProps {
  isOpen: boolean
  onClose: () => void
  stagiaire: {
    id: number
    prenom: string
    nom: string
    email: string
    institut?: string
    specialite?: string
  }
  onSuccess: () => void
}

export function AssignTuteurModal({ isOpen, onClose, stagiaire, onSuccess }: AssignTuteurModalProps) {
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [selectedTuteur, setSelectedTuteur] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchTuteurs()
    }
  }, [isOpen])

  const fetchTuteurs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getRHTuteursDisponibles()
      setTuteurs(response.results || [])
    } catch (err: any) {
      console.error('Error fetching tuteurs:', err)
      setError(err.message || 'Erreur lors du chargement des tuteurs')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTuteur = async () => {
    if (!selectedTuteur) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un tuteur",
        variant: "destructive",
      })
      return
    }

    try {
      setAssigning(true)
      setError(null)
      
      await apiClient.assignerTuteur(stagiaire.id, parseInt(selectedTuteur))
      
      toast({
        title: "Succès",
        description: "Tuteur assigné avec succès",
      })
      
      onSuccess()
      onClose()
      setSelectedTuteur('')
    } catch (err: any) {
      console.error('Error assigning tuteur:', err)
      setError(err.message || 'Erreur lors de l\'assignation du tuteur')
      toast({
        title: "Erreur",
        description: err.message || 'Erreur lors de l\'assignation du tuteur',
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const getDisponibiliteColor = (disponible: boolean, stagiairesAssignes: number) => {
    if (!disponible) return "bg-red-100 text-red-800"
    if (stagiairesAssignes >= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getDisponibiliteText = (disponible: boolean, stagiairesAssignes: number) => {
    if (!disponible) return "Indisponible"
    if (stagiairesAssignes >= 3) return "Charge élevée"
    return "Disponible"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assigner un tuteur
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un tuteur disponible pour assigner à {stagiaire.prenom} {stagiaire.nom}
          </DialogDescription>
        </DialogHeader>

        {/* Informations du stagiaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stagiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nom complet:</span>
                <span>{stagiaire.prenom} {stagiaire.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{stagiaire.email}</span>
              </div>
              {stagiaire.institut && (
                <div className="flex justify-between">
                  <span className="font-medium">Institut:</span>
                  <span>{stagiaire.institut}</span>
                </div>
              )}
              {stagiaire.specialite && (
                <div className="flex justify-between">
                  <span className="font-medium">Spécialité:</span>
                  <span>{stagiaire.specialite}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sélection du tuteur */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sélectionner un tuteur</label>
            <Select value={selectedTuteur} onValueChange={setSelectedTuteur}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choisir un tuteur..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement...
                  </div>
                ) : (
                  tuteurs.map((tuteur) => (
                    <SelectItem key={tuteur.id} value={tuteur.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tuteur.first_name} {tuteur.last_name}</span>
                        <Badge className={getDisponibiliteColor(tuteur.disponible, tuteur.stagiaires_assignes)}>
                          {getDisponibiliteText(tuteur.disponible, tuteur.stagiaires_assignes)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Détails du tuteur sélectionné */}
          {selectedTuteur && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du tuteur</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const tuteur = tuteurs.find(t => t.id.toString() === selectedTuteur)
                  if (!tuteur) return null
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Nom:</span>
                        <span>{tuteur.first_name} {tuteur.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{tuteur.email}</span>
                      </div>
                      {tuteur.telephone && (
                        <div className="flex justify-between">
                          <span className="font-medium">Téléphone:</span>
                          <span>{tuteur.telephone}</span>
                        </div>
                      )}
                      {tuteur.departement && (
                        <div className="flex justify-between">
                          <span className="font-medium">Département:</span>
                          <span>{tuteur.departement}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Stagiaires assignés:</span>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{tuteur.stagiaires_assignes}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Statut:</span>
                        <Badge className={getDisponibiliteColor(tuteur.disponible, tuteur.stagiaires_assignes)}>
                          {getDisponibiliteText(tuteur.disponible, tuteur.stagiaires_assignes)}
                        </Badge>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Avertissement si tuteur indisponible */}
          {selectedTuteur && (() => {
            const tuteur = tuteurs.find(t => t.id.toString() === selectedTuteur)
            if (!tuteur?.disponible) {
              return (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ce tuteur a déjà le maximum de stagiaires assignés (5). 
                    Il ne peut pas accepter de nouveaux stagiaires.
                  </AlertDescription>
                </Alert>
              )
            }
            return null
          })()}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignTuteur} 
            disabled={!selectedTuteur || assigning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Assigner le tuteur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 