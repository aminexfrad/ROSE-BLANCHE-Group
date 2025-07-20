/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import VideoUpload from "@/components/video-upload"
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Plus,
  FileText,
  Video,
  Loader2,
  AlertTriangle,
  User,
  Building,
  Calendar,
  Eye,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Testimonial, Stage } from "@/lib/api"

export default function StagiaireTemoignagesPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/stagiaire" }, { label: "Témoignages" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internship, setInternship] = useState<Stage | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    testimonial_type: "text" as "text" | "video",
    video_url: ""
  })
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getMyInternshipTestimonials()
        setInternship(response.internship)
        setTestimonials(response.testimonials || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des témoignages")
        toast.error("Erreur lors du chargement des témoignages")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      
      // Get user's internship to get the stage ID
      let internship
      try {
        internship = await apiClient.getMyInternship()
      } catch (err: any) {
        toast.error("Vous devez avoir un stage actif pour soumettre un témoignage")
        return
      }
      
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("content", formData.content)
      formDataObj.append("testimonial_type", formData.testimonial_type)
      formDataObj.append("stage", internship.id.toString())
      
      if (formData.testimonial_type === "video") {
        if (selectedVideo) {
          formDataObj.append("video_file", selectedVideo)
        } else if (formData.video_url) {
          formDataObj.append("video_url", formData.video_url)
        }
      }

      if (editingTestimonial) {
        // Update existing testimonial
        const updatedTestimonial = await apiClient.updateTestimonial(editingTestimonial.id, formDataObj)
        setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? updatedTestimonial : t))
        toast.success("Témoignage modifié avec succès")
      } else {
        // Create new testimonial
        const newTestimonial = await apiClient.createTestimonial(formDataObj)
        setTestimonials(prev => [...prev, newTestimonial])
        toast.success("Témoignage soumis avec succès")
      }
      
      setShowForm(false)
      setEditingTestimonial(null)
      setFormData({ title: "", content: "", testimonial_type: "text", video_url: "" })
      setSelectedVideo(null)
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission du témoignage")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      title: testimonial.title,
      content: testimonial.content,
      testimonial_type: testimonial.testimonial_type,
      video_url: testimonial.video_url || ""
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTestimonial(null)
    setFormData({ title: "", content: "", testimonial_type: "text", video_url: "" })
    setSelectedVideo(null)
  }

  // Compute statistics
  const totalTestimonials = testimonials.length
  const approvedTestimonials = testimonials.filter(t => t.status === "approved").length
  const pendingTestimonials = testimonials.filter(t => t.status === "pending").length
  const rejectedTestimonials = testimonials.filter(t => t.status === "rejected").length

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
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes témoignages</h1>
            <p className="text-gray-600 mt-1">Gérez vos témoignages de stage</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau témoignage
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total témoignages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTestimonials}</div>
              <p className="text-xs text-gray-600">Tous vos témoignages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTestimonials}</div>
              <p className="text-xs text-yellow-600">En cours de validation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedTestimonials}</div>
              <p className="text-xs text-green-600">Publiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedTestimonials}</div>
              <p className="text-xs text-red-600">À modifier</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des témoignages */}
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun témoignage</h3>
                  <p className="text-gray-600 mb-4">Vous n'avez pas encore soumis de témoignage.</p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer mon premier témoignage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            testimonials.map((testimonial, index) => (
              <Card key={testimonial.id || `testimonial-${index}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(testimonial.testimonial_type)}
                          <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                        </div>
                        {getStatusBadge(testimonial.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{testimonial.stage?.company || "—"}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(testimonial.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      {testimonial.moderated_by && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Modéré par :</span> {testimonial.moderated_by.prenom} {testimonial.moderated_by.nom}
                          {testimonial.moderated_at && (
                            <span> le {new Date(testimonial.moderated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {testimonial.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{testimonial.content}</p>
                    </div>

                    {(testimonial.video_url || testimonial.video_file) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Vidéo associée</span>
                        </div>
                        {testimonial.video_file ? (
                          <video 
                            controls 
                            className="w-full max-w-md rounded-lg"
                            src={testimonial.video_file}
                          >
                            Votre navigateur ne supporte pas la lecture de vidéos.
                          </video>
                        ) : (
                          <a 
                            href={testimonial.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Voir la vidéo
                          </a>
                        )}
                      </div>
                    )}

                    {testimonial.moderation_comment && (
                      <div className={`p-4 rounded-lg ${
                        testimonial.status === 'approved' 
                          ? 'bg-green-50 border-l-4 border-green-400' 
                          : 'bg-yellow-50 border-l-4 border-yellow-400'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {testimonial.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="font-medium">
                            {testimonial.status === 'approved' ? 'Commentaire d\'approbation' : 'Commentaire de rejet'}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          testimonial.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {testimonial.moderation_comment}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Stage :</span> {testimonial.stage?.title || '—'}
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(testimonial.status)}
                        <span className="text-sm text-gray-600">
                          {testimonial.status === 'approved' && 'Publié sur la plateforme'}
                          {testimonial.status === 'pending' && 'En cours de validation'}
                          {testimonial.status === 'rejected' && 'Nécessite des modifications'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de création/modification */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial 
                  ? 'Modifiez votre témoignage selon les commentaires de modération.'
                  : 'Partagez votre expérience de stage avec la communauté.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-6" id="testimonial-form">
              <div>
                <Label htmlFor="title">Titre du témoignage</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Une expérience enrichissante"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez votre expérience de stage..."
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="testimonial_type">Type de témoignage</Label>
                <Select 
                  value={formData.testimonial_type} 
                  onValueChange={(value: "text" | "video") => setFormData({ ...formData, testimonial_type: value })}
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
              
              {formData.testimonial_type === "video" && (
                <VideoUpload
                  onVideoSelect={setSelectedVideo}
                  onVideoUrlChange={(url) => setFormData({ ...formData, video_url: url })}
                  selectedVideo={selectedVideo}
                  videoUrl={formData.video_url}
                  maxSize={50}
                  acceptedFormats={['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']}
                />
              )}
            </form>
            
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4 bg-white">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-500">
                  <span>💡 Appuyez sur Entrée pour soumettre</span>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting} form="testimonial-form">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingTestimonial ? 'Modifier' : 'Soumettre'}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
