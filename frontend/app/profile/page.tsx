/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Edit,
  Save,
  Camera,
  Shield,
  GraduationCap,
  Users,
  Building,
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

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    departement: user?.departement || "",
    institut: user?.institut || "",
    specialite: user?.specialite || "",
    bio: user?.bio || "",
  })

  if (!user) return null

  const roleInfo = getRoleInfo(user.role)
  const RoleIcon = roleInfo.icon

  const handleSave = () => {
    // TODO: Appel API pour sauvegarder les modifications
    console.log("Sauvegarde du profil:", formData)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const breadcrumbs = [{ label: "Mon Profil" }]

  return (
    <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6 animate-in fade-in duration-1000">
        {/* Header avec photo de profil */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50/50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 ring-4 ring-gray-200 group-hover:ring-red-300 transition-all duration-300">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.prenom || ''} ${user.nom || ''}`} />
                  <AvatarFallback className={`bg-gradient-to-br ${roleInfo.color} text-white text-3xl font-bold`}>
                    {user.prenom?.[0]}
                    {user.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-red-600 hover:bg-red-700 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.prenom || ''} {user.nom || ''}
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
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre depuis 2024
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Dernière connexion: Aujourd'hui
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "" : "bg-red-600 hover:bg-red-700"}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
                {isEditing && (
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Informations personnelles
                </CardTitle>
                <CardDescription>Gérez vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange("prenom", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange("nom", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange("telephone", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Informations spécifiques au rôle */}
                {user.role === "stagiaire" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institut">Institut</Label>
                      <Input
                        id="institut"
                        value={formData.institut}
                        onChange={(e) => handleInputChange("institut", e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialite">Spécialité</Label>
                      <Input
                        id="specialite"
                        value={formData.specialite}
                        onChange={(e) => handleInputChange("specialite", e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {(user.role === "tuteur" || user.role === "rh" || user.role === "admin") && (
                  <div>
                    <Label htmlFor="departement">Département</Label>
                    <Input
                      id="departement"
                      value={formData.departement}
                      onChange={(e) => handleInputChange("departement", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Parlez-nous un peu de vous..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du profil */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  Activité récente
                </CardTitle>
                <CardDescription>Votre activité sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <p className="text-sm text-blue-600">Jours actifs</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-green-600">Progression</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">24</div>
                    <p className="text-sm text-purple-600">Documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut du compte */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Statut du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vérification email</span>
                  <Badge className="bg-green-100 text-green-800">Vérifié</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">2FA</span>
                  <Badge variant="outline">Non activé</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Préférences email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Paramètres de confidentialité
                </Button>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">support@stagebloom.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Lun-Ven 9h-18h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
