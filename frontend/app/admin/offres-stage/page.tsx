"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, OffreStage, PFEProject } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react"

interface OffreStageFormData {
  reference: string
  title: string
  description: string
  objectives: string
  keywords: string
  diplome: string
  specialite: string
  nombre_postes: number
  ville: string
}

const initialFormData: OffreStageFormData = {
  reference: '',
  title: '',
  description: '',
  objectives: '',
  keywords: '',
  diplome: '',
  specialite: '',
  nombre_postes: 1,
  ville: ''
}

export default function OffresStageAdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [offres, setOffres] = useState<OffreStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOffre, setEditingOffre] = useState<OffreStage | null>(null)
  const [formData, setFormData] = useState<OffreStageFormData>(initialFormData)

  const breadcrumbs = [
    { label: "Administration", href: "/admin" },
    { label: "Offres de Stage" }
  ]

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const offresResponse = await apiClient.getOffresStage();
      setOffres(offresResponse.results || []);
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOffre = async () => {
    try {
      await apiClient.createOffreStage(formData)
      toast({
        title: "Succès",
        description: "Offre de stage créée avec succès",
      })
      setIsCreateDialogOpen(false)
      setFormData(initialFormData)
      fetchData()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la création",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOffre = async () => {
    if (!editingOffre || typeof editingOffre.id !== 'number' || isNaN(editingOffre.id)) {
      toast({
        title: "Erreur",
        description: "ID de l'offre invalide ou manquant.",
        variant: "destructive",
      })
      return
    }
    try {
      await apiClient.updateOffreStage(editingOffre.id, formData)
      toast({
        title: "Succès",
        description: "Offre de stage mise à jour avec succès",
      })
      setIsEditDialogOpen(false)
      setEditingOffre(null)
      setFormData(initialFormData)
      fetchData()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOffre = async (id: number) => {
    try {
      await apiClient.deleteOffreStage(id)
      toast({
        title: "Succès",
        description: "Offre de stage supprimée avec succès",
      })
      fetchData()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la suppression",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (offre: OffreStage) => {
    setEditingOffre(offre)
    setFormData({
      reference: offre.reference,
      title: offre.title,
      description: offre.description,
      objectives: offre.objectives || '',
      keywords: offre.keywords || '',
      diplome: offre.diplome || '',
      specialite: offre.specialite || '',
      nombre_postes: offre.nombre_postes || 1,
      ville: offre.ville || ''
    })
    setIsEditDialogOpen(true)
  }

  const filteredOffres = offres.filter(offre => {
    const matchesSearch = (offre.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (offre.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (offre.specialite?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = !statusFilter || offre.status === statusFilter
    const matchesType = !typeFilter || offre.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'PFE': return 'bg-purple-100 text-purple-800'
      case 'Classique': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Offres de Stage</h1>
            <p className="text-gray-600">Créez et gérez les offres de stage pour les candidats</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Offre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle offre de stage</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer une nouvelle offre de stage
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Référence *</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Référence de l'offre"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de l'offre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée du stage"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Objectifs *</Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="Objectifs du stage"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Mots-clés</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="Mots-clés (séparés par des virgules)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diplome">Diplôme requis</Label>
                  <Input
                    id="diplome"
                    value={formData.diplome}
                    onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                    placeholder="Ex: Licence, Master, Doctorat"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialite">Spécialité *</Label>
                  <Input
                    id="specialite"
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    placeholder="Spécialité"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_postes">Nombre de postes *</Label>
                  <Input
                    id="nombre_postes"
                    type="number"
                    value={formData.nombre_postes}
                    onChange={(e) => setFormData({ ...formData, nombre_postes: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Ville"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateOffre}>
                  Créer l'offre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status-filter">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="open">Ouverte</SelectItem>
                    <SelectItem value="closed">Fermée</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="expired">Expirée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Classique">Classique</SelectItem>
                    <SelectItem value="PFE">PFE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setTypeFilter('')
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offres.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offres Ouvertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offres.filter(o => o.status === 'open').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offres PFE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offres.filter(o => o.type === 'PFE').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offres Validées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offres.filter(o => o.validated === true).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Offres de Stage</CardTitle>
            <CardDescription>
              Gérez toutes les offres de stage disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Validée</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffres.map((offre) => (
                  <TableRow key={offre.id || `${offre.reference}-${offre.title}`}>
                    <TableCell className="font-medium">{offre.reference || '-'}</TableCell>
                    <TableCell>{offre.title || '-'}</TableCell>
                    <TableCell>{offre.specialite || '-'}</TableCell>
                    <TableCell>{offre.ville || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(offre.status)}>
                        {offre.status === 'open' ? 'Ouverte' : 
                         offre.status === 'closed' ? 'Fermée' :
                         offre.status === 'draft' ? 'Brouillon' : 
                         offre.status === 'expired' ? 'Expirée' : 'Inconnu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={offre.validated ? "default" : "secondary"}>
                        {offre.validated ? "Oui" : "Non"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(offre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cette offre de stage sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOffre(offre.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'offre de stage</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'offre de stage
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form as create dialog but with update handler */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reference">Référence *</Label>
              <Input
                id="edit-reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Référence de l'offre"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'offre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du stage"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-objectives">Objectifs *</Label>
              <Textarea
                id="edit-objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Objectifs du stage"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-keywords">Mots-clés</Label>
              <Input
                id="edit-keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Mots-clés (séparés par des virgules)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-diplome">Diplôme requis</Label>
              <Input
                id="edit-diplome"
                value={formData.diplome}
                onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                placeholder="Ex: Licence, Master, Doctorat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialite">Spécialité *</Label>
              <Input
                id="edit-specialite"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                placeholder="Spécialité"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nombre_postes">Nombre de postes *</Label>
              <Input
                id="edit-nombre_postes"
                type="number"
                value={formData.nombre_postes}
                onChange={(e) => setFormData({ ...formData, nombre_postes: parseInt(e.target.value) })}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ville">Ville *</Label>
              <Input
                id="edit-ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                placeholder="Ville"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateOffre}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 