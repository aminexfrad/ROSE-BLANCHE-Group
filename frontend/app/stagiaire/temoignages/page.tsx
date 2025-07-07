"use client"

import { useEffect, useState } from "react"
import { apiClient, Stage, Testimonial } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Plus, Edit, Trash2, Video, FileText, CheckCircle, Clock, XCircle, Loader2, AlertCircle, Star } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function StagiaireTemoignagesPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/stagiaire" }, { label: "Témoignages" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internship, setInternship] = useState<Stage | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    testimonial_type: "text" as "text" | "video",
    video_url: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getMyInternshipTestimonials()
        setInternship(response.internship)
        setTestimonials(response.testimonials || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des témoignages")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "video" ? (
      <Video className="h-5 w-5 text-purple-600" />
    ) : (
      <FileText className="h-5 w-5 text-blue-600" />
    )
  }

  // Compute statistics
  const totalTestimonials = testimonials.length
  const approvedTestimonials = testimonials.filter(t => t.status === "approved").length
  const pendingTestimonials = testimonials.filter(t => t.status === "pending").length
  const rejectedTestimonials = testimonials.filter(t => t.status === "rejected").length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("content", formData.content)
      formDataObj.append("testimonial_type", formData.testimonial_type)
      if (formData.testimonial_type === "video" && formData.video_url) {
        formDataObj.append("video_url", formData.video_url)
      }

      const newTestimonial = await apiClient.createTestimonial(formDataObj)
      setTestimonials(prev => [...prev, newTestimonial])
      setShowForm(false)
      setFormData({ title: "", content: "", testimonial_type: "text", video_url: "" })
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du témoignage")
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des témoignages</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Mes Témoignages
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Partagez votre expérience de stage</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total témoignages",
              value: totalTestimonials.toString(),
              icon: MessageSquare,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Approuvés",
              value: approvedTestimonials.toString(),
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
            },
            {
              title: "En attente",
              value: pendingTestimonials.toString(),
              icon: Clock,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              title: "Rejetés",
              value: rejectedTestimonials.toString(),
              icon: XCircle,
              color: "from-red-500 to-red-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 2) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{stat.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bouton nouveau témoignage */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Nouveau témoignage
            </CardTitle>
            <CardDescription>
              Partagez votre expérience avec la communauté
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Créer un nouveau témoignage
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du témoignage
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de votre témoignage"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de témoignage
                    </label>
                    <Select
                      value={formData.testimonial_type}
                      onValueChange={(value: "text" | "video") => 
                        setFormData(prev => ({ ...prev, testimonial_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texte</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Partagez votre expérience de stage..."
                    rows={4}
                    required
                  />
                </div>

                {formData.testimonial_type === "video" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de la vidéo
                    </label>
                    <Input
                      value={formData.video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://youtube.com/..."
                      type="url"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Publier le témoignage
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Liste des témoignages */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
              Mes témoignages
            </CardTitle>
            <CardDescription>
              {testimonials.length} témoignage(s) créé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{testimonial.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              {getTypeIcon(testimonial.testimonial_type)}
                              {testimonial.testimonial_type === "video" ? "Vidéo" : "Texte"}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusIcon(testimonial.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm line-clamp-4">
                          {testimonial.content}
                        </p>

                        {testimonial.testimonial_type === "video" && testimonial.video_url && (
                          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Vidéo disponible</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {getStatusBadge(testimonial.status)}
                          {testimonial.testimonial_type === "video" && (
                            <Badge variant="outline" className="text-purple-600">
                              <Video className="h-3 w-3 mr-1" />
                              Vidéo
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {format(new Date(testimonial.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>

                        {testimonial.moderation_comment && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-1">Commentaire de modération:</h5>
                            <p className="text-blue-800 text-sm">{testimonial.moderation_comment}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun témoignage créé</p>
                <p className="text-sm text-gray-500 mt-2">
                  Commencez par créer votre premier témoignage pour partager votre expérience
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conseils pour un bon témoignage */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Star className="h-6 w-6 text-purple-600" />
              Conseils pour un bon témoignage
            </CardTitle>
            <CardDescription>
              Rendez votre témoignage plus impactant
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-purple-600">À faire</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Soyez authentique et personnel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Partagez des exemples concrets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Mentionnez les compétences acquises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Parlez de l'équipe et de l'ambiance</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-orange-600">À éviter</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm">Les informations confidentielles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm">Les critiques négatives excessives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm">Les détails techniques trop complexes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm">Les informations personnelles sensibles</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
