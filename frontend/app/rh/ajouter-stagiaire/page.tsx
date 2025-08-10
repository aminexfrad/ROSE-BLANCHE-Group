/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface StagiaireFormData {
  prenom: string
  nom: string
  email: string
  telephone: string
  institut: string
  specialite: string
  niveau: string
  type_stage: string
  date_debut: string
  date_fin: string
  description: string
}

export default function RHAjouterStagiairePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdStagiaire, setCreatedStagiaire] = useState<any>(null)
  const [formData, setFormData] = useState<StagiaireFormData>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    institut: "",
    specialite: "",
    niveau: "",
    type_stage: "",
    date_debut: "",
    date_fin: "",
    description: ""
  })

  const breadcrumbs = [
            { label: "Responsable RH", href: "/rh" },
    { label: "Ajouter Stagiaire" }
  ]

  const handleInputChange = (field: keyof StagiaireFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation basique
    if (!formData.prenom || !formData.nom || !formData.email) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Appeler l'API pour créer directement le stagiaire
      const result = await apiClient.creerStagiaire(formData)

      toast({
        title: "Succès",
        description: `Stagiaire ${result.stagiaire.prenom} ${result.stagiaire.nom} créé avec succès.`,
      })

      setCreatedStagiaire(result.stagiaire)
      setSuccess(true)
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        institut: "",
        specialite: "",
        niveau: "",
        type_stage: "",
        date_debut: "",
        date_fin: "",
        description: ""
      })

    } catch (err: any) {
      console.error('Error adding stagiaire:', err)
      setError(err.message || 'Erreur lors de l\'ajout du stagiaire')
      toast({
        title: "Erreur",
        description: err.message || 'Erreur lors de l\'ajout du stagiaire',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success && createdStagiaire) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Stagiaire créé avec succès !</h2>
              <p className="text-gray-600">Le stagiaire a été créé et peut maintenant se connecter à la plateforme.</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Informations de connexion
                </CardTitle>
                <CardDescription>
                  Transmettez ces informations au stagiaire pour qu'il puisse se connecter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nom complet</Label>
                    <p className="text-lg font-semibold">{createdStagiaire.prenom} {createdStagiaire.nom}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-lg font-semibold text-blue-600">{createdStagiaire.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mot de passe temporaire</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded border">{createdStagiaire.password}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(createdStagiaire.password);
                          toast({
                            title: "Copié !",
                            description: "Mot de passe copié dans le presse-papiers",
                          });
                        }}
                      >
                        Copier
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ID Stagiaire</Label>
                    <p className="text-lg font-semibold">#{createdStagiaire.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Link href="/rh/stagiaires">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voir tous les stagiaires
                </Button>
              </Link>
              <Button onClick={() => {
                setSuccess(false)
                setCreatedStagiaire(null)
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un autre stagiaire
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter un Stagiaire</h1>
            <p className="text-gray-600 mt-1">Créez un nouveau compte stagiaire et assignez-le à un stage</p>
          </div>
          <Link href="/rh/stagiaires">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux stagiaires
            </Button>
          </Link>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informations du Stagiaire
            </CardTitle>
            <CardDescription>
              Remplissez les informations du stagiaire. Un compte sera créé automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    placeholder="Prénom du stagiaire"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Nom du stagiaire"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              {/* Informations académiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="institut">Institut *</Label>
                  <Input
                    id="institut"
                    value={formData.institut}
                    onChange={(e) => handleInputChange('institut', e.target.value)}
                    placeholder="Nom de l'institut"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialite">Spécialité *</Label>
                  <Input
                    id="specialite"
                    value={formData.specialite}
                    onChange={(e) => handleInputChange('specialite', e.target.value)}
                    placeholder="Spécialité d'étude"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niveau">Niveau *</Label>
                  <Select value={formData.niveau} onValueChange={(value) => handleInputChange('niveau', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Licence">Licence</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Doctorat">Doctorat</SelectItem>
                      <SelectItem value="Ingénieur">Ingénieur</SelectItem>
                      <SelectItem value="BTS">BTS</SelectItem>
                      <SelectItem value="DUT">DUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_stage">Type de Stage *</Label>
                  <Select value={formData.type_stage} onValueChange={(value) => handleInputChange('type_stage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stage PFE">Stage PFE</SelectItem>
                      <SelectItem value="Stage d'Été">Stage d'Été</SelectItem>
                      <SelectItem value="Stage d'Observation">Stage d'Observation</SelectItem>
                      <SelectItem value="Stage de Fin d'Études">Stage de Fin d'Études</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates du stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date_debut">Date de début *</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => handleInputChange('date_debut', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_fin">Date de fin *</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => handleInputChange('date_fin', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description du stage</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description du stage, objectifs, missions..."
                  rows={4}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                                            className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Créer le stagiaire
                    </>
                  )}
                </Button>
                <Link href="/rh/stagiaires">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 