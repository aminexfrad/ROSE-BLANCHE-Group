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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Mail,
  Smartphone,
  Moon,
  Globe,
  Clock,
  Shield,
  User,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
} from "lucide-react"

interface Settings {
  parcourNotifications: boolean
  kpiReminders: boolean
  notifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  darkMode: boolean
  language: string
  timezone: string
}

const baseSettings: Settings = {
  parcourNotifications: true,
  kpiReminders: true,
  notifications: true,
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false,
  language: "fr",
  timezone: "Europe/Paris",
}

const roleSpecificSettings: Record<string, Settings> = {
  stagiaire: {
    ...baseSettings,
    parcourNotifications: true,
    kpiReminders: true,
  },
  tuteur: {
    ...baseSettings,
    parcourNotifications: false,
    kpiReminders: false,
  },
  rh: {
    ...baseSettings,
    parcourNotifications: false,
    kpiReminders: false,
  },
  admin: {
    ...baseSettings,
    parcourNotifications: false,
    kpiReminders: false,
  },
}

const getRoleSpecificSettings = (role: string): Settings => {
  return roleSpecificSettings[role] || baseSettings
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(() => 
    user ? getRoleSpecificSettings(user.role) : baseSettings
  )
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSettingChange = (key: keyof Settings, value: boolean | string) => {
    setSettings((prev: Settings) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Appel API pour sauvegarder les paramètres
      console.log("Sauvegarde des paramètres:", settings)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simuler un appel API
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(getRoleSpecificSettings(user.role))
  }

  const breadcrumbs = [{ label: "Paramètres" }]

  return (
    <DashboardLayout allowedRoles={["stagiaire", "tuteur", "rh", "admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Gérez vos préférences et notifications</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paramètres principaux */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  Notifications
                </CardTitle>
                <CardDescription>Configurez vos préférences de notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.role === "stagiaire" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notifications de parcours</Label>
                        <p className="text-sm text-gray-500">
                          Recevoir des notifications sur les étapes de votre stage
                        </p>
                      </div>
                      <Switch
                        checked={settings.parcourNotifications}
                        onCheckedChange={(checked) => handleSettingChange("parcourNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Rappels KPI</Label>
                        <p className="text-sm text-gray-500">
                          Rappels pour compléter vos évaluations KPI
                        </p>
                      </div>
                      <Switch
                        checked={settings.kpiReminders}
                        onCheckedChange={(checked) => handleSettingChange("kpiReminders", checked)}
                      />
                    </div>

                  </>
                )}

                {(user.role === "tuteur" || user.role === "rh" || user.role === "admin") && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications générales</Label>
                      <p className="text-sm text-gray-500">
                        Notifications système et mises à jour importantes
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                    />
                  </div>
                )}

                <Separator />

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
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications SMS</Label>
                    <p className="text-sm text-gray-500">
                      Recevoir des notifications par SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Apparence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Moon className="h-5 w-5 text-purple-600" />
                  </div>
                  Apparence
                </CardTitle>
                <CardDescription>Personnalisez l'apparence de l'interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mode sombre</Label>
                    <p className="text-sm text-gray-500">
                      Activer le thème sombre
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Régional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  Régional
                </CardTitle>
                <CardDescription>Paramètres de langue et de fuseau horaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                      <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Résumé des paramètres */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notifications actives</span>
                  <Badge variant="outline">
                    {Object.values(settings).filter(Boolean).length}/9
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mode sombre</span>
                  <Badge variant={settings.darkMode ? "default" : "outline"}>
                    {settings.darkMode ? "Activé" : "Désactivé"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Langue</span>
                  <Badge variant="outline">
                    {settings.language === "fr" ? "Français" : settings.language === "en" ? "English" : "العربية"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Sécurité du compte
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Confidentialité
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Paramètres avancés
                </Button>
              </CardContent>
            </Card>

            {/* Aide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Consultez notre documentation ou contactez le support pour toute question.
                </p>
                <Button variant="outline" className="w-full">
                  Documentation
                </Button>
                <Button variant="outline" className="w-full">
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
