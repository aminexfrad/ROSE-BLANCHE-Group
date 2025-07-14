/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

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
import { loginSchema, sanitizeInput, RateLimiter } from "@/lib/security"

// Rate limiter instance
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password })
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        newErrors[err.path[0]] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    // Check rate limiting
    const clientId = email // Use email as identifier
    if (!loginRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Trop de tentatives",
        description: "Veuillez attendre 15 minutes avant de réessayer.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email)
      const sanitizedPassword = sanitizeInput(password)
      
      await login(sanitizedEmail, sanitizedPassword)
      loginRateLimiter.reset(clientId) // Reset on successful login
      
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
      else if (user.role === "tuteur") router.replace("/tuteur")
      else if (user.role === "stagiaire") router.replace("/stagiaire")
      else router.replace("/")
    }
  }, [redirecting, user, router])

  // Redirect if already logged in
  useEffect(() => {
    if (user && !redirecting) {
      if (user.role === "admin") router.replace("/admin")
      else if (user.role === "rh") router.replace("/rh")
      else if (user.role === "tuteur") router.replace("/tuteur")
      else if (user.role === "stagiaire") router.replace("/stagiaire")
      else router.replace("/")
    }
  }, [user, router, redirecting])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-white p-4 rounded-full shadow-xl">
                  <Sparkles className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion à <span className="text-red-600">StageBloom</span>
            </h2>
            <p className="text-gray-600">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Authentification
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className={`h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 pr-12 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connexion en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Se connecter
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Problème de connexion ?{" "}
                  <Link href="/public/contact" className="text-red-600 hover:text-red-700 font-medium">
                    Contactez-nous
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to home */}
          <div className="text-center">
            <Link href="/public">
              <Button variant="outline" size="sm" className="flex items-center gap-2 mx-auto bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}