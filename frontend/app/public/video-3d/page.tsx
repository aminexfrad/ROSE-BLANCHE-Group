"use client"

import { useEffect, useState } from "react"
import { apiClient, PFEDocument } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Search, Filter, Eye, Calendar, Users, Loader2, AlertCircle, Video, TrendingUp, Star, ArrowRight, Clock, Download, EyeOff, Sparkles, Zap, Building2, Award, Globe } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Video3DPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videos, setVideos] = useState<PFEDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [specialityFilter, setSpecialityFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getPFEDocuments()
        // Filter for documents that might have video content
        const videoDocuments = (response.results || []).filter(doc => 
          doc.description?.toLowerCase().includes('vidéo') || 
          doc.description?.toLowerCase().includes('3d') ||
          doc.title?.toLowerCase().includes('vidéo') ||
          doc.title?.toLowerCase().includes('3d')
        )
        setVideos(videoDocuments)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des vidéos 3D")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Publié</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Brouillon</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archivé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setYearFilter("all")
    setSpecialityFilter("all")
  }

  // Filter videos based on search and filters
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.keywords?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = yearFilter === "all" || video.year.toString() === yearFilter
    const matchesSpeciality = specialityFilter === "all" || video.speciality === specialityFilter
    
    return matchesSearch && matchesYear && matchesSpeciality
  })

  // Get unique years and specialities for filters
  const years = [...new Set(videos.map(v => v.year))].sort((a, b) => b - a)
  const specialities = [...new Set(videos.map(v => v.speciality))].filter(Boolean)

  // Compute statistics
  const totalVideos = videos.length
  const publishedVideos = videos.filter(v => v.status === "published").length
  const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0)
  const totalDownloads = videos.reduce((sum, v) => sum + (v.download_count || 0), 0)

  if (loading) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Chargement des vidéos Rose Blanche</h2>
                <p className="text-gray-600 text-lg">Préparation de l'expérience immersive...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="h-4 w-4" />
                Rose Blanche Group
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                Vidéos & Présentations
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Découvrez l'excellence de Rose Blanche Group à travers nos vidéos de présentation, 
                projets 3D innovants et témoignages de nos collaborateurs. Une vitrine de notre expertise et de notre vision.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Vidéos Corporate",
                value: totalVideos.toString(),
                icon: Video,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                textColor: "text-purple-600"
              },
              {
                title: "Présentations",
                value: publishedVideos.toString(),
                icon: Play,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "bg-emerald-50",
                textColor: "text-emerald-600"
              },
              {
                title: "Vues Total",
                value: totalViews.toString(),
                icon: Eye,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                textColor: "text-blue-600"
              },
              {
                title: "Téléchargements",
                value: totalDownloads.toString(),
                icon: TrendingUp,
                color: "from-pink-500 to-pink-600",
                bgColor: "bg-pink-50",
                textColor: "text-pink-600"
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

          {/* Section About Rose Blanche */}
          <Card className="shadow-xl border-0 mb-12 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Award className="h-4 w-4" />
                  À propos de Rose Blanche Group
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Innovation & Excellence
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  Rose Blanche Group est un leader dans l'innovation technologique et le développement durable. 
                  Nos vidéos et présentations reflètent notre engagement envers l'excellence et notre vision d'un avenir plus durable.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Vision Globale</h3>
                  <p className="text-gray-600 text-sm">
                    Une approche internationale avec des solutions locales innovantes
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Innovation Continue</h3>
                  <p className="text-gray-600 text-sm">
                    Recherche et développement au cœur de notre stratégie
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                  <p className="text-gray-600 text-sm">
                    Qualité et performance dans tous nos projets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtres */}
          <Card className="shadow-xl border-0 mb-12 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
                Recherche et Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <Input
                    placeholder="Rechercher une vidéo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all"
                  />
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {specialities.map(speciality => (
                      <SelectItem key={speciality} value={speciality}>{speciality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={resetFilters}
                  variant="outline" 
                  className="border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des vidéos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  {/* Featured badge for popular videos */}
                  {video.view_count > 100 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Populaire
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-purple-600 transition-colors">
                          {video.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{video.authors}</span>
                        </div>
                      </div>
                      {getStatusBadge(video.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {video.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {video.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>{video.year}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Zap className="h-4 w-4 text-pink-500" />
                          <span>{video.speciality}</span>
                        </div>
                      </div>

                      {video.keywords && (
                        <div className="flex flex-wrap gap-2">
                          {video.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                              {keyword.trim()}
                            </Badge>
                          ))}
                          {video.keywords.split(',').length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                              +{video.keywords.split(',').length - 3} autres
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{video.view_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>{video.download_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-200 hover:border-purple-500 hover:bg-purple-50 text-purple-600"
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700 transition-all duration-300"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Regarder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune vidéo trouvée</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Revenez bientôt pour découvrir nos nouvelles vidéos et présentations Rose Blanche Group.
                </p>
                <Button onClick={resetFilters} variant="outline" className="border-gray-300 hover:border-purple-500">
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>

          {/* Pagination ou "Voir plus" */}
          {filteredVideos.length > 0 && (
            <div className="text-center mt-16">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 text-purple-600 hover:text-purple-700 transition-all duration-300 px-8 py-3"
              >
                <span>Voir plus de vidéos</span>
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
