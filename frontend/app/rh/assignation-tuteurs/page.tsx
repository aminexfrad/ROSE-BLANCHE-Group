/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, User, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssignTuteurModal } from "@/components/assign-tuteur-modal"
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User as UserIcon,
  Eye,
  Edit,
} from "lucide-react"

interface StagiaireWithStage extends User {
  active_stage?: Stage
  progression: number
  statut: string
  dateDebut: string
  dateFin: string
}

export default function RHAssignationTuteursPage() {
  const { user } = useAuth()
  const [stagiaires, setStagiaires] = useState<StagiaireWithStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedStagiaire, setSelectedStagiaire] = useState<StagiaireWithStage | null>(null)

  const breadcrumbs = [
            { label: "Responsable RH", href: "/rh" }, 
    { label: "Assignation Tuteurs" }
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [stagiairesResponse, stagesResponse] = await Promise.all([
        apiClient.getRHStagiaires(),
        apiClient.getRHStages(),
      ])
      
      // Combine stagiaires with their active stages
      const stagiairesWithStages = (stagiairesResponse.results || []).map((stagiaire: User) => {
        const activeStage = (stagesResponse.results || []).find((stage: Stage) => 
          stage.stagiaire.id === stagiaire.id && stage.status === 'active'
        )
        
        return {
          ...stagiaire,
          active_stage: activeStage,
          progression: activeStage?.progress || 0,
          statut: activeStage ? 'en_cours' : 'termine',
          dateDebut: activeStage?.start_date || '',
          dateFin: activeStage?.end_date || ''
        }
      })
      
      setStagiaires(stagiairesWithStages)
    } catch (err: any) {
      console.error('Error fetching stagiaires:', err)
      setError(err.message || 'Failed to load stagiaires')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const handleAssignTuteur = (stagiaire: StagiaireWithStage) => {
    setSelectedStagiaire(stagiaire)
    setAssignModalOpen(true)
  }

  const handleAssignSuccess = () => {
    fetchData() // Rafraîchir les données après assignation
  }

  const stagiairesSansTuteur = stagiaires.filter(s => !s.active_stage?.tuteur)
  const stagiairesAvecTuteur = stagiaires.filter(s => s.active_stage?.tuteur)

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Assignation des tuteurs</h1>
            <p className="text-gray-600 mt-1">Gérez l'assignation des tuteurs aux stagiaires</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total stagiaires</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stagiaires.length}</div>
              <p className="text-xs text-gray-600">Tous les stagiaires</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sans tuteur</CardTitle>
              <UserPlus className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stagiairesSansTuteur.length}</div>
              <p className="text-xs text-red-600">Nécessitent un tuteur</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec tuteur</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stagiairesAvecTuteur.length}</div>
              <p className="text-xs text-green-600">Tuteurs assignés</p>
            </CardContent>
          </Card>
        </div>

        {/* Stagiaires sans tuteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-red-600" />
              Stagiaires sans tuteur ({stagiairesSansTuteur.length})
            </CardTitle>
            <CardDescription>
              Ces stagiaires nécessitent l'assignation d'un tuteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stagiairesSansTuteur.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Parfait !</h3>
                <p className="text-gray-600">Tous les stagiaires ont un tuteur assigné.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stagiaire</TableHead>
                    <TableHead>Institut</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagiairesSansTuteur.map((stagiaire) => (
                    <TableRow key={stagiaire.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {stagiaire.prenom || ''} {stagiaire.nom || ''}
                          </div>
                          <div className="text-sm text-gray-600">{stagiaire.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {stagiaire.institut || ''}
                        </div>
                      </TableCell>
                      <TableCell>{stagiaire.specialite || ''}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${stagiaire.progression}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {stagiaire.progression}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{stagiaire.dateDebut ? new Date(stagiaire.dateDebut).toLocaleDateString() : '-'}</div>
                          <div className="text-gray-500">au {stagiaire.dateFin ? new Date(stagiaire.dateFin).toLocaleDateString() : '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => handleAssignTuteur(stagiaire)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assigner tuteur
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stagiaires avec tuteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Stagiaires avec tuteur ({stagiairesAvecTuteur.length})
            </CardTitle>
            <CardDescription>
              Ces stagiaires ont déjà un tuteur assigné
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stagiairesAvecTuteur.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun stagiaire avec tuteur</h3>
                <p className="text-gray-600">Les stagiaires avec tuteur assigné apparaîtront ici.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stagiaire</TableHead>
                    <TableHead>Tuteur assigné</TableHead>
                    <TableHead>Institut</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagiairesAvecTuteur.map((stagiaire) => (
                    <TableRow key={stagiaire.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {stagiaire.prenom || ''} {stagiaire.nom || ''}
                          </div>
                          <div className="text-sm text-gray-600">{stagiaire.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-red-600" />
                          <div>
                            <div className="font-medium">
                              {stagiaire.active_stage?.tuteur?.prenom || ''} {stagiaire.active_stage?.tuteur?.nom || ''}
                            </div>
                            <div className="text-sm text-gray-600">
                              {stagiaire.active_stage?.tuteur?.email || ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {stagiaire.institut || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${stagiaire.progression}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {stagiaire.progression}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{stagiaire.dateDebut ? new Date(stagiaire.dateDebut).toLocaleDateString() : '-'}</div>
                          <div className="text-gray-500">au {stagiaire.dateFin ? new Date(stagiaire.dateFin).toLocaleDateString() : '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal d'assignation */}
        {selectedStagiaire && (
          <AssignTuteurModal
            isOpen={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            stagiaire={selectedStagiaire}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  )
} 