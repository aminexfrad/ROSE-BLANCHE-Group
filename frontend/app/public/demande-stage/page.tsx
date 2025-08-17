/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Upload, Send, CheckCircle, AlertCircle, Loader2, User, Building, Calendar, FileText, BookOpen, Home, ArrowLeft, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api"
import Link from "next/link"

interface FormData {
  // Candidat principal
  nom: string
  prenom: string
  email: string
  telephone: string
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
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [isPrefilledFromOffer, setIsPrefilledFromOffer] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedOfferIds, setSelectedOfferIds] = useState<number[]>([])
  const [selectedOfferReferences, setSelectedOfferReferences] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  

  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
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
    cv: null,
    lettreMotivation: null,
    demandeStage: null,
    cvBinome: null,
    lettreMotivationBinome: null,
    demandeStageBinome: null,
  })
  
  const isPFEStage = formData.typeStage === 'Stage PFE'
  

  
  // Handle URL parameters to pre-fill form data from PFE book
  useEffect(() => {
    const type = searchParams.get('type');
    const pfeReference = searchParams.get('pfeReference');
    
    if (type === 'PFE' && pfeReference) {
      // Set the stage type to PFE
      setFormData(prev => ({
        ...prev,
        typeStage: 'Stage PFE',
        pfeReference: pfeReference,
      }));
      setIsPrefilledFromOffer(true);
      
      // Set the reference for the selected offer
      setSelectedOfferReferences([pfeReference]);
      
      // Clear any offer IDs since we're using pfe_reference
      setSelectedOfferIds([]);
      return;
    }
    
    // fallback: clear
    setSelectedOfferReferences([]);
    setSelectedOfferIds([]);
    setIsPrefilledFromOffer(false);
  }, [searchParams, toast]);

  // Pre-fill form with user/candidat profile if authenticated
  useEffect(() => {
    const prefillFromProfile = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, user not authenticated');
          return;
        }

        // Token is already in localStorage, no need to set it in apiClient
        console.log('Token found, user authenticated');

        // Try to get candidat profile first (since this is for stage requests)
        try {
          const candidatProfile = await apiClient.getCandidatProfile();
          console.log('Candidat profile found:', candidatProfile);
          
          setFormData(prev => ({
            ...prev,
            nom: candidatProfile.user.nom || prev.nom,
            prenom: candidatProfile.user.prenom || prev.prenom,
            email: candidatProfile.user.email || prev.email,
            telephone: candidatProfile.user.telephone || prev.telephone,
            institut: candidatProfile.institut || prev.institut,
            specialite: candidatProfile.specialite || prev.specialite,
            niveau: candidatProfile.niveau || prev.niveau,
          }));
          
          // Mark as authenticated
          setIsAuthenticated(true);
          setIsProfileLoaded(true);
          console.log('Form pre-filled with candidat profile');
          
        } catch (candidatError) {
          console.log('Candidat profile fetch failed, trying user profile:', candidatError);
          
          // If candidat profile fails, try regular user profile
          try {
            const profile = await apiClient.getProfile();
            setFormData(prev => ({
              ...prev,
              nom: profile.nom || prev.nom,
              prenom: profile.prenom || prev.prenom,
              email: profile.email || prev.email,
              telephone: profile.telephone || prev.telephone,
              institut: profile.institut || prev.institut,
              specialite: profile.specialite || prev.specialite,
              // niveau is not available in user profile, keep existing value
            }));
            console.log('Form pre-filled with user profile:', profile);
          } catch (profileError) {
            console.log('User profile also failed:', profileError);
          }
        }
      } catch (error) {
        console.log('Authentication check failed:', error);
      }
    };

    prefillFromProfile();
  }, []);




  const [errors, setErrors] = useState({
    nom: false,
    prenom: false,
    email: false,
    telephone: false,
    institut: false,
    specialite: false,
    typeStage: false,
    niveau: false,
    pfeReference: false,
  })

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setErrors(prev => ({ ...prev, [field]: false }))
  }

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const nextStep = () => {
    if (currentStep === 1) {
      const newErrors = {
        nom: formData.nom.trim() === '',
        prenom: formData.prenom.trim() === '',
        email: formData.email.trim() === '',
        telephone: formData.telephone.trim() === '',
        institut: false,
        specialite: false,
        typeStage: false,
        niveau: false,
        pfeReference: false,
      }
      setErrors(newErrors)
      if (Object.values(newErrors).some(Boolean)) return
    }
    if (currentStep === 2) {
      const newErrors = {
        nom: false,
        prenom: false,
        email: false,
        telephone: false,
        institut: formData.institut.trim() === '',
        specialite: formData.specialite.trim() === '',
        typeStage: formData.typeStage === '',
        niveau: formData.niveau.trim() === '',
        // Only require pfeReference for single-offer PFE
        pfeReference: isPFEStage && selectedOfferIds.length <= 1 && formData.pfeReference.trim() === '',
      }
      setErrors(newErrors)
      if (Object.values(newErrors).some(Boolean)) return
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateFile = (file: File | null): boolean => {
    if (!file) return false
    if (file.size > 10 * 1024 * 1024) return false // 10MB limit
    if (file.type !== 'application/pdf') return false
    return true
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError(null)
      
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add basic fields
      submitData.append('nom', formData.nom)
      submitData.append('prenom', formData.prenom)
      submitData.append('email', formData.email)
      submitData.append('telephone', formData.telephone)
      submitData.append('institut', formData.institut)
      submitData.append('specialite', formData.specialite)
      submitData.append('type_stage', formData.typeStage)
      submitData.append('niveau', formData.niveau)
      submitData.append('date_debut', formData.dateDebut)
      submitData.append('date_fin', formData.dateFin)
      submitData.append('stage_binome', formData.stageBinome.toString())
      
      // Add binôme fields if applicable
      if (formData.stageBinome) {
        submitData.append('nom_binome', formData.nomBinome)
        submitData.append('prenom_binome', formData.prenomBinome)
        submitData.append('email_binome', formData.emailBinome)
        submitData.append('telephone_binome', formData.telephoneBinome)
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
      
      // Debug: Log current state
      console.log('🔍 Debug state:', {
        isPrefilledFromOffer,
        formData_pfeReference: formData.pfeReference,
        selectedOfferIds,
        typeStage: formData.typeStage
      })
      
      // Add offer_ids for grouped PFE or pfe_reference for single-offer PFE
      if (isPrefilledFromOffer && formData.pfeReference) {
        // When offer is pre-selected from PFE Book, send only pfe_reference
        submitData.append('pfe_reference', formData.pfeReference)
        console.log('🔍 Adding pfe_reference for PFE Book selection:', formData.pfeReference)
      } else if (selectedOfferIds.length > 0 && selectedOfferIds[0] !== 1) {
        // For manually selected offers (not our dummy ID), send offer_ids
        selectedOfferIds.forEach(id => submitData.append('offer_ids', id.toString()))
        console.log('🔍 Adding offer_ids:', selectedOfferIds)
      } else if (formData.pfeReference) {
        // Fallback: send pfe_reference if available
        submitData.append('pfe_reference', formData.pfeReference)
        console.log('🔍 Adding pfe_reference (fallback):', formData.pfeReference)
      } else {
        console.log('🔍 No offer information found!')
      }
      
      // Debug: Log all FormData contents
      console.log('🔍 FormData contents:')
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}: ${value}`)
      }
      
      // Submit to API
      console.log('Submitting form data:', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        institut: formData.institut,
        specialite: formData.specialite,
        type_stage: formData.typeStage,
        niveau: formData.niveau,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        stage_binome: formData.stageBinome,
        selectedOfferIds,
        pfeReference: formData.pfeReference
      })
      
      await apiClient.createApplication(submitData)
      
      toast({
        title: "Succès !",
        description: "Votre demande de stage a été soumise avec succès. Un résumé PDF a été envoyé aux RH avec tous vos documents.",
      })
      
      // Save form data to localStorage for confirmation page
      localStorage.setItem("demande_confirmation", JSON.stringify(formData));
      // Redirect to confirmation page
      setTimeout(() => {
        router.push('/public/demande-stage/confirmation')
      }, 2000)
    } catch (error: any) {
      console.error('Full error object:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      console.error('Error status:', error.status)
      
      let errorMsg = error.message || "Échec de la soumission de la demande. Veuillez réessayer."
      
      // Try to extract detailed validation errors if present
      if (error.response && typeof error.response === 'object') {
        if (Array.isArray(error.response)) {
          errorMsg = error.response.join(' ')
        } else if (typeof error.response === 'object') {
          errorMsg = Object.values(error.response).flat().join(' ')
        }
      }
      
      // Check for specific error types
      if (error.message?.includes('Erreur serveur')) {
        errorMsg = "Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer."
      } else if (error.status === 500) {
        errorMsg = "Erreur interne du serveur. Veuillez réessayer plus tard."
      } else if (error.status === 400) {
        errorMsg = "Données invalides. Veuillez vérifier vos informations et réessayer."
      } else if (error.status === 401) {
        errorMsg = "Session expirée. Veuillez vous reconnecter."
      }
      
      setFormError(errorMsg)
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive",
      })
      console.error('API Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.nom.trim() !== '' && 
               formData.prenom.trim() !== '' && 
               validateEmail(formData.email) && 
               formData.telephone.trim() !== ''
      case 2:
        const basicValidation = formData.institut.trim() !== '' && 
                               formData.specialite.trim() !== '' && 
                               formData.typeStage !== '' && 
                               formData.niveau.trim() !== ''
        // For grouped PFE, do NOT require pfeReference
        if (isPFEStage && selectedOfferIds.length > 1) {
          return basicValidation
        }
        // For single-offer PFE, require pfeReference
        if (isPFEStage) {
          return basicValidation && formData.pfeReference.trim() !== ''
        }
        // For non-PFE, do NOT require pfeReference
        return basicValidation
      case 3:
        const dateValidation = formData.dateDebut !== '' && formData.dateFin !== ''
        if (!formData.stageBinome) {
          // For non-binôme, do NOT require binôme fields
          return dateValidation
        }
        // If stage is in binôme, validate binôme fields
        return dateValidation && 
               formData.nomBinome.trim() !== '' && 
               formData.prenomBinome.trim() !== '' && 
               validateEmail(formData.emailBinome) &&
               formData.telephoneBinome.trim() !== ''
      case 4:
        return validateFile(formData.cv) && 
               validateFile(formData.lettreMotivation) && 
               validateFile(formData.demandeStage)
      case 5:
        // Validate binôme documents if stage is in binôme
        if (formData.stageBinome) {
          return validateFile(formData.cvBinome) && 
                 validateFile(formData.lettreMotivationBinome) && 
                 validateFile(formData.demandeStageBinome)
        }
        // For non-binôme, do NOT require binôme documents
        return true
      default:
        return false
    }
  }

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
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 cursor-pointer hover:text-red-600 transition-colors duration-300">
              <span className="text-gray-900">Demande de</span> <span className="text-red-600">Stage</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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

          {/* Authenticated user indicator */}
          {isAuthenticated && isProfileLoaded && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Connecté en tant que candidat</h3>
                  <p className="text-sm text-blue-700">
                    Vos informations personnelles ont été pré-remplies automatiquement. 
                    Vous pouvez maintenant vous concentrer sur les fichiers à télécharger.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-filled from offer indicator */}
          {isPrefilledFromOffer && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Formulaire pré-rempli</h3>
                  <p className="text-sm text-green-700">
                    Certains champs ont été automatiquement remplis depuis l'offre sélectionnée. 
                    Vous pouvez toujours modifier les autres informations selon vos besoins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message display */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Erreur lors de la soumission</h3>
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              </div>
            </div>
          )}

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
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.nom ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Entrez votre prénom"
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.prenom ? 'border-red-500 ring-2 ring-red-200' : ''}`}
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
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.email ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Numéro de téléphone *</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="Entrez votre numéro de téléphone"
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.telephone ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* PFE Offer Information */}
                  {isPrefilledFromOffer && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Offre PFE Sélectionnée</h3>
                          <p className="text-sm text-green-700">
                            Vous postulez pour l'offre : <strong>{formData.pfeReference}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Institut */}
                  <div>
                    <Label htmlFor="institut">Institut *</Label>
                    <Input
                      id="institut"
                      value={formData.institut}
                      onChange={(e) => handleInputChange('institut', e.target.value)}
                      placeholder="Entrez le nom de votre établissement"
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.institut ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                  {/* Spécialité */}
                  <div>
                    <Label htmlFor="specialite">Spécialité *</Label>
                    <Input
                      id="specialite"
                      value={formData.specialite}
                      onChange={(e) => handleInputChange('specialite', e.target.value)}
                      placeholder="Entrez votre spécialité"
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.specialite ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                  {/* Type de Stage */}
                  <div>
                    <Label htmlFor="typeStage" className="flex items-center gap-2">
                      Type de Stage *
                      {isPrefilledFromOffer && formData.typeStage === 'Stage PFE' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Pré-rempli
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={formData.typeStage}
                      onValueChange={(value) => handleInputChange('typeStage', value)}
                      disabled={isPrefilledFromOffer && formData.typeStage === 'Stage PFE'}
                    >
                      <SelectTrigger className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.typeStage ? 'border-red-500 ring-2 ring-red-200' : ''}`}>
                        <SelectValue placeholder="Sélectionnez le type de stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stage PFE">Stage PFE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Separator */}
                  <div className="my-4 border-t border-gray-200"></div>
                  {/* Niveau */}
                  <div>
                    <Label htmlFor="niveau">Niveau *</Label>
                    <Input
                      id="niveau"
                      value={formData.niveau}
                      onChange={(e) => handleInputChange('niveau', e.target.value)}
                      placeholder="Entrez votre niveau (ex: Licence 3, Master 1, etc.)"
                      className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.niveau ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>
                  {/* Référence PFE */}
                  {isPFEStage && selectedOfferIds.length > 1 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                      <div className="font-semibold text-yellow-800 mb-2">Références des projets PFE sélectionnés :</div>
                      <ul className="flex flex-wrap gap-4">
                        {selectedOfferReferences.map(ref => (
                          <li key={ref} className="text-gray-800 text-sm">{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {isPFEStage && selectedOfferIds.length === 1 && (
                    <div>
                      <Label htmlFor="pfeReference" className="flex items-center gap-2">
                        Référence du Projet PFE *
                        {isPrefilledFromOffer && formData.pfeReference && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Pré-rempli
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id="pfeReference"
                        value={formData.pfeReference}
                        onChange={(e) => handleInputChange('pfeReference', e.target.value)}
                        placeholder="Ex: PFE-2024-001 (voir PFE Book)"
                        className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.pfeReference ? 'border-red-500 ring-2 ring-red-200' : ''} ${isPrefilledFromOffer && formData.pfeReference ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        readOnly={isPrefilledFromOffer && !!formData.pfeReference}
                      />
                      {isPrefilledFromOffer && formData.pfeReference ? (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Référence PFE automatiquement remplie depuis l'offre sélectionnée
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">
                          Trouvez la référence dans le <a href="/public/pfe-book" className="text-red-600 hover:underline font-medium">PFE Book</a> ou sélectionnez un projet ci-dessus.
                        </p>
                      )}
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
                        readOnly={false}
                        disabled={false}
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
                        readOnly={false}
                        disabled={false}
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
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Candidate Documents Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-red-900 mb-2 text-lg">Documents du Candidat Principal</h3>
                <p className="text-sm text-red-700">Tous les documents doivent être au format PDF uniquement (max 10MB chacun)</p>
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
