/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"
import { 
  ArrowRight, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Building, 
  GraduationCap,
  Clock,
  Target,
  Heart,
  Zap,
  Globe,
  Shield,
  Lightbulb,
  BookOpen,
  ChevronDown,
  Quote,
  Sparkles,
  ArrowUpRight,
  Play,
  Pause,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  MessageSquare
} from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Testimonial } from "@/lib/api"
import { useHydrationSuppression } from "@/hooks/use-hydration-suppression"

export default function PublicHomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  
  const sectionRefs = [heroRef, statsRef, aboutRef, processRef, testimonialsRef]

  // Intersection Observer for scroll-triggered animations
  const [sectionVisibility, setSectionVisibility] = useState({
    hero: false,
    stats: false,
    about: false,
    process: false,
    testimonials: false
  })

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)

  // Suppress hydration warnings caused by browser extensions
  useHydrationSuppression()

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Determine active section based on scroll position
      const windowHeight = window.innerHeight
      const scrollPosition = window.scrollY + windowHeight / 2
      
      sectionRefs.forEach((ref, index) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(index)
          }
        }
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoadingTestimonials(true)
        const response = await apiClient.getPublicTestimonials()
        setTestimonials(response.results || [])
      } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error)
      } finally {
        setLoadingTestimonials(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Intersection Observer setup
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionName = entry.target.getAttribute('data-section')
        if (sectionName && entry.isIntersecting) {
          setSectionVisibility(prev => ({
            ...prev,
            [sectionName]: true
          }))
        }
      })
    }, observerOptions)

    // Observe all sections
    Object.keys(sectionVisibility).forEach(sectionName => {
      const element = document.querySelector(`[data-section="${sectionName}"]`)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Refined animation utilities
  const fadeInUp = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.6s ease-out ${delay}s`
  })

  const fadeInLeft = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
    transition: `all 0.6s ease-out ${delay}s`
  })

  const fadeInRight = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
    transition: `all 0.6s ease-out ${delay}s`
  })

  const scaleIn = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.95)',
    transition: `all 0.5s ease-out ${delay}s`
  })

  const staggerDelay = (index: number, baseDelay: number = 0.1) => ({
    transitionDelay: `${baseDelay + index * 0.1}s`
  })

  // Parallax effect for background elements
  const parallaxStyle = (speed: number) => ({
    transform: `translateY(${scrollY * speed}px)`
  })

  // Mouse parallax effect
  const mouseParallaxStyle = (speed: number = 0.01) => ({
    transform: `translate(${mousePosition.x * speed}px, ${mousePosition.y * speed}px)`
  })

  // Refined story progression indicator
  const StoryProgress = () => (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col items-center space-y-3">
        {[
          { key: 'hero', label: 'Accueil' },
          { key: 'stats', label: 'Chiffres' },
          { key: 'about', label: 'À propos' },
          { key: 'process', label: 'Processus' },
          { key: 'testimonials', label: 'Témoignages' }
        ].map((section, index) => (
          <button
            key={section.key}
            onClick={() => {
              const element = document.querySelector(`[data-section="${section.key}"]`)
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={`group relative transition-all duration-300 ${
              activeSection === index 
                ? 'scale-110' 
                : 'hover:scale-105'
            }`}
            title={`Section ${index + 1}`}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === index 
                ? 'bg-red-500 shadow-sm shadow-red-200' 
                : 'bg-gray-300 hover:bg-red-400'
            }`} />
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
              activeSection === index ? 'opacity-100' : ''
            }`}>
              {section.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // Refined floating quote component
  const FloatingQuote = ({ text, author, delay = 0 }: { text: string; author: string; delay?: number }) => (
    <div 
      className="absolute opacity-10 text-center max-w-xs"
      style={{
        ...fadeInUp(sectionVisibility.about, delay),
        left: '5%',
        top: '20%',
        transform: `rotate(-3deg) translateY(${scrollY * 0.01}px)`
      }}
    >
      <Quote className="h-6 w-6 text-red-400 mx-auto mb-1" />
      <p className="text-xs italic text-gray-600">"{text}"</p>
      <p className="text-xs text-red-500 font-medium mt-1">— {author}</p>
    </div>
  )

  // Refined floating elements
  const FloatingElement = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <div 
      className={`absolute ${className}`}
      style={{
        ...fadeInUp(sectionVisibility.hero, delay),
        transform: `translateY(${scrollY * 0.005}px)`
      }}
    >
      {children}
    </div>
  )

  // Section Témoignages
  const testimonialsSection = (
    <section 
      ref={(el) => {
        if (el) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setSectionVisibility(prev => ({ ...prev, testimonials: true }))
              }
            },
            { threshold: 0.1 }
          )
          observer.observe(el)
        }
      }}
      className="py-8 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8" style={fadeInUp(sectionVisibility.testimonials, 0)}>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Témoignages de nos stagiaires
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les expériences authentiques de nos stagiaires qui ont transformé leur parcours professionnel
          </p>
        </div>

        {loadingTestimonials ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Chargement des témoignages...</p>
            </div>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden transform hover:-translate-y-1 relative group"
                style={{ ...fadeInUp(sectionVisibility.testimonials, 0.1 + index * 0.1) }}
              >
                {/* Refined hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-1 mb-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic leading-relaxed text-sm">"{testimonial.content.substring(0, 150)}..."</p>
                  <div className="text-center border-t pt-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {testimonial.author.prenom.charAt(0)}{testimonial.author.nom.charAt(0)}
                    </div>
                    <div className="font-bold text-gray-900 mb-1 text-base">
                      {testimonial.author.prenom} {testimonial.author.nom}
                    </div>
                    <div className="text-red-600 text-xs mb-2">{testimonial.author.specialite}</div>
                    <div className="text-gray-500 text-xs bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-full inline-block border border-gray-200 shadow-sm">
                      <Lightbulb className="inline h-3 w-3 mr-1" />
                      {testimonial.stage.title}
                    </div>
                  </div>
                  
                  {/* Refined story tooltip */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                    {testimonial.testimonial_type === 'video' ? 'Vidéo' : 'Texte'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun témoignage disponible</h3>
            <p className="text-gray-600">Les témoignages de nos stagiaires apparaîtront ici.</p>
          </div>
        )}

        {testimonials.length > 6 && (
          <div className="text-center mt-12" style={fadeInUp(sectionVisibility.testimonials, 0.8)}>
            <Link href="/public/temoignages">
              <Button 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Voir tous les témoignages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden cursor-default">
      {/* Refined Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[calc(100vh-4rem)] z-0 pointer-events-none">
        <img
          src="/two-graduates-classmates-shake-hands-smiling-holding-diplomas.jpg"
          alt="Two Graduates Classmates Shake Hands Smiling Holding Diplomas"
          className="w-full h-full object-cover"
        />
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      </div>

      {/* Subtle floating decorative elements */}
      <FloatingElement className="top-16 left-8 opacity-5" delay={0.5}>
        <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-lg animate-pulse"></div>
      </FloatingElement>
      <FloatingElement className="top-32 right-16 opacity-5" delay={0.8}>
        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-md animate-pulse delay-1000"></div>
      </FloatingElement>

      <Navbar isPublic />

      {/* Story Progress Indicator */}
      <StoryProgress />

      {/* Hero Section - Refined Design */}
      <section 
        ref={heroRef} 
        data-section="hero"
        className="bg-transparent py-8 sm:py-12 lg:py-16 relative min-h-screen flex items-center z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="text-center">
            {/* Refined Story Introduction */}
            <div 
              className="mb-6"
              style={fadeInUp(sectionVisibility.hero, 0)}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-4 py-2 rounded-full text-xs font-medium mb-6 border border-red-200 shadow-sm">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Découvrez notre histoire
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight cursor-pointer hover:text-red-100 transition-all duration-300 transform hover:scale-105 drop-shadow-2xl">
                Une <span className="text-red-300 bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Plateforme
                </span> qui Révolutionne
                <span className="block text-red-300 bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                  l'Expérience des Stages
                </span>
                <span className="block text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white mt-2 drop-shadow-2xl">
                  Chez Rose Blanche Group
                </span>
              </h1>
            </div>

            {/* Refined Story Hook */}
            <div 
              className="mb-8"
              style={fadeInUp(sectionVisibility.hero, 0.2)}
            >
              <p className="text-sm sm:text-base md:text-lg text-white max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-2xl font-medium">
                Imaginez un monde où chaque stagiaire trouve sa place, où chaque projet devient une aventure, 
                et où chaque apprentissage se transforme en réussite. C'est l'histoire que nous écrivons ensemble.
              </p>
            </div>

            {/* Refined Call to Adventure */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4"
              style={fadeInUp(sectionVisibility.hero, 0.4)}
            >
              <Link href="/public/demande-stage" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer rounded-xl transform hover:-translate-y-1 w-full sm:w-auto relative overflow-hidden border-2 border-red-500"
                >
                  <span className="relative z-10">Commencer votre aventure</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              
              <Link href="/public/pfe-book" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer rounded-xl transform hover:-translate-y-1 w-full sm:w-auto bg-white/10"
                >
                  Explorer nos projets
                  <Globe className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* Refined Statistics Section */}
      <section 
        ref={statsRef}
        data-section="stats" 
        className="py-8 bg-gradient-to-br from-white to-red-50 relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Refined Section Introduction */}
          <div 
            className="text-center mb-8"
            style={fadeInUp(sectionVisibility.stats, 0)}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Notre Impact en <span className="text-red-600">Chiffres</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Chaque nombre raconte une histoire de réussite, d'apprentissage et de croissance
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Refined Animated Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4">
            {[
              { 
                number: "50+", 
                label: "Stagiaires par an", 
                description: "Étudiants accueillis",
                icon: Users,
                color: "from-blue-500 to-blue-600",
                story: "Chaque année, nous accueillons plus de 50 stagiaires passionnés"
              },
              { 
                number: "25+", 
                label: "Années d'expérience", 
                description: "En formation",
                icon: Award,
                color: "from-green-500 to-green-600",
                story: "Plus de 25 ans d'expertise dans la formation professionnelle"
              },
              { 
                number: "15+", 
                label: "Projets majeurs", 
                description: "Participation active",
                icon: TrendingUp,
                color: "from-purple-500 to-purple-600",
                story: "15 projets d'envergure nationale réalisés avec nos stagiaires"
              },
              { 
                number: "100%", 
                label: "Taux d'encadrement", 
                description: "Suivi personnalisé",
                icon: CheckCircle,
                color: "from-orange-500 to-orange-600",
                story: "Un accompagnement personnalisé pour chaque stagiaire"
              },
            ].map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className="text-center hover:scale-105 transition-all duration-500 cursor-pointer group relative"
                  style={{ ...fadeInUp(sectionVisibility.stats, 0.1 + index * 0.1) }}
                >
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-1 relative overflow-hidden">
                    {/* Refined hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 relative z-10">
                      {stat.number}
                    </div>
                    <p className="text-gray-900 font-semibold mb-1 text-sm sm:text-base relative z-10">{stat.label}</p>
                    <p className="text-gray-500 text-xs sm:text-sm relative z-10">{stat.description}</p>
                    
                    {/* Refined story tooltip */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                      <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        {stat.story}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Refined About Section */}
      <section 
        ref={aboutRef}
        data-section="about"
        className="py-8 bg-gradient-to-br from-red-50 to-white relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Refined Floating Quote */}
          <FloatingQuote 
            text="L'innovation naît de la passion et de la persévérance"
            author="Rose Blanche Group"
            delay={0.3}
          />
          
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01] relative overflow-hidden"
            style={fadeInUp(sectionVisibility.about, 0)}
          >
            {/* Refined background pattern */}
            <div className="absolute inset-0 opacity-3">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-xl"></div>
            </div>

            <div className="text-center mb-6 relative z-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">L'Histoire de <span className="text-red-600">Rose Blanche</span></h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                De Sousse à la Tunisie entière, une success story qui continue de s'écrire
              </p>
              <div className="w-24 h-0.5 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div style={fadeInLeft(sectionVisibility.about, 0.2)}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Building className="h-6 w-6 text-red-600" />
                  Premier acteur agroalimentaire tunisien
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-base">
                 Fondé à Sousse, le <strong className="text-red-600">Rose Blanche Group</strong> est le 1er groupe agroalimentaire tunisien spécialisé
                 dans la transformation des céréales (pâtes, couscous, farine) et la production avicole.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                Avec plus de <strong className="text-red-600">29 filiales</strong>, <strong className="text-red-600">14 sites de production</strong> et <strong className="text-red-600">3 600
                collaborateurs</strong>, le groupe s'appuie sur son réseau de <strong className="text-red-600">16 000 agriculteurs partenaires</strong>
                et <strong className="text-red-600">48 centres</strong> de collecte à travers la Tunisie.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[ 
                    "Céréales & dérivés",
                    "Production de pâtes & couscous",
                    "Minoterie & semoule",
                    "Alimentation animale",
                    "Production avicole",
                    "Distribution logistique"
                  ].map((domain, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 shadow-sm"
                      style={staggerDelay(index, 0.3)}
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative" style={fadeInRight(sectionVisibility.about, 0.3)}>
                <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                  {/* Refined animated background */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full blur-lg animate-pulse delay-500"></div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Target className="h-6 w-6 text-red-200" />
                    <h4 className="text-xl font-bold">Notre Mission</h4>
                  </div>
                  <p className="text-red-100 leading-relaxed text-sm relative z-10">
                    Contribuer au développement de la future génération de professionnels en offrant des stages de qualité au sein
                    d'un groupe industriel reconnu. Rose Blanche s'engage à transmettre ses valeurs de rigueur, d'innovation et de
                    responsabilité dans un cadre formateur et bienveillant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refined Process Section */}
      <section 
        ref={processRef}
        data-section="process"
        className="py-8 bg-gradient-to-br from-white to-red-50 relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-6" style={fadeInUp(sectionVisibility.process, 0)}>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Votre Parcours de <span className="text-red-600">Stage</span></h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Un voyage structuré et accompagné pour transformer votre potentiel en excellence
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: "01",
                title: "Candidature",
                description: "Soumission du dossier via la plateforme avec documents requis",
                duration: "1-2 jours",
                icon: GraduationCap,
                story: "Le début de votre aventure commence ici"
              },
              {
                step: "02",
                title: "Évaluation",
                description: "Analyse du profil et entretien avec l'équipe RH",
                duration: "3-5 jours",
                icon: Shield,
                story: "Nous découvrons ensemble vos talents"
              },
              {
                step: "03",
                title: "Intégration",
                description: "Accueil, formation et assignation du tuteur",
                duration: "1 semaine",
                icon: Users,
                story: "Bienvenue dans la famille Rose Blanche"
              },
              {
                step: "04",
                title: "Accompagnement",
                description: "Suivi continu avec évaluations et feedback réguliers",
                duration: "Durée du stage",
                icon: Heart,
                story: "Votre croissance, notre priorité"
              },
            ].map((process, index) => {
              const IconComponent = process.icon
              return (
                <div 
                  key={index} 
                  className="text-center group hover:scale-105 transition-all duration-500 cursor-pointer relative"
                  style={{ ...fadeInUp(sectionVisibility.process, 0.1 + index * 0.1) }}
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 relative overflow-hidden">
                      {/* Refined animated ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
                      <IconComponent className="h-7 w-7 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {process.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-red-200 to-red-300 -z-10 group-hover:from-red-300 group-hover:to-red-400 transition-all duration-300"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed text-sm">{process.description}</p>
                  <span className="inline-block bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 shadow-sm">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {process.duration}
                  </span>
                  
                  {/* Refined story tooltip */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                    <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {process.story}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Refined Testimonials Section */}
      {testimonialsSection}

      {/* Refined Story Conclusion */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-red-100 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div style={fadeInUp(true, 0)}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Votre Histoire Nous <span className="text-red-600">Attend</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Rejoignez la communauté Rose Blanche et écrivez avec nous les prochains chapitres 
              de cette success story tunisienne. Votre avenir professionnel commence ici.
            </p>
            <Link href="/public/demande-stage">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer rounded-xl transform hover:-translate-y-1"
              >
                Écrire votre histoire
                <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
