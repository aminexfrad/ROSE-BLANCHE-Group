/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, UserPlus, Edit, Loader2, AlertCircle } from "lucide-react"
import { apiClient, User as UserType, UserCreateResponse, UserUpdateResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  user?: UserType | null
  onUserCreated?: (user: UserType) => void
  onUserUpdated?: (user: UserType) => void
}

export function UserManagementModal({
  isOpen,
  onClose,
  user,
  onUserCreated,
  onUserUpdated
}: UserManagementModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    nom: "",
    prenom: "",
    role: "stagiaire" as "stagiaire" | "tuteur" | "rh" | "admin",
    telephone: "",
    departement: "",
    institut: "",
    specialite: "",
    bio: ""
  })

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        nom: user.nom || "",
        prenom: user.prenom || "",
        role: (user.role === "candidat" ? "stagiaire" : user.role) || "stagiaire",
        telephone: user.telephone || "",
        departement: user.departement || "",
        institut: user.institut || "",
        specialite: user.specialite || "",
        bio: user.bio || ""
      })
    } else {
      setFormData({
        email: "",
        nom: "",
        prenom: "",
        role: "stagiaire",
        telephone: "",
        departement: "",
        institut: "",
        specialite: "",
        bio: ""
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing && user) {
        const formDataObj = new FormData()
        formDataObj.append('email', formData.email)
        formDataObj.append('nom', formData.nom)
        formDataObj.append('prenom', formData.prenom)
        formDataObj.append('role', formData.role)
        formDataObj.append('telephone', formData.telephone)
        formDataObj.append('departement', formData.departement)
        formDataObj.append('institut', formData.institut)
        formDataObj.append('specialite', formData.specialite)
        formDataObj.append('bio', formData.bio)
        
        const response: UserUpdateResponse = await apiClient.updateUser(user.id, formDataObj)
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        })
        onUserUpdated?.(response)
      } else {
        const formDataObj = new FormData()
        formDataObj.append('email', formData.email)
        formDataObj.append('nom', formData.nom)
        formDataObj.append('prenom', formData.prenom)
        formDataObj.append('role', formData.role)
        formDataObj.append('telephone', formData.telephone)
        formDataObj.append('departement', formData.departement)
        formDataObj.append('institut', formData.institut)
        formDataObj.append('specialite', formData.specialite)
        formDataObj.append('bio', formData.bio)
        
        const response: UserCreateResponse = await apiClient.createUser(formDataObj)
        
        let description = `Utilisateur créé avec succès. Mot de passe: ${response.password}`
        
        // If it's a stagiaire and a stage was created, add that info
        if (formData.role === 'stagiaire' && response.stage_created) {
          description += `\nStage créé automatiquement (ID: ${response.stage_id})`
        } else if (formData.role === 'stagiaire' && !response.stage_created) {
          description += `\n⚠️ Stage non créé: ${response.stage_error || 'Erreur inconnue'}`
        }
        
        toast({
          title: "Succès",
          description: description,
        })
        onUserCreated?.(response)
      }
      onClose()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Modifier l'utilisateur
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Nouvel utilisateur
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations de l'utilisateur"
              : "Créez un nouvel utilisateur dans le système"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleInputChange("prenom", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange("nom", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stagiaire">Stagiaire</SelectItem>
                  <SelectItem value="tuteur">Tuteur</SelectItem>
                  <SelectItem value="rh">Responsable RH</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange("telephone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departement">Département</Label>
              <Input
                id="departement"
                value={formData.departement}
                onChange={(e) => handleInputChange("departement", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institut">Institut</Label>
              <Input
                id="institut"
                value={formData.institut}
                onChange={(e) => handleInputChange("institut", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialite">Spécialité</Label>
            <Input
              id="specialite"
              value={formData.specialite}
              onChange={(e) => handleInputChange("specialite", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 