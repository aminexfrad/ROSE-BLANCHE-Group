/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, CandidatDashboard, Application } from "@/lib/api"
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Eye,
  FileText,
  Building,
  Calendar,
  TrendingUp,
  User,
  LogOut,
  BookOpen,
  Home,
  RefreshCw
} from "lucide-react"

export default function CandidateDashboardPage() {
  const { toast } = useToast()
  const { candidat, loading: authLoading, logout } = useAuth()
  const [dashboard, setDashboard] = useState<CandidatDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    // Don't check authentication if user is logging out
    if (isLoggingOut) {
      return
    }
    
    // Check if candidate is authenticated
    if (!authLoading) {
      // Additional check for token in localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        if (!hasRedirected) {
          setHasRedirected(true)
          setError('Vous devez être connecté pour accéder à cette page')
          toast({
            title: "Non authentifié",
            description: "Veuillez vous connecter pour accéder à votre tableau de bord",
            variant: "destructive"
          })
          window.location.href = '/login'
        }
        return
      }

      if (!candidat) {
        // Only redirect once to prevent infinite loop
        if (!hasRedirected) {
          setHasRedirected(true)
          setError('Vous devez être connecté pour accéder à cette page')
          toast({
            title: "Non authentifié",
            description: "Veuillez vous connecter pour accéder à votre tableau de bord",
            variant: "destructive"
          })
          // Redirect immediately to prevent any delay
          window.location.href = '/login'
        }
        return
      }

      // Candidate is authenticated, fetch dashboard
      fetchDashboard()
    }
  }, [candidat, authLoading, toast, hasRedirected, isLoggingOut])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      // Force refresh by skipping cache
      const data = await apiClient.getCandidatDashboard()
      console.log('Dashboard data received:', data)
      console.log('Demandes array:', data.demandes)
      console.log('Demandes length:', data.demandes?.length)
      console.log('Statistics:', data.statistiques)
      
      // Set the dashboard data directly
      setDashboard(data)
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      setError(err.message || 'Erreur lors du chargement du tableau de bord')
      
      // If it's an authentication error, redirect to login
      if (err.message?.includes('Session expirée') || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive"
        })
        // Use the candidate auth context to logout
        await logout()
        // Use setTimeout to prevent immediate redirect
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
        return
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de charger votre tableau de bord",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary', icon: Clock },
      interview_scheduled: { label: 'Entretien planifié', variant: 'default', icon: Calendar },
      under_review: { label: 'En révision', variant: 'default', icon: Eye },
      accepted: { label: 'Acceptée', variant: 'default', icon: CheckCircle },
      rejected: { label: 'Rejetée', variant: 'destructive', icon: XCircle },
      withdrawn: { label: 'Retirée', variant: 'outline', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'under_review': return 'text-blue-600'
      case 'withdrawn': return 'text-gray-600'
      default: return 'text-yellow-600'
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboard}>Réessayer</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  // Extract data from dashboard
  const demandes = dashboard?.demandes || []
  const statistiques = dashboard?.statistiques || {
    total_demandes: 0,
    demandes_en_attente: 0,
    demandes_en_revision: 0,
    demandes_acceptees: 0,
    demandes_rejetees: 0,
    demandes_restantes: 0,
    peut_soumettre: false
  }

  console.log('Full dashboard object:', dashboard)
  console.log('Extracted demandes:', demandes)
  console.log('Dashboard keys:', Object.keys(dashboard))
  
  // Use demandes directly from dashboard
  const allDemandes = demandes || []
  console.log('All demandes to display:', allDemandes)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord candidat</h1>
              <p className="text-gray-600 mt-2">
                Gérez vos candidatures et suivez vos postulations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={fetchDashboard}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Link href="/public/demande-stage">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle demande de stage
                </Button>
              </Link>
              <Link href="/public/pfe-book">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Voir les offres
                </Button>
              </Link>
              <Link href="/public">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Accueil
                </Button>
              </Link>
              <Button 
                variant="outline" 
                disabled={isLoggingOut}
                onClick={async () => {
                  try {
                    console.log('Starting logout process...')
                    
                    // Set logging out state to prevent authentication checks
                    setIsLoggingOut(true)
                    
                    // Show loading state
                    toast({
                      title: "Déconnexion en cours...",
                      description: "Veuillez patienter.",
                    })
                    
                    // Perform logout
                    await logout()
                    
                    console.log('Logout completed successfully')
                    
                    // Show success message
                    toast({
                      title: "Déconnexion réussie",
                      description: "Vous avez été déconnecté avec succès.",
                    })
                    
                    // Clear any remaining data
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('token')
                      localStorage.removeItem('refreshToken')
                      localStorage.removeItem('user')
                      localStorage.removeItem('candidate_email')
                    }
                    
                    // Wait a moment for toast to show, then redirect
                    setTimeout(() => {
                      console.log('Redirecting to login page...')
                      window.location.href = '/login'
                    }, 1000)
                    
                  } catch (error) {
                    console.error('Logout error:', error)
                    
                    // Show error message
                    toast({
                      title: "Erreur de déconnexion",
                      description: "Une erreur s'est produite lors de la déconnexion.",
                      variant: "destructive"
                    })
                    
                    // Clear data manually and redirect anyway
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('token')
                      localStorage.removeItem('refreshToken')
                      localStorage.removeItem('user')
                      localStorage.removeItem('candidate_email')
                    }
                    
                    // Still redirect even if logout fails
                    setTimeout(() => {
                      console.log('Redirecting to login page after error...')
                      window.location.href = '/login'
                    }, 2000)
                  }
                }}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.total_demandes}</div>
              <p className="text-xs text-muted-foreground">
                sur {statistiques.total_demandes + statistiques.demandes_restantes} maximum
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistiques.demandes_en_attente}</div>
              <p className="text-xs text-muted-foreground">demandes en cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistiques.demandes_acceptees}</div>
              <p className="text-xs text-muted-foreground">demandes acceptées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restantes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistiques.demandes_restantes}</div>
              <p className="text-xs text-muted-foreground">
                {statistiques.peut_soumettre ? 'demandes possibles' : 'limite atteinte'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mes demandes
            </CardTitle>
            <CardDescription>
              Suivez l'état de toutes vos demandes de stage
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {allDemandes.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore postulé à de nouvelles demandes de stage
                </p>
                <Link href="/public/pfe-book">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Voir les offres
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Debug info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Debug:</strong> {allDemandes.length} demande(s) trouvée(s)
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Statistiques: {statistiques.total_demandes} total, {statistiques.demandes_en_attente} en attente
                  </p>
                </div>
                
                {allDemandes.map((demande: any) => (
                  <div
                    key={demande.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {demande.type_stage} - {demande.specialite}
                          </h4>
                          {getStatusBadge(demande.status)}
                        </div>

                        {/* Interview Information */}
                        {demande.status === 'interview_scheduled' && demande.interview && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-900">Entretien planifié</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                              <div>
                                <strong>Date :</strong> {new Date(demande.interview.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div>
                                <strong>Heure :</strong> {demande.interview.time}
                              </div>
                              <div className="md:col-span-2">
                                <strong>Lieu :</strong> {demande.interview.location}
                              </div>
                              {demande.interview.notes && (
                                <div className="md:col-span-2">
                                  <strong>Notes :</strong> {demande.interview.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            <span>
                              {demande.institut || 'Institut non spécifié'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Soumis le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          {demande.reviewed_at && (
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>
                                Révisé le {new Date(demande.reviewed_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>

                        {demande.feedback && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Feedback :</strong> {demande.feedback}
                            </p>
                          </div>
                        )}

                        {demande.raison_refus && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md">
                            <p className="text-sm text-red-800">
                              <strong>Raison du refus :</strong> {demande.raison_refus}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {demande.status === 'accepted' ? (
                          <Button variant="outline" size="sm" disabled>
                            Acceptée
                          </Button>
                        ) : (
                          <Link href={`/candidate/demandes/${demande.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Limit Warning */}
        {!statistiques.peut_soumettre && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-900">
                    Limite de candidatures atteinte
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Vous avez atteint la limite de {statistiques.total_demandes + statistiques.demandes_restantes} candidatures. 
                    Attendez qu'une de vos candidatures soit traitée pour pouvoir postuler à de nouvelles offres.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
