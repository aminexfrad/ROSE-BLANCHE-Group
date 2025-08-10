/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"
import { User, apiClient } from "@/lib/api"
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  Users,
  Building,
  Loader2,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"

const getRoleInfo = (role: string) => {
  const roleData: Record<string, {
    title: string
    color: string
    icon: React.ComponentType<any>
    description: string
  }> = {
    stagiaire: {
      title: "Stagiaire",
      color: "from-blue-500 to-cyan-600",
      icon: GraduationCap,
      description: "Étudiant en stage",
    },
    tuteur: {
      title: "Tuteur",
      color: "from-green-500 to-emerald-600",
      icon: Users,
      description: "Tuteur de stage",
    },
    rh: {
      title: "Responsable RH",
      color: "from-orange-500 to-red-600",
      icon: Building,
      description: "Responsable des ressources humaines",
    },
    admin: {
      title: "Administrateur",
      color: "from-purple-500 to-pink-600",
      icon: Shield,
      description: "Administrateur système",
    },
  }
  return roleData[role] || roleData.stagiaire
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const { user, isLoading, error, refetch, updateProfile } = useProfile()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeData) => {
      return apiClient.changePassword({
        old_password: data.currentPassword,
        new_password: data.newPassword
      })
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangingPassword(false)
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
    },
    onError: (error: any) => {
      let errorMessage = "Impossible de modifier le mot de passe. Veuillez vérifier votre mot de passe actuel."
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error?.response?.data?.old_password) {
        errorMessage = error.response.data.old_password[0]
      } else if (error?.response?.data?.new_password) {
        errorMessage = error.response.data.new_password[0]
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => {
      // TODO: Implement profile picture upload API endpoint
      return Promise.resolve({ avatar_url: URL.createObjectURL(file) })
    },
    onSuccess: (data) => {
      updateProfile({ avatar: data.avatar_url })
      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      })
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de profil.",
        variant: "destructive",
      })
    },
  })

  // If no auth user, redirect to login or show message
  if (!authUser) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Mon Profil" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Non connecté</h3>
              <p className="text-sm text-gray-600">Veuillez vous connecter pour accéder à votre profil.</p>
            </div>
            <Button onClick={() => window.location.href = '/login'}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Mon Profil" }]}>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Mon Profil" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-gray-600">Impossible de charger les informations du profil.</p>
            </div>
            <Button onClick={() => refetch()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Ensure user data is available
  if (!user) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Mon Profil" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-600 mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Aucune donnée</h3>
              <p className="text-sm text-gray-600">Aucune information de profil disponible.</p>
            </div>
            <Button onClick={() => refetch()}>
              Actualiser
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const userData = user as User
  const roleInfo = getRoleInfo(userData.role)
  const RoleIcon = roleInfo.icon
  const canEdit = false // Disable editing for all users - only view mode

  // Profile editing functions removed - profile is read-only

  const handlePasswordChange = () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre mot de passe actuel.",
        variant: "destructive",
      })
      return
    }

    if (!passwordData.newPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nouveau mot de passe.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit être différent de l'actuel.",
        variant: "destructive",
      })
      return
    }

    changePasswordMutation.mutate(passwordData)
  }

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image valide.",
          variant: "destructive",
        })
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image doit faire moins de 5MB.",
          variant: "destructive",
        })
        return
      }
      uploadProfilePictureMutation.mutate(file)
    }
  }

  const breadcrumbs = [{ label: "Mon Profil" }]

  return (
    <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header avec photo de profil */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50/50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 ring-4 ring-gray-200 group-hover:ring-red-300 transition-all duration-300">
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={`${userData.prenom || ''} ${userData.nom || ''}`} />
                  <AvatarFallback className={`bg-gradient-to-br ${roleInfo.color} text-white text-3xl font-bold`}>
                    {userData.prenom?.[0]}
                    {userData.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-red-600 hover:bg-red-700 shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProfilePictureMutation.isPending}
                >
                  {uploadProfilePictureMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userData.prenom || ''} {userData.nom || ''}
                  </h1>
                  <Badge className={`bg-gradient-to-r ${roleInfo.color} text-white px-3 py-1`}>
                    <RoleIcon className="w-4 h-4 mr-1" />
                    {roleInfo.title}
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg mb-4">{roleInfo.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {userData.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre depuis {new Date(userData.date_joined).getFullYear()}
                  </div>
                </div>
              </div>

              {/* Edit buttons removed - profile is read-only for all users */}
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                  <UserIcon className="h-5 w-5 text-red-600" />
              </div>
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de profil (lecture seule)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={userData.prenom || ''}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={userData.nom || ''}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email || ''}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={userData.telephone || ''}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            {/* Informations spécifiques au rôle */}
            {userData.role === "stagiaire" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institut">Institut</Label>
                  <Input
                    id="institut"
                    value={userData.institut || ''}
                    disabled={true}
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="specialite">Spécialité</Label>
                  <Input
                    id="specialite"
                    value={userData.specialite || ''}
                    disabled={true}
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
            )}

            {(userData.role === "tuteur" || userData.role === "rh" || userData.role === "admin") && (
              <div>
                <Label htmlFor="departement">Département</Label>
                <Input
                  id="departement"
                  value={userData.departement || ''}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              Sécurité du compte
            </CardTitle>
            <CardDescription>Modifiez votre mot de passe (toujours disponible)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isChangingPassword ? (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
              >
                <Lock className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordData.newPassword.length < 8 ? 'bg-red-500 w-1/4' :
                              passwordData.newPassword.length < 12 ? 'bg-yellow-500 w-1/2' :
                              'bg-green-500 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordData.newPassword.length < 8 ? 'text-red-600' :
                          passwordData.newPassword.length < 12 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordData.newPassword.length < 8 ? 'Faible' :
                           passwordData.newPassword.length < 12 ? 'Moyen' : 'Fort'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Le mot de passe doit contenir au moins 8 caractères
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }}
                    variant="outline"
                    disabled={changePasswordMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Changer le mot de passe
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
