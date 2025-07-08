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
  Pause
} from "lucide-react"

export default function PublicHomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  
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

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  // Animation utilities
  const fadeInUp = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const fadeInLeft = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const fadeInRight = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const scaleIn = (isVisible: boolean, delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    transition: `all 0.6s ease-out ${delay}s`
  })

  const staggerDelay = (index: number, baseDelay: number = 0.1) => ({
    transitionDelay: `${baseDelay + index * 0.1}s`
  })

  // Parallax effect for background elements
  const parallaxStyle = (speed: number) => ({
    transform: `translateY(${scrollY * speed}px)`
  })

  // Story progression indicator
  const StoryProgress = () => (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col items-center space-y-4">
        {['hero', 'stats', 'about', 'process', 'testimonials'].map((section, index) => (
          <button
            key={section}
            onClick={() => {
              const element = document.querySelector(`[data-section="${section}"]`)
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index 
                ? 'bg-red-600 scale-125 shadow-lg shadow-red-200' 
                : 'bg-gray-300 hover:bg-red-400'
            }`}
            title={`Section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )

  // Floating quote component
  const FloatingQuote = ({ text, author, delay = 0 }: { text: string; author: string; delay?: number }) => (
    <div 
      className="absolute opacity-20 text-center max-w-xs"
      style={{
        ...fadeInUp(sectionVisibility.about, delay),
        left: '5%',
        top: '20%',
        transform: `rotate(-5deg) translateY(${scrollY * 0.02}px)`
      }}
    >
      <Quote className="h-8 w-8 text-red-400 mx-auto mb-2" />
      <p className="text-sm italic text-gray-600">"{text}"</p>
      <p className="text-xs text-red-500 font-medium mt-1">— {author}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden cursor-default">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"
          style={parallaxStyle(0.1)}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"
          style={parallaxStyle(-0.05)}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"
          style={parallaxStyle(0.02)}
        ></div>
        
        {/* Additional floating elements for storytelling */}
        <div 
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-red-300 to-red-400 rounded-full blur-2xl opacity-30 animate-pulse delay-700"
          style={parallaxStyle(0.03)}
        ></div>
        <div 
          className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-xl opacity-40 animate-pulse delay-300"
          style={parallaxStyle(-0.02)}
        ></div>
      </div>

      <Navbar isPublic />

      {/* Story Progress Indicator */}
      <StoryProgress />

      {/* Hero Section - The Beginning of Our Story */}
      <section 
        ref={heroRef} 
        data-section="hero"
        className="bg-transparent py-16 sm:py-20 lg:py-32 relative min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="text-center">
            {/* Story Introduction */}
            <div 
              className="mb-8"
              style={fadeInUp(sectionVisibility.hero, 0)}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-red-200">
                <Sparkles className="h-4 w-4" />
                Découvrez notre histoire
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight cursor-pointer hover:text-red-600 transition-all duration-500 transform hover:scale-105">
                Une <span className="text-red-600 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Plateforme
                </span> qui Révolutionne
                <span className="block text-red-600 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  l'Expérience des Stages
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-700 mt-2">
                  Chez Rose Blanche Group
                </span>
              </h1>
            </div>

            {/* Story Hook */}
            <div 
              className="mb-12"
              style={fadeInUp(sectionVisibility.hero, 0.3)}
            >
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                Imaginez un monde où chaque stagiaire trouve sa place, où chaque projet devient une aventure, 
                et où chaque apprentissage se transforme en réussite. C'est l'histoire que nous écrivons ensemble.
              </p>
            </div>

            {/* Call to Adventure */}
            <div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 px-4"
              style={fadeInUp(sectionVisibility.hero, 0.6)}
            >
              <Link href="/public/demande-stage" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-semibold hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-3xl cursor-pointer rounded-2xl transform hover:-translate-y-1 w-full sm:w-auto relative overflow-hidden"
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
                  className="group border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl cursor-pointer rounded-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Explorer nos projets
                  <Globe className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
              style={fadeInUp(sectionVisibility.hero, 1)}
            >
              <ChevronDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - The Numbers Tell Our Story */}
      <section 
        ref={statsRef}
        data-section="stats" 
        className="py-20 bg-transparent relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Introduction */}
          <div 
            className="text-center mb-16"
            style={fadeInUp(sectionVisibility.stats, 0)}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Notre Impact en Chiffres
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque nombre raconte une histoire de réussite, d'apprentissage et de croissance
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Animated Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4">
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
                  className="text-center hover:scale-110 transition-all duration-500 cursor-pointer group relative"
                  style={{ ...fadeInUp(sectionVisibility.stats, 0.2 + index * 0.1) }}
                >
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 relative overflow-hidden">
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors duration-300 relative z-10">
                      {stat.number}
                    </div>
                    <p className="text-gray-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-lg relative z-10">{stat.label}</p>
                    <p className="text-gray-500 text-xs sm:text-sm relative z-10">{stat.description}</p>
                    
                    {/* Story tooltip */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                        {stat.story}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section - The Heart of Our Story */}
      <section 
        ref={aboutRef}
        data-section="about"
        className="py-20 bg-transparent relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Floating Quote */}
          <FloatingQuote 
            text="L'innovation naît de la passion et de la persévérance"
            author="Rose Blanche Group"
            delay={0.5}
          />
          
          <div 
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden"
            style={fadeInUp(sectionVisibility.about, 0)}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-xl"></div>
            </div>

            <div className="text-center mb-12 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">L'Histoire de Rose Blanche</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                De Sousse à la Tunisie entière, une success story qui continue de s'écrire
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div style={fadeInLeft(sectionVisibility.about, 0.2)}>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Building className="h-8 w-8 text-red-600" />
                  Premier acteur agroalimentaire tunisien
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                 Fondé à Sousse, le <strong className="text-red-600">Rose Blanche Group</strong> est le 1er groupe agroalimentaire tunisien spécialisé
                 dans la transformation des céréales (pâtes, couscous, farine) et la production avicole.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                Avec plus de <strong className="text-red-600">29 filiales</strong>, <strong className="text-red-600">14 sites de production</strong> et <strong className="text-red-600">3 600
                collaborateurs</strong>, le groupe s'appuie sur son réseau de <strong className="text-red-600">16 000 agriculteurs partenaires</strong>
                et <strong className="text-red-600">48 centres</strong> de collecte à travers la Tunisie.
                </p>
                <div className="flex flex-wrap gap-3">
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
                      className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105"
                      style={staggerDelay(index, 0.4)}
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative" style={fadeInRight(sectionVisibility.about, 0.4)}>
                <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-lg animate-pulse delay-500"></div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Target className="h-8 w-8 text-red-200" />
                    <h4 className="text-2xl font-bold">Notre Mission</h4>
                  </div>
                  <p className="text-red-100 leading-relaxed text-lg relative z-10">
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

      {/* Process Section - The Journey We Offer */}
      <section 
        ref={processRef}
        data-section="process"
        className="py-20 bg-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16" style={fadeInUp(sectionVisibility.process, 0)}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Votre Parcours de Stage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un voyage structuré et accompagné pour transformer votre potentiel en excellence
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                  style={{ ...fadeInUp(sectionVisibility.process, 0.2 + index * 0.1) }}
                >
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110 relative overflow-hidden">
                      {/* Animated ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
                      <IconComponent className="h-10 w-10 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {process.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-red-200 to-red-300 -z-10 group-hover:from-red-300 group-hover:to-red-400 transition-all duration-300"></div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-lg">{process.description}</p>
                  <span className="inline-block bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium border border-red-200">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {process.duration}
                  </span>
                  
                  {/* Story tooltip */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                      {process.story}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - The Voices of Our Story */}
      <section 
        ref={testimonialsRef}
        data-section="testimonials"
        className="py-20 bg-transparent relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16" style={fadeInUp(sectionVisibility.testimonials, 0)}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Les Héros de Notre Histoire</h2>
            <p className="text-xl text-gray-600">Découvrez l'expérience de ceux qui nous ont fait confiance</p>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Amira Ben Salem",
                role: "Étudiante en Génie Civil - ENIT",
                text: "Mon stage chez Rose Blanche m'a permis de découvrir les réalités du terrain. L'encadrement était exceptionnel et la plateforme digitale a facilité tout mon parcours.",
                rating: 5,
                project: "Projet autoroutier Tunis-Sfax",
                avatar: "AB",
                story: "Transformée par l'expérience terrain"
              },
              {
                name: "Mohamed Trabelsi",
                role: "Étudiant en Génie Mécanique - INSAT",
                text: "Une expérience enrichissante avec des projets concrets. Les outils de suivi m'ont aidé à progresser rapidement et à acquérir de vraies compétences professionnelles.",
                rating: 5,
                project: "Système de ventilation industrielle",
                avatar: "MT",
                story: "Développé des compétences techniques avancées"
              },
              {
                name: "Salma Karray",
                role: "Étudiante en Architecture - ENAU",
                text: "L'approche pédagogique de Rose Blanche est remarquable. J'ai pu participer à des projets d'envergure tout en bénéficiant d'un suivi personnalisé via la plateforme.",
                rating: 5,
                project: "Complexe résidentiel Lac Nord",
                avatar: "SK",
                story: "Participé à des projets d'envergure"
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden transform hover:-translate-y-2 relative group"
                style={{ ...fadeInUp(sectionVisibility.testimonials, 0.2 + index * 0.1) }}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-1 mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{testimonial.text}"</p>
                  <div className="text-center border-t pt-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div className="font-bold text-gray-900 mb-2 text-lg">{testimonial.name}</div>
                    <div className="text-red-600 text-sm mb-3">{testimonial.role}</div>
                    <div className="text-gray-500 text-xs bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-full inline-block border border-gray-200">
                      <Lightbulb className="inline h-3 w-3 mr-1" />
                      {testimonial.project}
                    </div>
                  </div>
                  
                  {/* Story tooltip */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                      {testimonial.story}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Conclusion */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div style={fadeInUp(true, 0)}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Votre Histoire Nous Attend
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Rejoignez la communauté Rose Blanche et écrivez avec nous les prochains chapitres 
              de cette success story tunisienne. Votre avenir professionnel commence ici.
            </p>
            <Link href="/public/demande-stage">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-xl font-semibold hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-3xl cursor-pointer rounded-2xl transform hover:-translate-y-1"
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
