/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Star,
  Video,
  FileText,
  Search,
  Filter,
  Play,
  User,
  Building,
  Calendar,
  Eye,
  Heart,
  Share2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  X,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Testimonial } from "@/lib/api"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PublicTemoignagesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getPublicTestimonials()
        setTestimonials(response.results || [])
      } catch (error) {
        console.error("Erreur lors du chargement des témoignages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${testimonial.author.prenom} ${testimonial.author.nom}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      testimonial.stage.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || testimonial.testimonial_type === typeFilter

    return matchesSearch && matchesType
  })

  const videoTestimonials = filteredTestimonials.filter((t) => t.testimonial_type === "video")
  const textTestimonials = filteredTestimonials.filter((t) => t.testimonial_type === "text")

  const handleVideoClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setShowVideoModal(true)
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
    ))
  }

  const getTypeIcon = (type: string) => {
    return type === "video" ? (
      <Video className="h-5 w-5 text-purple-600" />
    ) : (
      <FileText className="h-5 w-5 text-blue-600" />
    )
  }

  if (loading) {
    return (
      <>
        <Navbar isPublic={true} />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des témoignages</h2>
                <p className="text-gray-600">Veuillez patienter...</p>
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
                <MessageSquare className="h-4 w-4" />
                Expériences Authentiques
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
                Témoignages de nos Stagiaires
              </h1>
              <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Découvrez les expériences authentiques et inspirantes de nos stagiaires. 
                Des histoires vraies qui témoignent de la qualité de nos programmes.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filtres */}
          <Card className="mb-8 bg-white shadow-lg border-0">
            <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="h-5 w-5 text-red-600" />
              Filtres et recherche
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par titre, contenu, auteur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="text">Témoignages texte</SelectItem>
                      <SelectItem value="video">Témoignages vidéo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setTypeFilter("all")
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total témoignages",
                value: testimonials.length.toString(),
                icon: MessageSquare,
                color: "from-red-500 to-red-600",
                bgColor: "bg-red-50",
                textColor: "text-red-600"
              },
              {
                title: "Témoignages texte",
                value: testimonials.filter((t) => t.testimonial_type === "text").length.toString(),
                icon: FileText,
                color: "from-rose-500 to-rose-600",
                bgColor: "bg-rose-50",
                textColor: "text-rose-600"
              },
              {
                title: "Témoignages vidéo",
                value: testimonials.filter((t) => t.testimonial_type === "video").length.toString(),
                icon: Video,
                color: "from-pink-500 to-pink-600",
                bgColor: "bg-pink-50",
                textColor: "text-pink-600"
              },
              {
                title: "Note moyenne",
                value: "4.8/5",
                icon: Star,
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-50",
                textColor: "text-orange-600"
              }
            ].map((stat, index) => (
              <Card key={index} className={`${stat.bgColor} shadow-lg border-0 hover:shadow-xl transition-all duration-300`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">{stat.title}</CardTitle>
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600">
                    {index === 3 ? "Excellente satisfaction" : index === 0 ? "Tous les témoignages" : index === 1 ? "Récits écrits" : "Vidéos partagées"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contenu principal */}
          {filteredTestimonials.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun témoignage trouvé</h3>
                  <p className="text-gray-600">
                    Aucun témoignage ne correspond à vos critères de recherche.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tous ({filteredTestimonials.length})</TabsTrigger>
                <TabsTrigger value="text">Texte ({textTestimonials.length})</TabsTrigger>
                <TabsTrigger value="video">Vidéo ({videoTestimonials.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTestimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onVideoClick={handleVideoClick}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {textTestimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onVideoClick={handleVideoClick}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTestimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onVideoClick={handleVideoClick}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Modal vidéo */}
        {showVideoModal && selectedTestimonial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{selectedTestimonial.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVideoModal(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                  {selectedTestimonial.video_url ? (
                    <iframe
                      src={selectedTestimonial.video_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-white text-center">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p>Vidéo non disponible</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedTestimonial.author.prenom} {selectedTestimonial.author.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{selectedTestimonial.stage.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(selectedTestimonial.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{selectedTestimonial.content}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      J'aime
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                    {selectedTestimonial.video_url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir sur YouTube
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

// Composant carte de témoignage
function TestimonialCard({
  testimonial,
  onVideoClick,
}: {
  testimonial: Testimonial
  onVideoClick: (testimonial: Testimonial) => void
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(testimonial.testimonial_type)}
              <CardTitle className="text-lg line-clamp-2">{testimonial.title}</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {testimonial.author.prenom} {testimonial.author.nom}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{testimonial.stage.company}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {testimonial.testimonial_type === "video" ? "Vidéo" : "Texte"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Aperçu du contenu */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 text-sm line-clamp-4 leading-relaxed">
              {testimonial.content}
            </p>
          </div>

          {/* Aperçu vidéo si disponible */}
          {testimonial.testimonial_type === "video" && testimonial.video_url && (
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVideoClick(testimonial)
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Regarder
                </Button>
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(testimonial.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>1.2k vues</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="ghost" size="sm" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              J'aime
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTypeIcon(type: string) {
  return type === "video" ? (
    <Video className="h-5 w-5 text-pink-600" />
  ) : (
    <FileText className="h-5 w-5 text-red-600" />
  )
} 