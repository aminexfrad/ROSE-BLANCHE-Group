"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Download, Eye, Calendar, Users, Loader2, AlertCircle, BookOpen, MapPin, Clock, Star, ArrowRight, Building2, GraduationCap } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface OffreStage {
  id: number
  titre: string
  entreprise: string
  specialite: string
  niveau: string
  localisation: string
  duree_mois: number
  description: string
  profil_recherche: string
  competences_requises: string
  missions: string
  avantages: string
  conditions: string
  remuneration: string
  date_debut: string
  date_fin_candidature: string
  contact_nom: string
  contact_email: string
  contact_telephone: string
  status: string
  is_featured: boolean
  vues: number
  candidatures: number
  is_active: boolean
  created_at: string
}

export default function PFEBookPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<OffreStage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [niveauFilter, setNiveauFilter] = useState("all")
  const [specialityFilter, setSpecialityFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (niveauFilter !== "all") params.append('niveau', niveauFilter)
        if (specialityFilter !== "all") params.append('specialite', specialityFilter)
        if (locationFilter !== "all") params.append('localisation', locationFilter)
        const response = await apiClient.getOffresStage(Object.fromEntries(params))
        setOffers(response.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des offres de stage")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchTerm, niveauFilter, specialityFilter, locationFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Ouverte</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fermée</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Brouillon</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setNiveauFilter("all")
    setSpecialityFilter("all")
    setLocationFilter("all")
  }

  // Filtered offers for display
  const filteredOffers = offers

  // Get unique values for filters
  const niveaux = [...new Set(offers.map(o => o.niveau))].filter(Boolean)
  const specialities = [...new Set(offers.map(o => o.specialite))].filter(Boolean)
  const locations = [...new Set(offers.map(o => o.localisation))].filter(Boolean)

  // Compute statistics
  const totalOffers = offers.length
  const openOffers = offers.filter(o => o.status === "open").length
  const totalApplications = offers.reduce((sum, o) => sum + (o.candidatures || 0), 0)
  const totalViews = offers.reduce((sum, o) => sum + (o.vues || 0), 0)

  if (loading) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Chargement de la bibliothèque PFE</h2>
                <p className="text-gray-600 text-lg">Découverte des opportunités...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                  Réessayer
                </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                Bibliothèque des Opportunités
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
                Découvrez les Offres de Stage
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Explorez une collection exclusive d'opportunités de stage dans lrose blanche group. 
                Trouvez votre prochaine aventure professionnelle.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Offres Disponibles",
                value: totalOffers.toString(),
                icon: BookOpen,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                textColor: "text-blue-600"
              },
              {
                title: "Offres Ouvertes",
                value: openOffers.toString(),
                icon: FileText,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "bg-emerald-50",
                textColor: "text-emerald-600"
              },
              {
                title: "Candidatures",
                value: totalApplications.toString(),
                icon: Users,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                textColor: "text-purple-600"
              },
              {
                title: "Vues Total",
                value: totalViews.toString(),
                icon: Eye,
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-50",
                textColor: "text-orange-600"
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 backdrop-blur-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
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
            ))}
          </div>

          {/* Filtres */}
          <Card className="shadow-xl border-0 mb-12 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-6 w-6 text-blue-600" />
                </div>
                Recherche et Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Rechercher une offre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  />
                </div>
                <Select value={niveauFilter} onValueChange={setNiveauFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Niveau d'études" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {niveaux.map(niveau => (
                      <SelectItem key={niveau} value={niveau}>{niveau}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specialities.map(speciality => (
                      <SelectItem key={speciality} value={speciality}>{speciality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Localisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les localisations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={resetFilters}
                  variant="outline" 
                  className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des offres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer, index) => (
                <Card
                  key={offer.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  {offer.is_featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Vedette
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                          {offer.titre}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{offer.entreprise}</span>
                        </div>
                      </div>
                      {getStatusBadge(offer.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {offer.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {offer.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>{offer.date_debut ? format(new Date(offer.date_debut), 'MMM yyyy', { locale: fr }) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>{offer.duree_mois} mois</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <span>{offer.specialite}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{offer.localisation}</span>
                        </div>
                      </div>

                      {offer.competences_requises && (
                        <div className="flex flex-wrap gap-2">
                          {offer.competences_requises.split(',').slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                              {skill.trim()}
                            </Badge>
                          ))}
                          {offer.competences_requises.split(',').length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                              +{offer.competences_requises.split(',').length - 3} autres
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{offer.vues || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{offer.candidatures || 0}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-all duration-300"
                        >
                          <span>Postuler</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune offre trouvée</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Essayez de modifier vos critères de recherche ou revenez plus tard pour de nouvelles opportunités.
                </p>
                <Button onClick={resetFilters} variant="outline" className="border-gray-300 hover:border-blue-500">
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>

          {/* Pagination ou "Voir plus" */}
          {filteredOffers.length > 0 && (
            <div className="text-center mt-16">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-300 px-8 py-3"
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
