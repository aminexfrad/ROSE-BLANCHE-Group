"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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
  BookOpen
} from "lucide-react"

export default function PublicHomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeInUp = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out'
  }

  const staggerDelay = (index: number) => ({
    transitionDelay: `${index * 0.1}s`
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden cursor-default">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"
          style={{ transform: `translateX(${scrollY * 0.02}px)` }}
        ></div>
      </div>

      <Navbar isPublic />

      {/* Hero Section with Enhanced Animations */}
      <section ref={heroRef} className="bg-transparent py-16 sm:py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div 
              className="mb-8"
              style={{ ...fadeInUp, ...staggerDelay(0) }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight cursor-pointer hover:text-red-600 transition-all duration-500 transform hover:scale-105">
                Plateforme de Gestion des
                <span className="block text-red-600 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Stagiaires
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-700 mt-2">
                  Rose Blanche Group
                </span>
              </h1>
            </div>

            <div 
              className="mb-12"
              style={{ ...fadeInUp, ...staggerDelay(1) }}
            >
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                Découvrez notre solution digitale innovante dédiée à la gestion complète des stages chez Rose Blanche. Une
                plateforme moderne qui connecte étudiants, tuteurs et équipes RH pour une expérience de stage
                exceptionnelle
              </p>
            </div>

            <div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 px-4"
              style={{ ...fadeInUp, ...staggerDelay(2) }}
            >
              <Link href="/public/demande-stage" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-semibold hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-3xl cursor-pointer rounded-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Postuler pour un stage
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              
              <Link href="/public/pfe-book" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl cursor-pointer rounded-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Découvrir nos projets
                  <Globe className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>
            </div>

            {/* Enhanced Statistics with Animations */}
            <div 
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4"
              style={{ ...fadeInUp, ...staggerDelay(3) }}
            >
              {[
                { 
                  number: "50+", 
                  label: "Stagiaires par an", 
                  description: "Étudiants accueillis",
                  icon: Users,
                  color: "from-blue-500 to-blue-600"
                },
                { 
                  number: "25+", 
                  label: "Années d'expérience", 
                  description: "En formation",
                  icon: Award,
                  color: "from-green-500 to-green-600"
                },
                { 
                  number: "15+", 
                  label: "Projets majeurs", 
                  description: "Participation active",
                  icon: TrendingUp,
                  color: "from-purple-500 to-purple-600"
                },
                { 
                  number: "100%", 
                  label: "Taux d'encadrement", 
                  description: "Suivi personnalisé",
                  icon: CheckCircle,
                  color: "from-orange-500 to-orange-600"
                },
              ].map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div
                    key={index}
                    className="text-center hover:scale-110 transition-all duration-500 cursor-pointer group"
                    style={{ ...staggerDelay(index) }}
                  >
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors duration-300">
                        {stat.number}
                      </div>
                      <p className="text-gray-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-lg">{stat.label}</p>
                      <p className="text-gray-500 text-xs sm:text-sm">{stat.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-20 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div 
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]"
            style={{ ...fadeInUp }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">À propos de Rose Blanche</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mb-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
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
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="h-8 w-8 text-red-200" />
                    <h4 className="text-2xl font-bold">Notre Mission</h4>
                  </div>
                  <p className="text-red-100 leading-relaxed text-lg">
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

      {/* Enhanced Process Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16" style={{ ...fadeInUp }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Processus de Stage chez Rose Blanche</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un parcours structuré et accompagné pour maximiser votre apprentissage
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
              },
              {
                step: "02",
                title: "Évaluation",
                description: "Analyse du profil et entretien avec l'équipe RH",
                duration: "3-5 jours",
                icon: Shield,
              },
              {
                step: "03",
                title: "Intégration",
                description: "Accueil, formation et assignation du tuteur",
                duration: "1 semaine",
                icon: Users,
              },
              {
                step: "04",
                title: "Accompagnement",
                description: "Suivi continu avec évaluations et feedback réguliers",
                duration: "Durée du stage",
                icon: Heart,
              },
            ].map((process, index) => {
              const IconComponent = process.icon
              return (
                <div 
                  key={index} 
                  className="text-center group hover:scale-105 transition-all duration-500 cursor-pointer"
                  style={{ ...fadeInUp, ...staggerDelay(index) }}
                >
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110">
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {process.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-red-200 to-red-300 -z-10"></div>
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
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16" style={{ ...fadeInUp }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Témoignages de nos Stagiaires</h2>
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
                avatar: "AB"
              },
              {
                name: "Mohamed Trabelsi",
                role: "Étudiant en Génie Mécanique - INSAT",
                text: "Une expérience enrichissante avec des projets concrets. Les outils de suivi m'ont aidé à progresser rapidement et à acquérir de vraies compétences professionnelles.",
                rating: 5,
                project: "Système de ventilation industrielle",
                avatar: "MT"
              },
              {
                name: "Salma Karray",
                role: "Étudiante en Architecture - ENAU",
                text: "L'approche pédagogique de Rose Blanche est remarquable. J'ai pu participer à des projets d'envergure tout en bénéficiant d'un suivi personnalisé via la plateforme.",
                rating: 5,
                project: "Complexe résidentiel Lac Nord",
                avatar: "SK"
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                style={{ ...fadeInUp, ...staggerDelay(index) }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{testimonial.text}"</p>
                  <div className="text-center border-t pt-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="font-bold text-gray-900 mb-2 text-lg">{testimonial.name}</div>
                    <div className="text-red-600 text-sm mb-3">{testimonial.role}</div>
                    <div className="text-gray-500 text-xs bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-full inline-block border border-gray-200">
                      <Lightbulb className="inline h-3 w-3 mr-1" />
                      {testimonial.project}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
