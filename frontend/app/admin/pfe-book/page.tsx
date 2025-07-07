"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { 
  BookOpen, 
  Building, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Eye, 
  Mail, 
  Phone,
  Search,
  Filter,
  Star,
  Briefcase,
  GraduationCap
} from "lucide-react"

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
  const [offres, setOffres] = useState<OffreStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    specialite: "",
    niveau: "",
    localisation: "",
    featured: false
  })

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build query parameters
        const response = await apiClient.getOffresStage({
          search,
          specialite: filters.specialite,
          niveau: filters.niveau,
          localisation: filters.localisation,
          featured: filters.featured
        })
        setOffres(response.results || [])
      } catch (err) {
        console.error('Error fetching offres:', err)
        setError('Impossible de charger les offres de stage')
      } finally {
        setLoading(false)
      }
    }

    fetchOffres()
  }, [search, filters])

  const handleApply = async (offreId: number) => {
    try {
      const response = await apiClient.applyToOffreStage(offreId)
      
      // Show success message or redirect to contact info
      alert(`Candidature soumise avec succès! Contactez ${response.contact_nom} à ${response.contact_email}`)
      
      // Refresh the list to update application count
      const updatedOffres = offres.map(offre => 
        offre.id === offreId 
          ? { ...offre, candidatures: offre.candidatures + 1 }
          : offre
      )
      setOffres(updatedOffres)
    } catch (err) {
      console.error('Error applying:', err)
      alert('Erreur lors de la soumission de la candidature')
    }
  }

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'licence': return 'bg-blue-100 text-blue-800'
      case 'master': return 'bg-green-100 text-green-800'
      case 'ingenieur': return 'bg-purple-100 text-purple-800'
      case 'doctorat': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Offres de Stage PFE
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Découvrez les opportunités de stage pour votre Projet de Fin d'Études
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher par titre, entreprise, spécialité..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <select
                  value={filters.specialite}
                  onChange={(e) => setFilters({...filters, specialite: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Toutes les spécialités</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Génie Industriel">Génie Industriel</option>
                  <option value="Mécanique">Mécanique</option>
                  <option value="Électrique">Électrique</option>
                </select>
                
                <select
                  value={filters.niveau}
                  onChange={(e) => setFilters({...filters, niveau: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="licence">Licence</option>
                  <option value="master">Master</option>
                  <option value="ingenieur">Ingénieur</option>
                  <option value="doctorat">Doctorat</option>
                </select>
                
                <select
                  value={filters.localisation}
                  onChange={(e) => setFilters({...filters, localisation: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Toutes les localisations</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Tunis">Tunis</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Nabeul">Nabeul</option>
                </select>
                
                <Button
                  variant={filters.featured ? "default" : "outline"}
                  onClick={() => setFilters({...filters, featured: !filters.featured})}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Mises en avant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : offres.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offres.map((offre) => (
              <Card key={offre.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {offre.titre}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{offre.entreprise}</span>
                      </div>
                    </div>
                    {offre.is_featured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getNiveauColor(offre.niveau)}>
                      {offre.niveau.charAt(0).toUpperCase() + offre.niveau.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(offre.status)}>
                      {offre.status === 'open' ? 'Ouverte' : 'Fermée'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{offre.localisation}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{offre.duree_mois} mois</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{offre.specialite}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {offre.description}
                  </p>
                  
                  {offre.remuneration && (
                    <div className="text-sm">
                      <span className="font-medium text-green-600">
                        💰 {offre.remuneration}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {offre.vues}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {offre.candidatures}
                      </span>
                    </div>
                    <span>
                      Expire le {new Date(offre.date_fin_candidature).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApply(offre.id)}
                      disabled={!offre.is_active}
                      className="flex-1"
                    >
                      Postuler
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {offre.contact_telephone && (
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
