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
import Image from 'next/image'

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
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific error messages
      let errorMessage = "Email ou mot de passe incorrect."
      
      if (error.message?.includes('validation')) {
        errorMessage = error.message
      } else if (error.message?.includes('désactivé')) {
        errorMessage = "Ce compte a été désactivé. Veuillez contacter votre administrateur."
      } else if (error.message?.includes('réseau')) {
        errorMessage = "Erreur de connexion réseau. Veuillez vérifier votre connexion internet."
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Délai d'attente dépassé. Veuillez réessayer."
      } else if (error.message?.includes('serveur')) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard."
      }
      
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/two-graduates-classmates-shake-hands-smiling-holding-diplomas.jpg"
          alt="Graduates background"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-110 blur-sm brightness-75 animate-bgZoom"
          style={{ transition: 'transform 10s linear', willChange: 'transform' }}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back to home - now at the top */}
          <div className="mb-2">
            <Link href="/public">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 text-gray-700 border-gray-300 shadow-none px-3 py-1">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/RoseBlancheLOGO.png"
                alt="Rose Blanche Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain rounded-lg"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Connexion à <span className="text-red-400">StageBloom</span>
            </h2>
            <p className="text-gray-100 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40 rounded-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <Shield className="h-6 w-6 text-red-400" />
                Authentification
              </CardTitle>
              <CardDescription className="text-gray-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                Utilisez vos identifiants fournis par votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <UserCheck className="h-4 w-4 text-red-400" />
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
                    <p className="mt-1 text-sm text-red-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <Shield className="h-4 w-4 text-red-400" />
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
                        <EyeOff className="h-5 w-5 text-gray-200 hover:text-gray-100" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-200 hover:text-gray-100" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.password}</p>
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
            </CardContent>
          </Card>

          {/* Back to home */}
        </div>
      </div>
    </div>
  )
}