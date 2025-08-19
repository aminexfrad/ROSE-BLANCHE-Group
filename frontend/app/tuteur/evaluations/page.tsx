/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Calendar, Clock, MapPin, User, FileText, CheckCircle, Clock4 } from "lucide-react"
import { apiClient, Evaluation as ApiEvaluation } from "@/lib/api"


interface LocalEvaluation {
  id: number
  stagiaire: {
    nom: string
    email: string
    avatar?: string
  }
  type: string
  etape: string
  dateEcheance: string
  statut: string
  documents: any[]
  noteActuelle: number | null
  commentaires: string
  criteres: Array<{
    nom: string
    note: number
    poids: number
  }>
}

interface EvaluationWithStage extends LocalEvaluation {
  stage?: {
    id: number
    title: string
    progress: number
  }
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
        const evaluationsData = (evaluationsResponse.results || []).map((evaluation: ApiEvaluation) => {
          return {
            id: evaluation.id,
            stagiaire: {
              nom: `${evaluation.evaluated?.prenom || ''} ${evaluation.evaluated?.nom || ''}`,
              email: evaluation.evaluated?.email || '',
              avatar: evaluation.evaluated?.avatar
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
              note: value as number,
              poids: 20 // Default weight
            }))
          }
        })
        
        setEvaluations(evaluationsData)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return 'bg-yellow-100 text-yellow-800'
      case 'VALIDATED':
        return 'bg-green-100 text-green-800'
      case 'REVISION_REQUESTED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_TUTEUR':
        return 'En attente'
      case 'VALIDATED':
        return 'Validé'
      case 'REVISION_REQUESTED':
        return 'Révision demandée'
      default:
        return status
    }
  }

  const evaluationsTerminees = evaluations.filter(e => e.statut === 'Évalué')
  const evaluationsEnCours = evaluations.filter(e => e.statut === 'En attente')

  const notesMoyennes =
    evaluationsTerminees.reduce((acc, e) => acc + (e.noteActuelle || 0), 0) / evaluationsTerminees.length

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">


        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total évaluations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationsEnCours.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationsTerminees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluationsTerminees.length > 0 ? notesMoyennes.toFixed(1) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations List */}
        <Card>
          <CardHeader>
            <CardTitle>Évaluations</CardTitle>
            <CardDescription>Gérez les évaluations de vos stagiaires</CardDescription>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune évaluation à traiter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{evaluation.stagiaire.nom}</h4>
                          <Badge variant={evaluation.statut === 'Évalué' ? 'default' : 'secondary'}>
                            {evaluation.statut}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{evaluation.type}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Étape: {evaluation.etape}</span>
                          <span>Échéance: {new Date(evaluation.dateEcheance).toLocaleDateString()}</span>
                        </div>
                        {evaluation.noteActuelle !== null && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">Note: {evaluation.noteActuelle}/20</span>
                            </div>
                            <Progress value={(evaluation.noteActuelle / 20) * 100} className="w-full" />
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
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
