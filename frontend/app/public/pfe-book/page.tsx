/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, PublicOffreStage } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Download, Eye, Calendar, Users, Loader2, AlertCircle, BookOpen, MapPin, Clock, Star, ArrowRight, Building2, GraduationCap, LogIn, UserPlus, Briefcase, UserCheck } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function PFEBookPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<PublicOffreStage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specialityFilter, setSpecialityFilter] = useState("all")
  const [diplomeFilter, setDiplomeFilter] = useState("all")
  const [villeFilter, setVilleFilter] = useState("all")
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [ref: string]: boolean }>({})
  const [selectedOffers, setSelectedOffers] = useState<PublicOffreStage[]>([])
  const [selectionError, setSelectionError] = useState<string | null>(null)
  
  // Candidate authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [candidateStatus, setCandidateStatus] = useState<{
    is_candidat: boolean
    candidat?: {
      id: number
      nombre_demandes_soumises: number
      demandes_restantes: number
      peut_soumettre: boolean
    }
  } | null>(null)

  const toggleDescription = (ref: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [ref]: !prev[ref] }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getPublicOffres()
        setOffers(response.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des offres de stage")
      } finally {
        setLoading(false)
      }
    }
    
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const status = await apiClient.checkCandidatStatus()
          setCandidateStatus(status)
          setIsAuthenticated(status.is_candidat)
        } catch (err) {
          // Token might be invalid, clear it
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setIsAuthenticated(false)
          setCandidateStatus(null)
        }
      }
    }

    fetchData()
    checkAuthStatus()
  }, [])

  const resetFilters = () => {
    setSearchTerm("")
    setSpecialityFilter("all")
    setDiplomeFilter("all")
    setVilleFilter("all")
  }

  const handleApplyToOffer = async (offer: PublicOffreStage) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour postuler à cette offre",
        variant: "destructive"
      })
      return
    }

    if (!candidateStatus?.candidat?.peut_soumettre) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de candidatures. Attendez qu'une candidature soit traitée.",
        variant: "destructive"
      })
      return
    }

    // Redirect to application form
    const params = new URLSearchParams({
      type: 'PFE',
      pfeReference: offer.reference,
      specialite: offer.specialite,
      diplome: offer.diplome,
      ville: offer.ville,
      title: offer.title,
      description: offer.description,
      nombre_postes: offer.nombre_postes.toString()
    })
    router.push(`/public/demande-stage?${params.toString()}`)
  }

  const handleToggleOffer = (offer: PublicOffreStage) => {
    const alreadySelected = selectedOffers.some(o => o.id === offer.id)
    if (alreadySelected) {
      setSelectedOffers(selectedOffers.filter(o => o.id !== offer.id))
    } else {
      // Only allow single selection for PFE offers
      if (selectedOffers.length >= 1) {
        toast({
          title: "Sélection limitée",
          description: "Vous ne pouvez sélectionner qu'une seule offre PFE par demande.",
          variant: "destructive"
        })
        return
      }
      setSelectedOffers([offer])
    }
  }

  const handleBulkApply = () => {
    if (selectedOffers.length === 0) {
      setSelectionError("Veuillez sélectionner une offre")
      return
    }

    if (selectedOffers.length > 1) {
      setSelectionError("Vous ne pouvez sélectionner qu'une seule offre PFE par demande")
      return
    }

    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour postuler à cette offre",
        variant: "destructive"
      })
      return
    }

    if (!candidateStatus?.candidat?.peut_soumettre) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de candidatures. Attendez qu'une candidature soit traitée.",
        variant: "destructive"
      })
      return
    }

    // Redirect to application form with single offer
    const offer = selectedOffers[0]
    const params = new URLSearchParams({
      type: 'PFE',
      pfeReference: offer.reference,
      specialite: offer.specialite,
      diplome: offer.diplome,
      ville: offer.ville,
      title: offer.title,
      description: offer.description,
      nombre_postes: offer.nombre_postes.toString()
    })
    router.push(`/public/demande-stage?${params.toString()}`)
  }

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality = specialityFilter === "all" || offer.specialite === specialityFilter
    const matchesDiplome = diplomeFilter === "all" || offer.diplome === diplomeFilter
    const matchesVille = villeFilter === "all" || offer.ville === villeFilter
    
    return matchesSearch && matchesSpeciality && matchesDiplome && matchesVille
  })

  const uniqueSpecialities = [...new Set(offers.map(o => o.specialite))]
  const uniqueDiplomes = [...new Set(offers.map(o => o.diplome))]
  const uniqueVilles = [...new Set(offers.map(o => o.ville))]

  if (loading) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-red-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Chargement des offres de stage...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600">Erreur: {error}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar isPublic={true} />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/technologist-protective.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                backgroundRepeat: 'no-repeat',
                filter: 'none'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative">
            <div className="text-center mb-16">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight drop-shadow">
                Découvrez les Offres de Stage
              </h1>
              <p className="text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Explorez des projets stimulants au sein du ROSE BLANCHE Group et choisissez celui qui correspond à vos ambitions.
              </p>
              
              {/* Authentication Section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!isAuthenticated ? (
                  <>
                    <Button 
                      onClick={() => router.push('/login')}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Se connecter
                    </Button>
                    <Button 
                      onClick={() => router.push('/login?register=true')}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-500 px-8 py-3"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un compte
                    </Button>
                  </>
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Briefcase className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900">Espace Candidat</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Vous êtes connecté en tant que candidat</p>
                      <p>Candidatures restantes: <span className="font-semibold text-red-600">{candidateStatus?.candidat?.demandes_restantes || 0}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push('/candidate/dashboard')}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Mon tableau de bord
                      </Button>
                      <Button 
                        onClick={async () => {
                          try {
                            await logout()
                            setIsAuthenticated(false)
                            setCandidateStatus(null)
                            toast({
                              title: "Déconnexion réussie",
                              description: "Vous avez été déconnecté avec succès.",
                            })
                            // Refresh the page to ensure clean state
                            window.location.reload()
                          } catch (error) {
                            console.error('Logout error:', error)
                            // Fallback to manual cleanup
                            localStorage.removeItem('token')
                            localStorage.removeItem('refreshToken')
                            localStorage.removeItem('candidate_email')
                            setIsAuthenticated(false)
                            setCandidateStatus(null)
                            toast({
                              title: "Déconnexion réussie",
                              description: "Vous avez été déconnecté avec succès.",
                            })
                            // Refresh the page to ensure clean state
                            window.location.reload()
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Offres Disponibles",
                value: offers.length.toString(),
                icon: BookOpen,
                color: "from-red-500 to-red-600",
                bgColor: "bg-red-50",
                textColor: "text-red-600"
              },
              {
                title: "Candidatures",
                value: offers.reduce((sum, o) => sum + (o.nombre_postes || 0), 0).toString(),
                icon: Users,
                color: "from-pink-500 to-pink-600",
                bgColor: "bg-pink-50",
                textColor: "text-pink-600"
              },
              {
                title: "Vues Total",
                value: offers.reduce((sum, o) => sum + (o.nombre_postes || 0), 0).toString(),
                icon: Eye,
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-50",
                textColor: "text-orange-600"
              },
            ].map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 backdrop-blur-sm"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <IconComponent className={`h-8 w-8 ${stat.textColor}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="font-semibold text-lg text-gray-900">{stat.title}</h3>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Filtres */}
          <Card className="shadow-xl border-0 mb-12 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-100 border-b border-red-100">
              <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Filter className="h-6 w-6 text-red-600" />
                </div>
                Recherche et Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    placeholder="Rechercher une offre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all"
                  />
                </div>
                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {uniqueSpecialities.map(speciality => (
                      <SelectItem key={speciality} value={speciality}>{speciality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={diplomeFilter} onValueChange={setDiplomeFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Diplôme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les diplômes</SelectItem>
                    {uniqueDiplomes.map(diplome => (
                      <SelectItem key={diplome} value={diplome}>{diplome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={villeFilter} onValueChange={setVilleFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {uniqueVilles.map(ville => (
                      <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={resetFilters}
                  variant="outline" 
                  className="border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Status Display */}
          {isAuthenticated && candidateStatus?.candidat && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Connecté en tant que candidat</h3>
                      <p className="text-sm text-green-700">
                        Vous pouvez soumettre jusqu'à 4 demandes PFE différentes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">
                      {candidateStatus.candidat.demandes_restantes}
                    </div>
                    <div className="text-sm text-green-600">demandes restantes</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-800">{candidateStatus.candidat.nombre_demandes_soumises}</div>
                    <div className="text-green-600">soumises</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${candidateStatus.candidat.peut_soumettre ? 'text-green-800' : 'text-red-600'}`}>
                      {candidateStatus.candidat.peut_soumettre ? 'Oui' : 'Non'}
                    </div>
                    <div className={candidateStatus.candidat.peut_soumettre ? 'text-green-600' : 'text-red-600'}>
                      peut soumettre
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des offres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer, index) => {
                const checked = selectedOffers.some(o => o.id === offer.id)
                return (
                  <Card
                    key={offer.reference}
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <CardHeader className="bg-gradient-to-r from-red-50 to-rose-100 border-b border-red-100 pb-6">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                        {offer.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className={`text-gray-600 text-sm leading-relaxed ${expandedDescriptions[offer.reference] ? '' : 'line-clamp-3'}`}>
                          {offer.description}
                        </p>
                        {offer.description.length > 180 && (
                          <button
                            className="text-red-600 hover:text-red-800 text-xs font-semibold focus:outline-none transition-colors"
                            onClick={() => toggleDescription(offer.reference)}
                          >
                            {expandedDescriptions[offer.reference] ? 'Afficher moins' : 'Afficher plus'}
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                            <span>{offer.diplome}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <BookOpen className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{offer.specialite}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="h-4 w-4 text-red-400" />
                            <span className="font-medium">{offer.ville}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Users className="h-4 w-4 text-red-300" />
                            <span className="font-medium">{offer.nombre_postes} postes</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Only show keywords if they exist */}
                          {offer.keywords && offer.keywords.split(',').map((kw: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                              {kw.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-2">
                          <span className="block text-xs text-gray-400 font-mono">Réf: {offer.reference}</span>
                        </div>
                        
                        {/* Individual Apply Button */}
                        <div className="pt-4">
                          {isAuthenticated ? (
                            candidateStatus?.candidat?.peut_soumettre ? (
                              <Button 
                                onClick={() => handleApplyToOffer(offer)}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                              >
                                <Briefcase className="h-4 w-4 mr-2" />
                                Postuler maintenant
                              </Button>
                            ) : (
                              <Button 
                                disabled
                                className="w-full bg-gray-400 text-gray-600 cursor-not-allowed"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Limite de candidatures atteinte
                              </Button>
                            )
                          ) : (
                            <Button 
                              onClick={() => router.push('/login')}
                              variant="outline"
                              className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-500"
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Se connecter pour postuler
                            </Button>
                          )}
                        </div>
                        
                        {/* Removed legacy bulk selection radio */}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                Aucune offre trouvée.
              </div>
            )}
          </div>

          {/* Floating summary and submit button */}
          {selectedOffers.length > 0 && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 border border-red-200 rounded-xl shadow-2xl px-8 py-4 flex flex-col items-center gap-2">
              <div className="font-semibold text-red-700 mb-2">Offre sélectionnée ({selectedOffers.length}/1):</div>
              <ul className="mb-2">
                {selectedOffers.map(o => (
                  <li key={o.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-red-500" />
                    {o.title} - {o.reference}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedOffers([])}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleBulkApply}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Postuler à cette offre
                </Button>
              </div>
            </div>
          )}

          {/* Pagination ou "Voir plus" */}
          {offers.length > 0 && (
            <div className="text-center mt-16">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 px-8 py-3"
              >
                <span>Voir plus d'offres</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
