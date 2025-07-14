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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, Shield, Database, Bell, Globe, Loader2, AlertCircle, Save, RefreshCw } from "lucide-react"

interface SystemConfig {
  siteName: string
  siteDescription: string
  maxFileSize: number
  allowedFileTypes: string[]
  emailNotifications: boolean
  maintenanceMode: boolean
  debugMode: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  backupFrequency: string
  databaseUrl: string
  redisUrl: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
}

export default function AdminConfigurationPage() {
  const breadcrumbs = [{ label: "Administration", href: "/admin" }, { label: "Configuration" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "StageBloom",
    siteDescription: "Plateforme de gestion des stages",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    emailNotifications: true,
    maintenanceMode: false,
    debugMode: false,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    backupFrequency: "daily",
    databaseUrl: "postgresql://localhost/stagebloom",
    redisUrl: "redis://localhost:6379",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "admin@stagebloom.com",
    smtpPassword: "********"
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUsers()
        setUsers(response.results || [])
        // In a real app, you would fetch configuration from API
        // const configResponse = await apiClient.getSystemConfig()
        // setConfig(configResponse)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la configuration")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      // In a real app, you would save configuration to API
      // await apiClient.updateSystemConfig(config)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log("Configuration sauvegardée:", config)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleResetConfig = () => {
    setConfig({
      siteName: "StageBloom",
      siteDescription: "Plateforme de gestion des stages",
      maxFileSize: 10,
      allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
      emailNotifications: true,
      maintenanceMode: false,
      debugMode: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      backupFrequency: "daily",
      databaseUrl: "postgresql://localhost/stagebloom",
      redisUrl: "redis://localhost:6379",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "admin@stagebloom.com",
      smtpPassword: "********"
    })
  }

  // Compute statistics
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.role === "admin").length
  const activeUsers = users.filter(u => u.date_joined).length

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement de la configuration</h2>
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
            Configuration Système
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Gérez les paramètres de la plateforme</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Total utilisateurs",
              value: totalUsers.toString(),
              icon: Users,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Administrateurs",
              value: adminUsers.toString(),
              icon: Shield,
              color: "from-red-500 to-red-600",
            },
            {
              title: "Utilisateurs actifs",
              value: activeUsers.toString(),
              icon: Users,
              color: "from-green-500 to-green-600",
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

        {/* Configuration tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de données
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Fichiers
            </TabsTrigger>
          </TabsList>

          {/* Configuration générale */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Configuration générale
                </CardTitle>
                <CardDescription>
                  Paramètres de base de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du site
                    </label>
                    <Input
                      value={config.siteName}
                      onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="Nom de la plateforme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Input
                      value={config.siteDescription}
                      onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                      placeholder="Description du site"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de session (secondes)
                    </label>
                    <Input
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      placeholder="3600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence de sauvegarde
                    </label>
                    <Select value={config.backupFrequency} onValueChange={(value) => setConfig(prev => ({ ...prev, backupFrequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mode maintenance</label>
                      <p className="text-sm text-gray-500">Désactiver l'accès public au site</p>
                    </div>
                    <Switch
                      checked={config.maintenanceMode}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mode debug</label>
                      <p className="text-sm text-gray-500">Afficher les informations de débogage</p>
                    </div>
                    <Switch
                      checked={config.debugMode}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, debugMode: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notifications email</label>
                      <p className="text-sm text-gray-500">Activer les notifications par email</p>
                    </div>
                    <Switch
                      checked={config.emailNotifications}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-400">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  Configuration sécurité
                </CardTitle>
                <CardDescription>
                  Paramètres de sécurité et d'authentification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentatives de connexion max
                    </label>
                    <Input
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée de blocage (minutes)
                    </label>
                    <Input
                      type="number"
                      value="30"
                      placeholder="30"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Politique de mots de passe</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Minimum 8 caractères</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Au moins une majuscule</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Au moins un chiffre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Au moins un caractère spécial</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration email */}
          <TabsContent value="email" className="space-y-6">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Bell className="h-6 w-6 text-green-600" />
                  Configuration email
                </CardTitle>
                <CardDescription>
                  Paramètres du serveur SMTP
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serveur SMTP
                    </label>
                    <Input
                      value={config.smtpHost}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port SMTP
                    </label>
                    <Input
                      type="number"
                      value={config.smtpPort}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Utilisateur SMTP
                    </label>
                    <Input
                      value={config.smtpUser}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe SMTP
                    </label>
                    <Input
                      type="password"
                      value={config.smtpPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="Mot de passe"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tester la connexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration base de données */}
          <TabsContent value="database" className="space-y-6">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-600">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Database className="h-6 w-6 text-purple-600" />
                  Configuration base de données
                </CardTitle>
                <CardDescription>
                  Paramètres de connexion à la base de données
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la base de données
                  </label>
                  <Input
                    value={config.databaseUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, databaseUrl: e.target.value }))}
                    placeholder="postgresql://localhost/stagebloom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Redis
                  </label>
                  <Input
                    value={config.redisUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, redisUrl: e.target.value }))}
                    placeholder="redis://localhost:6379"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tester la connexion DB
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tester Redis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration fichiers */}
          <TabsContent value="files" className="space-y-6">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-700">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Settings className="h-6 w-6 text-yellow-600" />
                  Configuration fichiers
                </CardTitle>
                <CardDescription>
                  Paramètres de gestion des fichiers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille maximale des fichiers (MB)
                  </label>
                  <Input
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Types de fichiers autorisés
                  </label>
                  <Input
                    value={config.allowedFileTypes.join(", ")}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      allowedFileTypes: e.target.value.split(", ").map(t => t.trim()) 
                    }))}
                    placeholder="pdf, doc, docx, jpg, jpeg, png"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Séparez les extensions par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card className="shadow-xl border-0 animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3">
              <Save className="h-6 w-6 text-indigo-600" />
              Actions
            </CardTitle>
            <CardDescription>
              Sauvegarder ou réinitialiser la configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Button onClick={handleSaveConfig} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
              </Button>
              <Button variant="outline" onClick={handleResetConfig}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
