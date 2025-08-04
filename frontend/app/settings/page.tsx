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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"
import { User } from "@/lib/api"
import {
  Shield,
  Bell,
  Mail,
} from "lucide-react"

interface SimpleSettings {
  emailNotifications: boolean
}

const defaultSettings: SimpleSettings = {
  emailNotifications: true,
}

export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const { user, isLoading, error } = useProfile()
  const [settings, setSettings] = useState<SimpleSettings>(defaultSettings)

  if (!authUser) return null

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Paramètres" }]}>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Paramètres" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-gray-600">Impossible de charger les paramètres.</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={[{ label: "Paramètres" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-600 mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Aucune donnée</h3>
              <p className="text-sm text-gray-600">Aucune information de profil disponible.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const userData = user as User
  const canEdit = userData.role === "admin"

  const handleSettingChange = (key: keyof SimpleSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const breadcrumbs = [{ label: "Paramètres" }]

  return (
    <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences de compte</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                Notifications
              </CardTitle>
              <CardDescription>
                {canEdit ? "Configurez vos préférences de notifications" : "Vos préférences de notifications"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications par email</Label>
                  <p className="text-sm text-gray-500">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              Informations du compte
            </CardTitle>
            <CardDescription>Vos informations de base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Nom complet</Label>
                <p className="text-base">{userData.prenom} {userData.nom}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-base">{userData.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Rôle</Label>
                <p className="text-base">
                  {userData.role === "admin" ? "Administrateur" : 
                   userData.role === "rh" ? "RH" : 
                   userData.role === "tuteur" ? "Tuteur" : "Stagiaire"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Membre depuis</Label>
                <p className="text-base">{new Date(userData.date_joined).getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
