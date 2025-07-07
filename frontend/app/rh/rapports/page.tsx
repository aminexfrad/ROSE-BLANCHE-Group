"use client"

import { useEffect, useState } from "react"
import { apiClient, Demande, Stage, Stagiaire } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Calendar, Users, TrendingUp, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function RHRapportsPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/rh" }, { label: "Rapports" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [demandesRes, stagesRes, stagiairesRes] = await Promise.all([
          apiClient.getDemandes(),
          apiClient.getStages(),
          apiClient.getRHStagiaires(),
        ])
        setDemandes(demandesRes.results || [])
        setStages(stagesRes.results || [])
        setStagiaires(stagiairesRes.results || [])
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des rapports")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Acceptée</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStageStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Compute real statistics
  const totalDemandes = demandes.length
  const demandesAcceptees = demandes.filter(d => d.status === "accepted").length
  const demandesEnAttente = demandes.filter(d => d.status === "pending").length
  const demandesRejetees = demandes.filter(d => d.status === "rejected").length
  const tauxAcceptation = totalDemandes > 0 ? ((demandesAcceptees / totalDemandes) * 100).toFixed(1) : "0"
  
  const stagesActifs = stages.filter(s => s.status === "active").length
  const stagesTermines = stages.filter(s => s.status === "completed").length
  const tauxReussite = stages.length > 0 ? ((stagesTermines / stages.length) * 100).toFixed(1) : "0"

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des rapports</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Rapports & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Générez et consultez les rapports détaillés</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total demandes",
              value: totalDemandes.toString(),
              icon: FileText,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Taux d'acceptation",
              value: tauxAcceptation + "%",
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Stages actifs",
              value: stagesActifs.toString(),
              icon: Users,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Taux de réussite",
              value: tauxReussite + "%",
              icon: TrendingUp,
              color: "from-yellow-500 to-yellow-600",
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

        {/* Actions rapides */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Download className="h-6 w-6 text-blue-600" />
              Génération de rapports
            </CardTitle>
            <CardDescription>
              Générez des rapports détaillés pour l'analyse
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Rapport demandes
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Rapport stagiaires
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Rapport performance
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Rapport mensuel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des demandes récentes */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-600" />
              Demandes récentes
            </CardTitle>
            <CardDescription>
              Dernières demandes de stage reçues
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {demandes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stagiaire</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demandes.slice(0, 10).map((demande) => (
                    <TableRow key={demande.id}>
                      <TableCell className="font-medium">
                        {demande.prenom} {demande.nom}
                      </TableCell>
                      <TableCell>{demande.poste}</TableCell>
                      <TableCell>
                        {format(new Date(demande.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(demande.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune demande disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des stages actifs */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-600" />
              Stages actifs
            </CardTitle>
            <CardDescription>
              Stages en cours et leur progression
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {stages.filter(s => s.status === "active").length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stagiaire</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stages.filter(s => s.status === "active").slice(0, 10).map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">
                        {stage.stagiaire_name || "N/A"}
                      </TableCell>
                      <TableCell>{stage.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${stage.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{stage.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStageStatusBadge(stage.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun stage actif</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques détaillées */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-900">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Statistiques détaillées
            </CardTitle>
            <CardDescription>
              Métriques complètes pour l'analyse RH
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Demandes
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">{totalDemandes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acceptées</span>
                    <span className="font-bold text-green-600">{demandesAcceptees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En attente</span>
                    <span className="font-bold text-yellow-600">{demandesEnAttente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejetées</span>
                    <span className="font-bold text-red-600">{demandesRejetees}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Stages
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">{stages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actifs</span>
                    <span className="font-bold text-blue-600">{stagesActifs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terminés</span>
                    <span className="font-bold text-green-600">{stagesTermines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annulés</span>
                    <span className="font-bold text-red-600">{stages.filter(s => s.status === "cancelled").length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Taux acceptation</span>
                    <span className="font-bold text-green-600">{tauxAcceptation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux réussite</span>
                    <span className="font-bold text-blue-600">{tauxReussite}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stagiaires actifs</span>
                    <span className="font-bold">{stages.filter(s => s.status === "active").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stagiaires terminés</span>
                    <span className="font-bold">{stages.filter(s => s.status === "completed").length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
