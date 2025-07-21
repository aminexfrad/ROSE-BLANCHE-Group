/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
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
  reference: string;
  title: string;
  description: string;
  objectifs: string;
  keywords: string;
  diplome: string;
  specialite: string;
  nombre_postes: number;
  ville: string;
}

export default function PFEBookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<OffreStage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specialityFilter, setSpecialityFilter] = useState("all")
  const [diplomeFilter, setDiplomeFilter] = useState("all")
  const [villeFilter, setVilleFilter] = useState("all")
  // Add state for expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [ref: string]: boolean }>({});

  const toggleDescription = (ref: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [ref]: !prev[ref] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (specialityFilter !== "all") params.append('specialite', specialityFilter)
        if (diplomeFilter !== "all") params.append('diplome', diplomeFilter)
        if (villeFilter !== "all") params.append('ville', villeFilter)
        const response = await apiClient.getOffresStage(Object.fromEntries(params))
        setOffers(response.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des offres de stage")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchTerm, specialityFilter, diplomeFilter, villeFilter])

  const resetFilters = () => {
    setSearchTerm("")
    setSpecialityFilter("all")
    setDiplomeFilter("all")
    setVilleFilter("all")
  }

  const handleApplyToOffer = (offer: OffreStage) => {
    const params = new URLSearchParams({
      type: 'PFE',
      pfeReference: offer.reference,
      specialite: offer.specialite,
      diplome: offer.diplome,
      ville: offer.ville,
      title: offer.title,
      description: offer.description,
      objectifs: offer.objectifs,
      keywords: offer.keywords,
      nombre_postes: offer.nombre_postes.toString()
    })
    router.push(`/public/demande-stage?${params.toString()}`)
  }

  // Get unique values for filters
  const specialities = [...new Set(offers.map(o => o.specialite))].filter(Boolean)
  const diplomes = [...new Set(offers.map(o => o.diplome))].filter(Boolean)
  const villes = [...new Set(offers.map(o => o.ville))].filter(Boolean)

  if (loading) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-rose-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                Bibliothèque des Opportunités
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
                Découvrez les Offres de Stage
              </h1>
              <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
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
                value: offers.length.toString(),
                icon: BookOpen,
                color: "from-red-500 to-red-600",
                bgColor: "bg-red-50",
                textColor: "text-red-600"
              },
              {
                title: "Offres Ouvertes",
                value: offers.length.toString(),
                icon: FileText,
                color: "from-rose-500 to-rose-600",
                bgColor: "bg-rose-50",
                textColor: "text-rose-600"
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
                    {specialities.map(speciality => (
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
                    {diplomes.map(diplome => (
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
                    {villes.map(ville => (
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

          {/* Liste des offres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {offers.length > 0 ? (
              offers.map((offer, index) => (
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
                        {offer.keywords.split(',').map((kw, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                            {kw.trim()}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-2">
                        <span className="block text-xs text-gray-400 font-mono">Réf: {offer.reference}</span>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-300"
                          onClick={() => handleApplyToOffer(offer)}
                        >
                          Postuler
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                Aucune offre trouvée.
              </div>
            )}
          </div>

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
