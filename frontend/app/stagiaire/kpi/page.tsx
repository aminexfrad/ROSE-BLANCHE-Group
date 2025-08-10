/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, Evaluation, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Award, Star, Loader2, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react"

interface KPIQuestion {
  id: number
  question: string
  category: string
  score?: number
  max_score: number
}

export default function StagiaireKPIPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/stagiaire" }, { label: "KPI" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [kpiQuestions, setKpiQuestions] = useState<KPIQuestion[]>([])
  const [internship, setInternship] = useState<Stage | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [evaluationsRes, kpiRes, internshipRes] = await Promise.all([
          apiClient.getMyInternshipEvaluations(),
          apiClient.getKPIs(),
          apiClient.getMyInternship().catch(() => null),
        ])
        setEvaluations(evaluationsRes.evaluations || [])
        setKpiQuestions(kpiRes.results || [])
        setInternship(internshipRes)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des KPI")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Compute KPI scores from evaluations
  const computeKPIScores = () => {
    const scores: Record<string, number> = {}
    const maxScores: Record<string, number> = {}
    
    evaluations.forEach(evaluation => {
      if (evaluation.scores) {
        Object.entries(evaluation.scores).forEach(([key, score]) => {
          if (!scores[key]) scores[key] = 0
          scores[key] += score
          if (!maxScores[key]) maxScores[key] = 0
          maxScores[key] = Math.max(maxScores[key], score)
        })
      }
    })

    // Average the scores
    Object.keys(scores).forEach(key => {
      const count = evaluations.filter(e => e.scores?.[key] !== undefined).length
      if (count > 0) {
        scores[key] = Math.round(scores[key] / count)
      }
    })

    return { scores, maxScores }
  }

  const { scores, maxScores } = computeKPIScores()

  // Calculate overall statistics
  const totalEvaluations = evaluations.length
  const averageScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length)
    : 0
  const completedEvaluations = evaluations.filter(e => e.is_completed).length
  const pendingEvaluations = totalEvaluations - completedEvaluations

  // Group KPI questions by category
  const kpiByCategory = kpiQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push({
      ...question,
      score: scores[question.question] || 0,
      max_score: maxScores[question.question] || question.max_score
    })
    return acc
  }, {} as Record<string, (KPIQuestion & { score: number })[]>)

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des KPI</h2>
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Mes KPI & Évaluations
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">Suivez vos performances et objectifs</p>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Note moyenne",
              value: averageScore + "/20",
              icon: Star,
              color: "from-yellow-500 to-yellow-600",
            },
            {
              title: "Évaluations complétées",
              value: completedEvaluations.toString(),
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
            },
            {
              title: "En attente",
              value: pendingEvaluations.toString(),
              icon: Clock,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Progression stage",
              value: (internship?.progress || 0) + "%",
              icon: TrendingUp,
              color: "from-purple-500 to-purple-600",
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

        {/* KPI par catégorie */}
        {Object.keys(kpiByCategory).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(kpiByCategory).map(([category, questions], categoryIndex) => (
              <Card key={category} className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-${(categoryIndex + 3) * 100}">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                    {category}
                  </CardTitle>
                  <CardDescription>
                    Évaluation des compétences en {category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {questions.map((question, index) => {
                      const percentage = (question.score / question.max_score) * 100
                      const getScoreColor = (score: number, max: number) => {
                        const percentage = (score / max) * 100
                        if (percentage >= 80) return "text-green-600"
                        if (percentage >= 60) return "text-yellow-600"
                        return "text-red-600"
                      }
                      
                      return (
                        <div key={question.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{question.question}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${getScoreColor(question.score, question.max_score)}`}>
                                {question.score}/{question.max_score}
                              </span>
                              <Badge variant="outline" className={getScoreColor(question.score, question.max_score)}>
                                {Math.round(percentage)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-600">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Target className="h-6 w-6 text-yellow-600" />
                Aucun KPI disponible
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun KPI n'est encore disponible pour votre stage</p>
            </CardContent>
          </Card>
        )}

        {/* Évaluations récentes */}
        {evaluations.length > 0 && (
          <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                Évaluations récentes
              </CardTitle>
              <CardDescription>
                Dernières évaluations reçues
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {evaluations.slice(0, 5).map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${evaluation.is_completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <h4 className="font-medium">{evaluation.evaluation_type.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-gray-500">
                          Évalué par: {evaluation.evaluator?.prenom} {evaluation.evaluator?.nom}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {evaluation.overall_score || 0}/20
                      </div>
                      <div className="text-sm text-gray-500">
                        {evaluation.completed_at ? 
                          new Date(evaluation.completed_at).toLocaleDateString('fr-FR') : 
                          'En cours'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Objectifs et recommandations */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              Objectifs et recommandations
            </CardTitle>
            <CardDescription>
              Suggestions d'amélioration basées sur vos performances
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-purple-600">Points forts</h3>
                <ul className="space-y-2">
                  {Object.entries(scores)
                    .filter(([_, score]) => score >= 16)
                    .slice(0, 3)
                    .map(([key, score]) => (
                      <li key={key} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{key}: {score}/20</span>
                      </li>
                    ))}
                  {Object.entries(scores).filter(([_, score]) => score >= 16).length === 0 && (
                    <li className="text-sm text-gray-500">Aucun point fort identifié pour le moment</li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-orange-600">Axes d'amélioration</h3>
                <ul className="space-y-2">
                  {Object.entries(scores)
                    .filter(([_, score]) => score < 14)
                    .slice(0, 3)
                    .map(([key, score]) => (
                      <li key={key} className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{key}: {score}/20</span>
                      </li>
                    ))}
                  {Object.entries(scores).filter(([_, score]) => score < 14).length === 0 && (
                    <li className="text-sm text-gray-500">Aucun axe d'amélioration identifié</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
