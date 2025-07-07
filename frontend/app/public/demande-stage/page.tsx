"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Upload, Send, CheckCircle, AlertCircle, Loader2, User, Building, Calendar, FileText, BookOpen, Home, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import Link from "next/link"

interface FormData {
  // Candidat principal
  nom: string
  prenom: string
  email: string
  telephone: string
  cin: string
  institut: string
  specialite: string
  typeStage: string
  niveau: string
  pfeReference: string
  dateDebut: string
  dateFin: string

  // Candidat binôme (optionnel)
  stageBinome: boolean
  nomBinome: string
  prenomBinome: string
  emailBinome: string
  telephoneBinome: string
  cinBinome: string

  // Documents - Candidat principal
  cv: File | null
  lettreMotivation: File | null
  demandeStage: File | null

  // Documents - Binôme (optionnel)
  cvBinome: File | null
  lettreMotivationBinome: File | null
  demandeStageBinome: File | null
}

export default function DemandeStage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
    institut: "",
    specialite: "",
    typeStage: "",
    niveau: "",
    pfeReference: "",
    dateDebut: "",
    dateFin: "",
    stageBinome: false,
    nomBinome: "",
    prenomBinome: "",
    emailBinome: "",
    telephoneBinome: "",
    cinBinome: "",
    cv: null,
    lettreMotivation: null,
    demandeStage: null,
    cvBinome: null,
    lettreMotivationBinome: null,
    demandeStageBinome: null,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add basic fields
      submitData.append('nom', formData.nom)
      submitData.append('prenom', formData.prenom)
      submitData.append('email', formData.email)
      submitData.append('telephone', formData.telephone)
      submitData.append('cin', formData.cin)
      submitData.append('institut', formData.institut)
      submitData.append('specialite', formData.specialite)
      submitData.append('type_stage', formData.typeStage)
      submitData.append('niveau', formData.niveau)
      submitData.append('pfe_reference', formData.pfeReference)
      submitData.append('date_debut', formData.dateDebut)
      submitData.append('date_fin', formData.dateFin)
      submitData.append('stage_binome', formData.stageBinome.toString())
      
      // Debug: Log the form data
      console.log('Form data being sent:', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        cin: formData.cin,
        institut: formData.institut,
        specialite: formData.specialite,
        type_stage: formData.typeStage,
        niveau: formData.niveau,
        pfe_reference: formData.pfeReference,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        stage_binome: formData.stageBinome
      })
      
      // Add binôme fields if applicable
      if (formData.stageBinome) {
        submitData.append('nom_binome', formData.nomBinome)
        submitData.append('prenom_binome', formData.prenomBinome)
        submitData.append('email_binome', formData.emailBinome)
        submitData.append('telephone_binome', formData.telephoneBinome)
        submitData.append('cin_binome', formData.cinBinome)
      }
      
      // Add candidate files
      if (formData.cv) {
        submitData.append('cv', formData.cv)
      }
      if (formData.lettreMotivation) {
        submitData.append('lettre_motivation', formData.lettreMotivation)
      }
      if (formData.demandeStage) {
        submitData.append('demande_stage', formData.demandeStage)
      }
      
      // Add binôme files if applicable
      if (formData.stageBinome) {
        if (formData.cvBinome) {
          submitData.append('cv_binome', formData.cvBinome)
        }
        if (formData.lettreMotivationBinome) {
          submitData.append('lettre_motivation_binome', formData.lettreMotivationBinome)
        }
        if (formData.demandeStageBinome) {
          submitData.append('demande_stage_binome', formData.demandeStageBinome)
        }
      }
      
      // Submit to API
      await apiClient.createApplication(submitData)
      
      toast({
        title: "Succès !",
        description: "Votre demande de stage a été soumise avec succès. Un résumé PDF a été envoyé aux RH avec tous vos documents.",
      })
      
      // Redirect to confirmation page
      setTimeout(() => {
        router.push('/public/demande-stage/confirmation')
      }, 2000)
    } catch (error: any) {
      console.error('Error submitting application:', error)
      // Log the full error response
      if (error.message) {
        console.error('Error message:', error.message)
      }
      toast({
        title: "Erreur",
        description: error.message || "Échec de la soumission de la demande. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.nom && formData.prenom && formData.email && formData.telephone && formData.cin
      case 2:
        return formData.institut && formData.specialite && formData.typeStage && formData.niveau
      case 3:
        return formData.dateDebut && formData.dateFin
      case 4:
        return formData.cv && formData.lettreMotivation && formData.demandeStage
      case 5:
        // Validate binôme documents if stage is in binôme
        if (formData.stageBinome) {
          return formData.cvBinome && formData.lettreMotivationBinome && formData.demandeStageBinome
        }
        return true
      default:
        return false
    }
  }

  const isPFEStage = formData.typeStage === 'Stage PFE' || formData.typeStage === 'Stage de Fin d\'Études'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Single navigation button */}
          <div className="flex justify-start mb-8">
            <Link href="/public">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 cursor-pointer hover:text-red-600 transition-colors duration-300">
              <span className="text-gray-900">Demande de</span> <span className="text-red-600">Stage</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Complétez votre demande de stage en 5 étapes simples et commencez votre parcours professionnel
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Étape {currentStep} sur 5</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% Terminé</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                {currentStep === 1 && <User className="h-6 w-6 text-red-600" />}
                {currentStep === 2 && <Building className="h-6 w-6 text-red-600" />}
                {currentStep === 3 && <Calendar className="h-6 w-6 text-red-600" />}
                {currentStep === 4 && <FileText className="h-6 w-6 text-red-600" />}
                {currentStep === 5 && <User className="h-6 w-6 text-red-600" />}
                {currentStep === 1 && 'Informations Personnelles'}
                {currentStep === 2 && 'Informations Académiques'}
                {currentStep === 3 && 'Détails du Stage'}
                {currentStep === 4 && 'Documents du Candidat'}
                {currentStep === 5 && 'Documents du Binôme'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {currentStep === 1 && 'Veuillez fournir vos informations personnelles'}
                {currentStep === 2 && 'Parlez-nous de votre formation académique'}
                {currentStep === 3 && 'Spécifiez les détails de votre stage'}
                {currentStep === 4 && 'Téléchargez vos documents (PDF uniquement)'}
                {currentStep === 5 && 'Téléchargez les documents du binôme (si applicable)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nom">Nom de famille *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Entrez votre nom de famille"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Entrez votre prénom"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Entrez votre adresse email"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Numéro de téléphone *</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="Entrez votre numéro de téléphone"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cin">CIN *</Label>
                    <Input
                      id="cin"
                      value={formData.cin}
                      onChange={(e) => handleInputChange('cin', e.target.value)}
                      placeholder="Entrez votre numéro CIN"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="institut">Établissement *</Label>
                    <Input
                      id="institut"
                      value={formData.institut}
                      onChange={(e) => handleInputChange('institut', e.target.value)}
                      placeholder="Entrez le nom de votre établissement"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialite">Spécialité *</Label>
                    <Input
                      id="specialite"
                      value={formData.specialite}
                      onChange={(e) => handleInputChange('specialite', e.target.value)}
                      placeholder="Entrez votre spécialité"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="typeStage">Type de Stage *</Label>
                    <Select value={formData.typeStage} onValueChange={(value) => handleInputChange('typeStage', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Sélectionnez le type de stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stage PFE">Stage PFE</SelectItem>
                        <SelectItem value="Stage d'Été">Stage d'Été</SelectItem>
                        <SelectItem value="Stage d'Observation">Stage d'Observation</SelectItem>
                        <SelectItem value="Stage de Fin d'Études">Stage de Fin d'Études</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="niveau">Niveau *</Label>
                    <Input
                      id="niveau"
                      value={formData.niveau}
                      onChange={(e) => handleInputChange('niveau', e.target.value)}
                      placeholder="Entrez votre niveau (ex: Licence 3, Master 1, etc.)"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  {isPFEStage && (
                    <div>
                      <Label htmlFor="pfeReference" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-red-600" />
                        Référence du Projet PFE *
                      </Label>
                      <Input
                        id="pfeReference"
                        value={formData.pfeReference}
                        onChange={(e) => handleInputChange('pfeReference', e.target.value)}
                        placeholder="Entrez la référence du projet choisi dans le PFE Book"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Consultez le <a href="/public/pfe-book" className="text-red-600 hover:underline font-medium">PFE Book</a> pour choisir votre projet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Internship Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="dateDebut">Date de début *</Label>
                      <Input
                        id="dateDebut"
                        type="date"
                        value={formData.dateDebut}
                        onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateFin">Date de fin *</Label>
                      <Input
                        id="dateFin"
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => handleInputChange('dateFin', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
                    <Checkbox
                      id="stageBinome"
                      checked={formData.stageBinome}
                      onCheckedChange={(checked) => handleInputChange('stageBinome', checked)}
                      className="text-red-600"
                    />
                    <Label htmlFor="stageBinome" className="text-gray-700 font-medium">Il s'agit d'un stage en équipe (binôme)</Label>
                  </div>
                  
                  {formData.stageBinome && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <div>
                        <Label htmlFor="nomBinome">Nom du partenaire *</Label>
                        <Input
                          id="nomBinome"
                          value={formData.nomBinome}
                          onChange={(e) => handleInputChange('nomBinome', e.target.value)}
                          placeholder="Nom du partenaire"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prenomBinome">Prénom du partenaire *</Label>
                        <Input
                          id="prenomBinome"
                          value={formData.prenomBinome}
                          onChange={(e) => handleInputChange('prenomBinome', e.target.value)}
                          placeholder="Prénom du partenaire"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emailBinome">Email du partenaire *</Label>
                        <Input
                          id="emailBinome"
                          type="email"
                          value={formData.emailBinome}
                          onChange={(e) => handleInputChange('emailBinome', e.target.value)}
                          placeholder="Email du partenaire"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telephoneBinome">Téléphone du partenaire</Label>
                        <Input
                          id="telephoneBinome"
                          value={formData.telephoneBinome}
                          onChange={(e) => handleInputChange('telephoneBinome', e.target.value)}
                          placeholder="Téléphone du partenaire"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cinBinome">CIN du partenaire</Label>
                        <Input
                          id="cinBinome"
                          value={formData.cinBinome}
                          onChange={(e) => handleInputChange('cinBinome', e.target.value)}
                          placeholder="CIN du partenaire"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Candidate Documents Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 text-lg">Documents du Candidat Principal</h3>
                    <p className="text-sm text-blue-700">Tous les documents doivent être au format PDF uniquement (max 10MB chacun)</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="cv">CV/Resume *</Label>
                    <div className="mt-2">
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="lettreMotivation">Lettre de motivation *</Label>
                    <div className="mt-2">
                      <Input
                        id="lettreMotivation"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('lettreMotivation', e.target.files?.[0] || null)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="demandeStage">Formulaire de demande de stage *</Label>
                    <div className="mt-2">
                      <Input
                        id="demandeStage"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('demandeStage', e.target.files?.[0] || null)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Binôme Documents Upload */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {formData.stageBinome ? (
                    <>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-2 text-lg">Documents du Binôme</h3>
                        <p className="text-sm text-green-700">Tous les documents doivent être au format PDF uniquement (max 10MB chacun)</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="cvBinome">CV/Resume du binôme *</Label>
                        <div className="mt-2">
                          <Input
                            id="cvBinome"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange('cvBinome', e.target.files?.[0] || null)}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                          <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="lettreMotivationBinome">Lettre de motivation du binôme *</Label>
                        <div className="mt-2">
                          <Input
                            id="lettreMotivationBinome"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange('lettreMotivationBinome', e.target.files?.[0] || null)}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                          <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="demandeStageBinome">Formulaire de demande de stage du binôme *</Label>
                        <div className="mt-2">
                          <Input
                            id="demandeStageBinome"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange('demandeStageBinome', e.target.files?.[0] || null)}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                          <p className="text-sm text-gray-500 mt-1">Format accepté : PDF uniquement</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun binôme requis</h3>
                      <p className="text-gray-600 max-w-md mx-auto">Vous avez indiqué que ce n'est pas un stage en binôme. Vous pouvez passer à la soumission de votre demande.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  Précédent
                </Button>
                
                {currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(currentStep) || submitting}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Soumission en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Soumettre la demande
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
