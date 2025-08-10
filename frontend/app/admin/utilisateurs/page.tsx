/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, User } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Plus, Edit, Trash2, Eye, Loader2, AlertCircle, Shield, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { UserManagementModal } from "@/components/user-management-modal"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminUtilisateursPage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Utilisateurs" }]
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUsers()
      setUsers(response.results || [])
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return

    try {
      await apiClient.deleteUser(deletingUser.id)
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setDeletingUser(null)
    }
  }

  const handleUserCreated = (user: User) => {
    fetchUsers()
  }

  const handleUserUpdated = (user: User) => {
    fetchUsers()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Administrateur</Badge>
      case "rh":
        return <Badge className="bg-red-100 text-red-800">Responsable RH</Badge>
      case "tuteur":
        return <Badge className="bg-green-100 text-green-800">Tuteur</Badge>
      case "stagiaire":
        return <Badge className="bg-purple-100 text-purple-800">Stagiaire</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactif</Badge>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />
      case "rh":
        return <Users className="h-4 w-4 text-red-600" />
      case "tuteur":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "stagiaire":
        return <UserX className="h-4 w-4 text-purple-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.date_joined) ||
                         (statusFilter === "inactive" && !user.date_joined)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Compute statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.date_joined).length
  const adminUsers = users.filter(u => u.role === "admin").length
  const rhUsers = users.filter(u => u.role === "rh").length
  const tuteurUsers = users.filter(u => u.role === "tuteur").length
  const stagiaireUsers = users.filter(u => u.role === "stagiaire").length

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des utilisateurs</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
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
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Administrez les comptes utilisateurs de la plateforme</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: "Total utilisateurs",
              value: totalUsers.toString(),
              icon: Users,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Utilisateurs actifs",
              value: activeUsers.toString(),
              icon: UserCheck,
              color: "from-green-500 to-green-600",
            },
            {
              title: "Administrateurs",
              value: adminUsers.toString(),
              icon: Shield,
              color: "from-red-500 to-red-600",
            },
            {
                      title: "Responsable RH",
        value: rhUsers.toString(),
              icon: Users,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Tuteurs",
              value: tuteurUsers.toString(),
              icon: UserCheck,
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

        {/* Filtres et actions */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Search className="h-6 w-6 text-blue-600" />
              Recherche et filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="rh">Responsable RH</SelectItem>
                  <SelectItem value="tuteur">Tuteur</SelectItem>
                  <SelectItem value="stagiaire">Stagiaire</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateUser} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              Liste des utilisateurs
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.nom?.[0]}{user.prenom?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getRoleIcon(user.role)} {user.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.date_joined ? true : false)}</TableCell>
                      <TableCell>
                        {user.date_joined ? format(new Date(user.date_joined), 'dd/MM/yyyy', { locale: fr }) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                <p className="text-gray-600">Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition par rôle */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-600" />
              Répartition par rôle
            </CardTitle>
            <CardDescription>
              Distribution des utilisateurs par type de compte
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
                <div className="text-sm text-gray-600">Administrateurs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{rhUsers}</div>
                <div className="text-sm text-gray-600">Responsable RH</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{tuteurUsers}</div>
                <div className="text-sm text-gray-600">Tuteurs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <UserX className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{stagiaireUsers}</div>
                <div className="text-sm text-gray-600">Stagiaires</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={editingUser}
        onUserCreated={handleUserCreated}
        onUserUpdated={handleUserUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{deletingUser?.prenom} {deletingUser?.nom}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
