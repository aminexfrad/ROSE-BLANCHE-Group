/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, Stage, Step } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, FileText, Calendar, Loader2, AlertCircle, TrendingUp, Target } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function StagiaireParcoursPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/stagiaire" }, { label: "Parcours" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internship, setInternship] = useState<Stage | null>(null)
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getMyInternshipSteps()
        setInternship(response.internship)
        setSteps(response.steps || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du parcours")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case "validated":
        return <Badge className="bg-red-100 text-red-800">Validé</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "validated":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  // Compute statistics
  const totalSteps = steps.length
  const completedSteps = steps.filter(s => s.status === "completed" || s.status === "validated").length
  const inProgressSteps = steps.filter(s => s.status === "in_progress").length
  const pendingSteps = steps.filter(s => s.status === "pending").length
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement du parcours</h2>
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
            Mon Parcours de Stage
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Suivez votre progression et vos étapes</p>
        </div>

        {/* Informations du stage */}
        {internship && (
          <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Target className="h-6 w-6 text-blue-600" />
                {internship.title}
              </CardTitle>
              <CardDescription>
                {internship.company} • {internship.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{internship.progress || 0}%</div>
                  <div className="text-sm text-gray-600">Progression globale</div>
                  <Progress value={internship.progress || 0} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{internship.days_remaining || 0}</div>
                  <div className="text-sm text-gray-600">Jours restants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{internship.duration_days || 0}</div>
                  <div className="text-sm text-gray-600">Durée totale</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques des étapes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total étapes",
              value: totalSteps.toString(),
              icon: Target,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Terminées",
              value: completedSteps.toString(),
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
            },
            {
              title: "En cours",
              value: inProgressSteps.toString(),
              icon: Clock,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              title: "En attente",
              value: pendingSteps.toString(),
              icon: AlertTriangle,
              color: "from-gray-500 to-gray-600",
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

        {/* Timeline des étapes */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Timeline des étapes
            </CardTitle>
            <CardDescription>
              Progression détaillée de votre parcours
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {steps.length > 0 ? (
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        step.status === "completed" || step.status === "validated" 
                          ? "bg-green-500 border-green-500" 
                          : step.status === "in_progress"
                          ? "bg-yellow-500 border-yellow-500"
                          : step.status === "rejected"
                          ? "bg-red-500 border-red-500"
                          : "bg-gray-300 border-gray-300"
                      }`}></div>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 h-8 mx-auto mt-1 ${
                          step.status === "completed" || step.status === "validated"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}></div>
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{step.title}</h4>
                          {step.description && (
                            <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                          )}
                        </div>
                        {getStatusBadge(step.status)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {step.due_date ? format(new Date(step.due_date), 'dd/MM/yyyy', { locale: fr }) : "Pas de date limite"}
                        </div>
                        {step.completed_date && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Terminé le {format(new Date(step.completed_date), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        )}
                      </div>

                      {step.tuteur_feedback && (
                        <div className="bg-red-50 p-3 rounded-lg mb-3">
                                                      <h5 className="font-medium text-red-900 mb-1">Feedback du tuteur:</h5>
                            <p className="text-red-800 text-sm">{step.tuteur_feedback}</p>
                        </div>
                      )}

                      {step.stagiaire_comment && (
                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <h5 className="font-medium text-green-900 mb-1">Votre commentaire:</h5>
                          <p className="text-green-800 text-sm">{step.stagiaire_comment}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {step.status === "pending" && (
                          <Button size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Commencer
                          </Button>
                        )}
                        {step.status === "in_progress" && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marquer comme terminé
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune étape définie pour votre stage</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progression globale */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Progression globale
            </CardTitle>
            <CardDescription>
              Vue d'ensemble de votre avancement
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{overallProgress}%</div>
                <div className="text-gray-600 mb-4">Progression générale</div>
                <Progress value={overallProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
                  <div className="text-sm text-gray-600">Étapes terminées</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-yellow-600">{inProgressSteps}</div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-gray-600">{pendingSteps}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
