/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCandidateAuth } from "@/contexts/candidate-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, LogIn, ArrowLeft, Sparkles, Shield, UserCheck, Lock, UserPlus, Mail, Phone, GraduationCap, Building } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { loginSchema, sanitizeInput, RateLimiter } from "@/lib/security"
import Image from 'next/image'
import { apiClient } from "@/lib/api"

// Rate limiter instance
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginType, setLoginType] = useState<'user' | 'candidate'>('user')
  const { login, user } = useAuth()
  const { loginCandidat, candidat } = useCandidateAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)
  
  // Registration state
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [registerData, setRegisterData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    institut: "",
    specialite: "",
    niveau: ""
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check if we should show registration form
  useEffect(() => {
    const registerParam = searchParams.get('register')
    if (registerParam === 'true') {
      setIsRegisterMode(true)
      setLoginType('candidate')
    }
  }, [searchParams])

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

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!registerData.nom.trim()) newErrors.nom = "Le nom est requis"
    if (!registerData.prenom.trim()) newErrors.prenom = "Le prénom est requis"
    if (!registerData.email.trim()) newErrors.email = "L'email est requis"
    if (!registerData.password) newErrors.password = "Le mot de passe est requis"
    if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    if (registerData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    if (!registerData.institut.trim()) newErrors.institut = "L'institut est requis"
    if (!registerData.specialite.trim()) newErrors.specialite = "La spécialité est requise"
    if (!registerData.niveau.trim()) newErrors.niveau = "Le niveau est requis"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRegisterForm()) {
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('nom', registerData.nom)
      formData.append('prenom', registerData.prenom)
      formData.append('email', registerData.email)
      formData.append('password', registerData.password)
      formData.append('telephone', registerData.telephone)
      formData.append('institut', registerData.institut)
      formData.append('specialite', registerData.specialite)
      formData.append('niveau', registerData.niveau)

      const response = await apiClient.registerCandidat(formData)

      toast({
        title: "Compte créé avec succès",
        description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
      })

      // Switch back to login mode
      setIsRegisterMode(false)
      setEmail(registerData.email)
      setPassword("")
      setRegisterData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        confirmPassword: "",
        telephone: "",
        institut: "",
        specialite: "",
        niveau: ""
      })
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue lors de la création du compte.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
      
      if (loginType === 'candidate') {
        // Handle candidate login using the candidate auth context
        await loginCandidat(sanitizedEmail, sanitizedPassword)
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à StageBloom.",
        })
        
        // Redirect to candidate dashboard
        router.push('/candidate/dashboard')
      } else {
        // Handle regular user login
        await login(sanitizedEmail, sanitizedPassword)
        loginRateLimiter.reset(clientId) // Reset on successful login
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à StageBloom.",
        })
        setRedirecting(true)
      }
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
      else if (user.role === "candidat") router.replace("/candidate/dashboard")
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
      else if (user.role === "candidat") router.replace("/candidate/dashboard")
      else router.replace("/")
    }
  }, [user, router, redirecting])

  // Redirect candidate if already logged in
  useEffect(() => {
    if (candidat && !redirecting) {
      router.replace("/candidate/dashboard")
    }
  }, [candidat, router, redirecting])

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
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k="
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
              <div className="h-10 flex items-center justify-center">
                <img
                  src="/RoseBlancheLOGO.webp"
                  alt="Rose Blanche Logo"
                  className="h-8 w-auto object-contain rounded-lg"
                />
              </div>
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
                {isRegisterMode ? (
                  <>
                    <UserPlus className="h-6 w-6 text-white" />
                    Inscription Candidat
                  </>
                ) : (
                  <>
                    <Shield className="h-6 w-6 text-white" />
                    Authentification
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {isRegisterMode 
                  ? "Créez votre compte candidat pour accéder aux offres de stage"
                  : "Utilisez vos identifiants fournis par votre organisation"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* Login Type Toggle */}
              <div className="mb-6">
                <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setLoginType('user')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginType === 'user'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white hover:text-white/80'
                    }`}
                  >
                    Utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('candidate')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginType === 'candidate'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white hover:text-white/80'
                    }`}
                  >
                    Candidat
                  </button>
                </div>
                <p className="text-xs text-white/80 mt-2 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {loginType === 'user' 
                    ? 'Connectez-vous avec vos identifiants organisationnels'
                    : 'Connectez-vous à votre compte candidat'
                  }
                </p>
              </div>

              {isRegisterMode ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <Label htmlFor="nom" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <UserPlus className="h-4 w-4 text-white" />
                      Nom
                    </Label>
                    <Input
                      id="nom"
                      type="text"
                      value={registerData.nom}
                      onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                      placeholder="Votre nom"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.nom ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.nom && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.nom}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="prenom" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <UserPlus className="h-4 w-4 text-white" />
                      Prénom
                    </Label>
                    <Input
                      id="prenom"
                      type="text"
                      value={registerData.prenom}
                      onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                      placeholder="Votre prénom"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.prenom ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.prenom && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.prenom}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Mail className="h-4 w-4 text-white" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="votre.email@exemple.com"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Lock className="h-4 w-4 text-white" />
                      Mot de passe
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Votre mot de passe"
                        className={`h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 pr-12 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-5 w-5 text-white hover:text-gray-100" />
                        ) : (
                          <Eye className="h-5 w-5 text-white hover:text-gray-100" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Lock className="h-4 w-4 text-white" />
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        placeholder="Confirmez votre mot de passe"
                        className={`h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 pr-12 ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-white hover:text-gray-100" />
                        ) : (
                          <Eye className="h-5 w-5 text-white hover:text-gray-100" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="telephone" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Phone className="h-4 w-4 text-white" />
                      Téléphone (optionnel)
                    </Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={registerData.telephone}
                      onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                      placeholder="Votre numéro de téléphone"
                      className="mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institut" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Building className="h-4 w-4 text-white" />
                      Institut
                    </Label>
                    <Input
                      id="institut"
                      type="text"
                      value={registerData.institut}
                      onChange={(e) => setRegisterData({ ...registerData, institut: e.target.value })}
                      placeholder="Votre institution"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.institut ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.institut && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.institut}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="specialite" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <GraduationCap className="h-4 w-4 text-white" />
                      Spécialité
                    </Label>
                    <Input
                      id="specialite"
                      type="text"
                      value={registerData.specialite}
                      onChange={(e) => setRegisterData({ ...registerData, specialite: e.target.value })}
                      placeholder="Votre spécialité"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.specialite ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.specialite && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.specialite}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="niveau" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Sparkles className="h-4 w-4 text-white" />
                      Niveau
                    </Label>
                    <Input
                      id="niveau"
                      type="text"
                      value={registerData.niveau}
                      onChange={(e) => setRegisterData({ ...registerData, niveau: e.target.value })}
                      placeholder="Votre niveau"
                      className={`mt-2 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg transition-all duration-300 ${
                        errors.niveau ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.niveau && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.niveau}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Inscription en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Créer un compte
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <UserCheck className="h-4 w-4 text-white" />
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
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      <Shield className="h-4 w-4 text-white" />
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
                          <EyeOff className="h-5 w-5 text-white hover:text-gray-100" />
                        ) : (
                          <Eye className="h-5 w-5 text-white hover:text-gray-100" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{errors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Connexion en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LogIn className="h-5 w-5 mr-2" />
                        Se connecter
                      </div>
                    )}
                  </Button>
                </form>
              )}
              
              {/* Candidate Registration Link */}
              {loginType === 'candidate' && !isRegisterMode && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    Pas encore de compte candidat ?{' '}
                    <button 
                      onClick={() => setIsRegisterMode(true)}
                      className="text-white hover:text-white/80 font-medium hover:underline drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    >
                      Créer un compte
                    </button>
                  </p>
                </div>
              )}
              
              {/* Back to Login Link */}
              {isRegisterMode && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    Déjà un compte ?{' '}
                    <button 
                      onClick={() => setIsRegisterMode(false)}
                      className="text-white hover:text-white/80 font-medium hover:underline drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back to home */}
        </div>
      </div>
    </div>
  )
}