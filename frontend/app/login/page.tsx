"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, LogIn, ArrowLeft, Sparkles, Shield, UserCheck, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à StageBloom.",
      })
      setRedirecting(true)
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add effect to redirect after login
  useEffect(() => {
    if (redirecting && user) {
      if (user.role === "admin") router.replace("/admin")
      else if (user.role === "rh") router.replace("/rh")
      else if (user.role === "stagiaire") router.replace("/stagiaire")
      else if (user.role === "tuteur") router.replace("/tuteur")
      else router.replace("/")
    }
  }, [redirecting, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
                StageBloom
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Connexion à votre espace</h2>
            <p className="text-gray-600 text-lg">Accédez à votre dashboard personnalisé</p>
          </div>

          {/* Formulaire de connexion */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <CardHeader className="text-center bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-red-600" />
                Se connecter
              </CardTitle>
              <CardDescription className="text-gray-600">
                Utilisez vos identifiants fournis par votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-red-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Mot de passe
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="h-14 pr-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-red-600 transition-colors duration-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-14 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LogIn className="mr-3 h-6 w-6 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-3 h-6 w-6" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 StageBloom. Tous droits réservés.</p>
            <p className="mt-1">Plateforme de gestion des stages</p>
          </div>
        </div>
      </div>

      {/* Navigation button - same style as demande de stage page */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/public">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  )
}