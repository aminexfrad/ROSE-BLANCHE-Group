/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Upload,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  Target,
  Users,
  MapPin,
  User,
  Download,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { apiClient, Stage, Step, Document } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface InternshipData extends Stage {
  mentor: string
  documents_count: number
  evaluations_count: number
}

export default function StagiaireDashboard() {
  const { user } = useAuth()
  const [internship, setInternship] = useState<InternshipData | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch internship data
        const internshipData = await apiClient.getMyInternship()
        
        // If we have an internship, fetch related data
        const [stepsData, documentsData] = await Promise.all([
          apiClient.getMyInternshipSteps(),
          apiClient.getMyInternshipDocuments()
        ])
        
        setInternship({
          ...internshipData,
          mentor: internshipData.tuteur?.prenom + ' ' + internshipData.tuteur?.nom || 'Non assigné',
          documents_count: documentsData.documents.length,
          evaluations_count: 0 // Will be updated when evaluations are implemented
        })
        setSteps(stepsData.steps)
        setDocuments(documentsData.documents)
      } catch (err: any) {
        console.error('Error fetching internship data:', err)
        
        // Handle specific "No active internship found" error
        if (err.message?.includes('Aucun stage actif trouvé') || err.message?.includes('No active internship found')) {
          setError('Aucun stage actif trouvé. Veuillez contacter votre administrateur pour vous assigner un stage.')
        } else {
          setError(err.message || 'Erreur lors du chargement des données de stage')
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'validated':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Role badge color mapping
  const roleInfo = {
    rh: { label: "Responsable RH", color: "bg-gradient-to-r from-orange-500 to-red-600 text-white" },
    stagiaire: { label: "Stagiaire", color: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white" },
    tuteur: { label: "Tuteur", color: "bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
    admin: { label: "Administrateur", color: "bg-gradient-to-r from-purple-500 to-pink-600 text-white" },
  }[user?.role || "stagiaire"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={[{ label: "Tableau de bord" }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun stage actif</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mt-4"
              >
                Actualiser la page
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!internship) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun stage actif</h2>
          <p className="text-gray-600">Vous n'avez pas de stage actif pour le moment.</p>
        </div>
      </div>
    )
  }

  const breadcrumbs = [{ label: "Tableau de bord" }]

  const quickActions = [
    {
      title: "Mon Parcours",
      description: "Visualisez votre progression étape par étape",
      icon: Calendar,
      href: "/stagiaire/parcours",
      badge: steps.filter(s => s.status === 'validated').length.toString(),
    },
    {
      title: "Documents",
      description: "Gérez vos documents et téléversements",
      icon: FileText,
      href: "/stagiaire/documents",
      badge: documents.length.toString(),
    },
    {
      title: "KPI & Évaluation",
      description: "Répondez aux questionnaires d'évaluation",
      icon: TrendingUp,
      href: "/stagiaire/kpi",
      badge: "Nouveau",
    },
    {
      title: "Témoignages",
      description: "Partagez votre expérience de stage",
      icon: MessageSquare,
      href: "/stagiaire/temoignages",
      badge: null,
    },
  ]

  return (
    <DashboardLayout allowedRoles={["stagiaire"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bon retour, {user?.prenom} !</h1>
            <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
          </div>
          <Badge className={getStatusColor(internship.status)}>
            {internship.status === 'active' ? 'Actif' : internship.status}
          </Badge>
        </div>

        {/* Main Internship Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {internship.title}
            </CardTitle>
            <CardDescription>{internship.company}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {new Date(internship.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })} - {new Date(internship.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">{internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">{internship.mentor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {internship.days_remaining} jours restants
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{internship.progress}%</span>
              </div>
              <Progress value={internship.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{steps.length}</div>
                <div className="text-sm text-gray-600">Étapes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{documents.length}</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{internship.evaluations_count}</div>
                <div className="text-sm text-gray-600">Évaluations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base sm:text-lg">{action.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full">
                    Accéder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Étapes récentes
            </CardTitle>
            <CardDescription>Progression de votre parcours de stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.slice(0, 3).map((step) => (
                <div key={step.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    {getStepStatusIcon(step.status)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{step.title}</div>
                      <div className="text-sm text-gray-600 truncate">{step.description}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status === 'validated' ? 'Validé' : 
                     step.status === 'completed' ? 'Terminé' :
                     step.status === 'in_progress' ? 'En cours' :
                     step.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </Badge>
                </div>
              ))}
              {steps.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/stagiaire/parcours">
                    <Button variant="outline" size="sm">
                      Voir toutes les étapes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents récents
            </CardTitle>
            <CardDescription>Vos derniers documents téléversés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{doc.title}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.is_approved && (
                      <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/stagiaire/documents">
                    <Button variant="outline" size="sm">
                      Voir tous les documents
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
