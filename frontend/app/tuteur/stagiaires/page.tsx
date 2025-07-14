/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  FileText,
  Star,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  GraduationCap,
} from "lucide-react"

interface StagiaireData extends Stage {
  documentsEnAttente: number
  dernierContact: string
  note: number
}

export default function TuteurStagiairesPage() {
  const { user } = useAuth()
  const [stagiaires, setStagiaires] = useState<StagiaireData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const breadcrumbs = [{ label: "Tableau de bord", href: "/tuteur" }, { label: "Mes Stagiaires" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getTuteurStages()
        
        // Transform the data to match the expected format
        const stagiairesData = (response.results || []).map((stage: Stage) => ({
          ...stage,
          documentsEnAttente: Math.floor(Math.random() * 4), // This should come from backend
          dernierContact: "Il y a 2 jours", // This should come from backend
          note: 4.5 // This should come from backend
        }))
        
        setStagiaires(stagiairesData)
      } catch (err: any) {
        console.error('Error fetching stagiaires:', err)
        setError(err.message || 'Failed to load stagiaires')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatutColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatutLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En cours"
      case "completed":
        return "Terminé"
      case "suspended":
        return "Suspendu"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  const filteredStagiaires = stagiaires.filter(
    (stagiaire) =>
      `${stagiaire.stagiaire?.prenom || ''} ${stagiaire.stagiaire?.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.stagiaire?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stagiaire.stagiaire?.institut || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stagiaire.stagiaire?.specialite || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Mes Stagiaires
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Gérez et suivez la progression de vos {stagiaires.length} stagiaires
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 hover:scale-105 transition-all">
                <Users className="mr-2 h-4 w-4" />
                Nouveau stagiaire
              </Button>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <Card className="animate-in slide-in-from-top duration-700 delay-200 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher un stagiaire par nom, email, institut ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-2 focus:border-red-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total Stagiaires",
              value: stagiaires.length,
              icon: Users,
              color: "from-blue-500 to-blue-600",
              description: "Stagiaires actifs",
            },
            {
              title: "Progression Moyenne",
              value: `${Math.round(stagiaires.reduce((acc, s) => acc + (s.progress || 0), 0) / stagiaires.length)}%`,
              icon: TrendingUp,
              color: "from-green-500 to-green-600",
              description: "Performance globale",
            },
            {
              title: "Documents en attente",
              value: stagiaires.reduce((acc, s) => acc + s.documentsEnAttente, 0),
              icon: FileText,
              color: "from-yellow-500 to-yellow-600",
              description: "À valider",
            },
            {
              title: "Note Moyenne",
              value: `${(stagiaires.reduce((acc, s) => acc + s.note, 0) / stagiaires.length).toFixed(1)}/5`,
              icon: Star,
              color: "from-purple-500 to-purple-600",
              description: "Évaluation globale",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-700 delay-${(index + 3) * 100}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-white opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.description}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg">{stat.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste des stagiaires */}
        <Card className="shadow-xl border-0 animate-in fade-in duration-1000 delay-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-red-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="h-6 w-6 text-red-600" />
              Liste des Stagiaires
            </CardTitle>
            <CardDescription className="text-lg">{filteredStagiaires.length} stagiaire(s) trouvé(s)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredStagiaires.map((stagiaire, index) => (
                <div
                  key={stagiaire.id}
                  className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                    index === filteredStagiaires.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 ring-2 ring-gray-200">
                        <AvatarImage src={stagiaire.stagiaire?.avatar || undefined} />
                        <AvatarFallback className="text-lg font-semibold">
                          {(stagiaire.stagiaire?.prenom?.charAt(0) || '')}{(stagiaire.stagiaire?.nom?.charAt(0) || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {stagiaire.stagiaire?.prenom || ''} {stagiaire.stagiaire?.nom || ''}
                        </h3>
                        <div className="space-y-1">
                          <span>{stagiaire.stagiaire?.email || ''}</span>
                          {stagiaire.stagiaire?.telephone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{stagiaire.stagiaire.telephone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span>{stagiaire.stagiaire?.institut || 'Non spécifié'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 text-gray-400" />
                            <span>{stagiaire.stagiaire?.specialite || 'Non spécifié'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stagiaire.progress}%</div>
                        <div className="text-sm text-gray-600">Progression</div>
                        <Progress value={stagiaire.progress} className="w-20 h-2 mt-1" />
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stagiaire.note}/5</div>
                        <div className="text-sm text-gray-600">Note</div>
                        <div className="flex items-center justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(stagiaire.note) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stagiaire.documentsEnAttente}</div>
                        <div className="text-sm text-gray-600">Documents</div>
                        <div className="text-xs text-gray-500 mt-1">en attente</div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatutColor(stagiaire.status)}>
                          {getStatutLabel(stagiaire.status)}
                        </Badge>
                        <div className="text-xs text-gray-500">{stagiaire.dernierContact}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="hover:bg-red-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
