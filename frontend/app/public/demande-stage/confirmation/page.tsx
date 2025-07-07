"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Mail, Calendar, FileText, ArrowLeft, Home, Phone } from "lucide-react"
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

      {/* Informations de confirmation */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Détails de la demande */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  Récapitulatif de votre demande
                </CardTitle>
                <CardDescription>Informations soumises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Numéro de demande</span>
                  <Badge variant="secondary" className="font-mono">
                    #STG-2024-001
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Date de soumission</span>
                  <span className="text-gray-600">{new Date().toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Statut</span>
                  <Badge className="bg-yellow-100 text-yellow-800">En cours de traitement</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Documents soumis</span>
                  <Badge variant="secondary">3 fichiers</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Prochaines étapes */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  Prochaines étapes
                </CardTitle>
                <CardDescription>Ce qui va se passer maintenant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmation par email</h4>
                    <p className="text-sm text-gray-600">
                      Vous recevrez un email de confirmation dans les prochaines minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Examen de la candidature</h4>
                    <p className="text-sm text-gray-600">
                      Notre équipe RH examinera votre dossier (2-5 jours ouvrables)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Réponse et entretien</h4>
                    <p className="text-sm text-gray-600">
                      Si votre profil correspond, nous vous contacterons pour un entretien
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Décision finale</h4>
                    <p className="text-sm text-gray-600">
                      Vous recevrez notre décision finale dans un délai de 10 jours ouvrables
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions disponibles */}
          <Card className="mt-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Actions disponibles</CardTitle>
              <CardDescription>Ce que vous pouvez faire maintenant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                  <Download className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Télécharger le récépissé</span>
                  <span className="text-xs text-gray-500">PDF de confirmation</span>
                </Button>

                <Link href="/public/pfe-book">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 w-full bg-transparent"
                  >
                    <FileText className="h-6 w-6 text-green-600" />
                    <span className="font-medium">Consulter Rose Blanche</span>
                    <span className="text-xs text-gray-500">Découvrir les PFE</span>
                  </Button>
                </Link>

                <Link href="/public/video-3d">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 w-full bg-transparent"
                  >
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                    <span className="font-medium">Visite virtuelle 3D</span>
                    <span className="text-xs text-gray-500">Découvrir l'entreprise</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-red-50 to-rose-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-red-900">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-600" />
                </div>
                Besoin d'aide ?
              </CardTitle>
              <CardDescription>Notre équipe est là pour vous accompagner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Email</h4>
                    <p className="text-red-700">stages@roseblanche.com</p>
                    <p className="text-sm text-red-600">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Téléphone</h4>
                    <p className="text-red-700">+216 71 123 456</p>
                    <p className="text-sm text-red-600">Lun-Ven 9h-17h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/public/demande-stage">
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </Link>
            <Link href="/public">
              <Button className="bg-red-600 hover:bg-red-700">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
