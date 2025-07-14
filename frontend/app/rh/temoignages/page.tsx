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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { useState, useEffect } from "react"

export default function RHTemoignagesPage() {
  const [temoignages, setTemoignages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const breadcrumbs = [{ label: "RH", href: "/rh" }, { label: "Témoignages" }]

  useEffect(() => {
    const fetchTemoignages = async () => {
      try {
        // TODO: Implement api.getTestimonials() in ApiClient if missing
        const data = await apiClient.getTestimonials();
        setTemoignages(data.results || [])
      } catch (err) {
        setError("Erreur lors du chargement des témoignages.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTemoignages()
  }, [])

  const getStatutBadge = (statut: string) => {
    const colors = {
      en_attente: "bg-yellow-100 text-yellow-800",
      publie: "bg-green-100 text-green-800",
      rejete: "bg-red-100 text-red-800",
      brouillon: "bg-gray-100 text-gray-800",
    }
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const renderStars = (note: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < note ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
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
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
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
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-gray-600">+8 ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-yellow-600">À valider</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publiés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98</div>
              <p className="text-xs text-gray-600">77% du total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.3/5</div>
              <p className="text-xs text-green-600">Très satisfaisant</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des témoignages */}
        <div className="space-y-6">
          {temoignages.map((temoignage) => (
            <Card key={temoignage.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{temoignage.titre}</CardTitle>
                      <Badge className={getStatutBadge(temoignage.statut)}>{temoignage.statut.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{temoignage.stagiaire}</span>
                      <span>•</span>
                      <span>{temoignage.institut}</span>
                      <span>•</span>
                      <span>{temoignage.specialite}</span>
                      <span>•</span>
                      <span>{temoignage.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-600">Note:</span>
                      <div className="flex">{renderStars(temoignage.note)}</div>
                      <span className="text-sm font-medium">({temoignage.note}/5)</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publier
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <X className="mr-2 h-4 w-4" />
                        Rejeter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{temoignage.contenu}</p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Tuteur:</span> {temoignage.tuteur}
                    </div>

                    {temoignage.statut === "en_attente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Publier
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions en lot */}
        <Card>
          <CardHeader>
            <CardTitle>Actions en lot</CardTitle>
            <CardDescription>Gérez plusieurs témoignages simultanément</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Publier sélectionnés
              </Button>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Rejeter sélectionnés
              </Button>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer sélectionnés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
