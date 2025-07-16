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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Star,
  CheckCircle,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  User,
  Building,
  FileText,
  Video,
  Loader2,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Testimonial } from "@/lib/api"

export default function RHTemoignagesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [moderationDialog, setModerationDialog] = useState(false)
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve')
  const [moderationComment, setModerationComment] = useState('')
  const [isModerating, setIsModerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const breadcrumbs = [{ label: "RH", href: "/rh" }, { label: "Témoignages" }]

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getRHTestimonials()
      setTestimonials(response.results || [])
    } catch (err: any) {
      setError("Erreur lors du chargement des témoignages.")
      toast.error("Erreur lors du chargement des témoignages")
    } finally {
      setIsLoading(false)
    }
  }

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
        return <X className="h-5 w-5 text-red-600" />
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

  const handleModeration = async () => {
    if (!selectedTestimonial) return

    try {
      setIsModerating(true)
      await apiClient.moderateRHTestimonial(
        selectedTestimonial.id,
        moderationAction,
        moderationComment
      )
      
      toast.success(
        moderationAction === 'approve' 
          ? 'Témoignage approuvé avec succès' 
          : 'Témoignage rejeté avec succès'
      )
      
      setModerationDialog(false)
      setSelectedTestimonial(null)
      setModerationComment('')
      fetchTestimonials() // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modération')
    } finally {
      setIsModerating(false)
    }
  }

  const openModerationDialog = (testimonial: Testimonial, action: 'approve' | 'reject') => {
    setSelectedTestimonial(testimonial)
    setModerationAction(action)
    setModerationComment('')
    setModerationDialog(true)
  }

  // Compute statistics
  const totalTestimonials = testimonials.length
  const pendingTestimonials = testimonials.filter(t => t.status === "pending").length
  const approvedTestimonials = testimonials.filter(t => t.status === "approved").length
  const rejectedTestimonials = testimonials.filter(t => t.status === "rejected").length

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${testimonial.author.prenom} ${testimonial.author.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter
    const matchesType = typeFilter === 'all' || testimonial.testimonial_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
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

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des témoignages</h1>
            <p className="text-gray-600 mt-1">Validez et modérez les témoignages des stagiaires</p>
          </div>
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
              <p className="text-xs text-gray-600">Tous les témoignages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTestimonials}</div>
              <p className="text-xs text-yellow-600">À valider</p>
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
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedTestimonials}</div>
              <p className="text-xs text-red-600">À modifier</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Rechercher par titre, contenu ou auteur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status-filter">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvés</SelectItem>
                    <SelectItem value="rejected">Rejetés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des témoignages */}
        <div className="space-y-4">
          {filteredTestimonials.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun témoignage trouvé</h3>
                  <p className="text-gray-600">Aucun témoignage ne correspond à vos critères de recherche.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
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
                          <User className="h-4 w-4" />
                          <span>{testimonial.author.prenom} {testimonial.author.nom}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{testimonial.stage.company}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(testimonial.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                                             {testimonial.moderated_by && (
                         <div className="text-sm text-gray-600">
                           <span className="font-medium">Modéré par :</span> {testimonial.moderated_by.prenom} {testimonial.moderated_by.nom}
                           {testimonial.moderated_at && (
                             <span> le {new Date(testimonial.moderated_at).toLocaleDateString('fr-FR')}</span>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{testimonial.content}</p>
                    </div>

                    {testimonial.video_url && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Vidéo associée</span>
                        </div>
                        <a 
                          href={testimonial.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Voir la vidéo
                        </a>
                      </div>
                    )}

                    {testimonial.moderation_comment && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Commentaire de modération</span>
                        </div>
                        <p className="text-yellow-800 text-sm">{testimonial.moderation_comment}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Stage :</span> {testimonial.stage.title}
                      </div>

                      {testimonial.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openModerationDialog(testimonial, 'reject')}
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Rejeter
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openModerationDialog(testimonial, 'approve')}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de modération */}
        <Dialog open={moderationDialog} onOpenChange={setModerationDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {moderationAction === 'approve' ? 'Approuver le témoignage' : 'Rejeter le témoignage'}
              </DialogTitle>
              <DialogDescription>
                {moderationAction === 'approve' 
                  ? 'Ce témoignage sera publié sur la plateforme publique.'
                  : 'Ce témoignage sera rejeté et l\'auteur pourra le modifier.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedTestimonial && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedTestimonial.title}</h4>
                  <p className="text-sm text-gray-600">{selectedTestimonial.content.substring(0, 200)}...</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="moderation-comment">
                  {moderationAction === 'approve' ? 'Commentaire (optionnel)' : 'Commentaire de rejet'}
                </Label>
                <Textarea
                  id="moderation-comment"
                  placeholder={
                    moderationAction === 'approve' 
                      ? 'Ajouter un commentaire positif...'
                      : 'Expliquer les raisons du rejet...'
                  }
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setModerationDialog(false)}
                disabled={isModerating}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleModeration}
                disabled={isModerating}
                className={
                  moderationAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isModerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {moderationAction === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
