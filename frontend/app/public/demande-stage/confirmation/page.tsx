"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Search, Users, Award, Home, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isPublic />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-in fade-in duration-1000">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Demande <span className="text-green-600">Envoyée !</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Votre demande de stage a été soumise avec succès. Nous vous contacterons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </section>

      {/* Prochaines étapes */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prochaines étapes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ce qui va se passer maintenant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Étape 1 */}
            <div className="group relative" role="article" aria-label="Étape 1: Confirmation par email">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <Card className="relative h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-sm" aria-label="Étape 1">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmation par email</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Vous recevrez un email de confirmation dans les prochaines minutes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Étape 2 */}
            <div className="group relative" role="article" aria-label="Étape 2: Examen de la candidature">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <Card className="relative h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Search className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-sm" aria-label="Étape 2">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Examen de la candidature</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Notre équipe RH examinera votre dossier (2-5 jours ouvrables)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Étape 3 */}
            <div className="group relative" role="article" aria-label="Étape 3: Réponse et entretien">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <Card className="relative h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold text-sm" aria-label="Étape 3">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Réponse et entretien</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Si votre profil correspond, nous vous contacterons pour un entretien
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Étape 4 */}
            <div className="group relative" role="article" aria-label="Étape 4: Décision finale">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <Card className="relative h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 font-bold text-sm" aria-label="Étape 4">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Décision finale</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Vous recevrez notre décision finale dans un délai de 10 jours ouvrables
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Timeline connector */}
          <div className="hidden lg:block relative mt-8" aria-hidden="true">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 via-purple-400 to-red-400 transform -translate-y-1/2"></div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Que souhaitez-vous faire maintenant ?</h3>
            <p className="text-gray-600">Explorez nos autres services ou retournez à l'accueil</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/public">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            
            <Link href="/public/pfe-book">
              <Button variant="outline" className="border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-300">
                <BookOpen className="mr-2 h-4 w-4" />
                Consulter le PFE Book
              </Button>
            </Link>
            
            <Link href="/public/demande-stage">
              <Button variant="outline" className="border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-300">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
