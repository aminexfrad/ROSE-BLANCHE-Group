/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, Evaluation } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  CheckCircle,
  Star,
  Users,
  FileText,
  Award,
  TrendingUp,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Calendar,
  Mail,
  AlertCircle,
} from "lucide-react"

interface EvaluationWithStage extends Evaluation {
  stagiaire: {
    nom: string
    email: string
    avatar?: string
  }
  type: string
  etape: string
  dateEcheance: string
  statut: string
  documents: Array<{
    nom: string
    taille: string
    type: string
  }>
  noteActuelle: number | null
  commentaires: string
  criteres: Array<{
    nom: string
    note: number
    poids: number
  }>
}

export default function TuteurEvaluationsPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<EvaluationWithStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null)

  const breadcrumbs = [{ label: "Tableau de bord", href: "/tuteur" }, { label: "Évaluations" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const evaluationsResponse = await apiClient.getTuteurEvaluations()
        
        // Transform evaluations data to match the expected format
        const evaluationsData = (evaluationsResponse.results || []).map((evaluation: Evaluation) => {
          return {
            ...evaluation,
            stagiaire: {
              nom: `${evaluation.evaluated.prenom || ''} ${evaluation.evaluated.nom || ''}`,
              email: evaluation.evaluated.email,
              avatar: evaluation.evaluated.avatar
            },
            type: evaluation.evaluation_type === 'tuteur_stagiaire' ? 'Évaluation stagiaire' : 'Évaluation mi-parcours',
            etape: 'Développement', // This should come from backend
            dateEcheance: evaluation.completed_at || new Date().toISOString(),
            statut: evaluation.is_completed ? 'Évalué' : 'En attente',
            documents: [], // This should come from backend
            noteActuelle: evaluation.overall_score || null,
            commentaires: evaluation.comments || '',
            criteres: Object.entries(evaluation.scores || {}).map(([key, value]) => ({
              nom: key,
              note: value,
              poids: 20 // Default weight
            }))
          }
        })
        
        setEvaluations(evaluationsData)
      } catch (err: any) {
        console.error('Error fetching evaluations:', err)
        setError(err.message || 'Failed to load evaluations')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Évalué":
        return "bg-green-100 text-green-800 border-green-200"
      case "En retard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "En attente":
        return <Clock className="h-4 w-4" />
      case "En cours":
        return <TrendingUp className="h-4 w-4" />
      case "Évalué":
        return <CheckCircle className="h-4 w-4" />
      case "En retard":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

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

  const evaluationsEnAttente = evaluations.filter((e) => e.statut === "En attente" || e.statut === "En retard")
  const evaluationsTerminees = evaluations.filter((e) => e.statut === "Évalué")
  const notesMoyennes =
    evaluationsTerminees.reduce((acc, e) => acc + (e.noteActuelle || 0), 0) / evaluationsTerminees.length

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Évaluations
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Gérez les évaluations et validez les livrables de vos stagiaires
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                <FileText className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 hover:scale-105 transition-all">
                <Award className="mr-2 h-4 w-4" />
                Nouvelle évaluation
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "En attente",
              value: evaluationsEnAttente.length,
              icon: Clock,
              color: "from-yellow-500 to-yellow-600",
              description: "Évaluations à traiter",
            },
            {
              title: "Terminées",
              value: evaluationsTerminees.length,
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
              description: "Ce mois",
            },
            {
              title: "Note moyenne",
              value: `${notesMoyennes.toFixed(1)}/20`,
              icon: Star,
              color: "from-blue-500 to-blue-600",
              description: "Performance globale",
            },
            {
              title: "Stagiaires",
              value: new Set(evaluations.map((e) => e.stagiaire.email)).size,
              icon: Users,
              color: "from-purple-500 to-purple-600",
              description: "À évaluer",
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

        {/* Évaluations en attente */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-red-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Clock className="h-6 w-6 text-yellow-600" />
              Évaluations en attente
            </CardTitle>
            <CardDescription className="text-lg">
              {evaluationsEnAttente.length} évaluation(s) nécessitent votre attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {evaluationsEnAttente.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Toutes les évaluations sont à jour !</h3>
                <p className="text-gray-600">Aucune évaluation en attente pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {evaluationsEnAttente.map((evaluation, index) => (
                  <div
                    key={evaluation.id}
                    className={`p-6 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-yellow-50 transition-all duration-300 animate-in slide-in-from-bottom duration-500 delay-${index * 100} ${
                      index === evaluationsEnAttente.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={evaluation.stagiaire?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                            {evaluation.stagiaire?.nom?.split(" ").map((n) => n[0]).join("") || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{evaluation.stagiaire?.nom || ''}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{evaluation.stagiaire?.email || ''}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Échéance: {new Date(evaluation.dateEcheance).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={`${getStatutColor(evaluation.statut)} border`}>
                            {getStatutIcon(evaluation.statut)}
                            <span className="ml-1">{evaluation.statut}</span>
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{evaluation.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-green-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Évaluations terminées */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Évaluations terminées
            </CardTitle>
            <CardDescription className="text-lg">
              {evaluationsTerminees.length} évaluation(s) complétées
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {evaluationsTerminees.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune évaluation terminée</h3>
                <p className="text-gray-600">Les évaluations terminées apparaîtront ici.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {evaluationsTerminees.map((evaluation, index) => (
                  <div
                    key={evaluation.id}
                    className={`p-6 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 transition-all duration-300 animate-in slide-in-from-bottom duration-500 delay-${index * 100} ${
                      index === evaluationsTerminees.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={evaluation.stagiaire?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            {evaluation.stagiaire?.nom?.split(" ").map((n) => n[0]).join("") || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{evaluation.stagiaire?.nom || ''}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{evaluation.stagiaire?.email || ''}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">{evaluation.noteActuelle}/20</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={`${getStatutColor(evaluation.statut)} border`}>
                            {getStatutIcon(evaluation.statut)}
                            <span className="ml-1">{evaluation.statut}</span>
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{evaluation.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-purple-50">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
