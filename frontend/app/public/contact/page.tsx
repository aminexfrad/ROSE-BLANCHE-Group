/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Clock, HeadphonesIcon, Users, Send } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [errors, setErrors] = useState({ nom: false, email: false, message: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const newErrors = {
      nom: formData.nom.trim() === "",
      email: formData.email.trim() === "",
      message: formData.message.trim() === "",
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      return
    }
    setIsSubmitting(true)

    try {
      // TODO: Appel API pour envoyer le message
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      })

      setFormData({ nom: "", email: "", message: "" })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setErrors((prev) => ({ ...prev, [e.target.name]: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden cursor-default">
      {/* Background Images */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Navbar isPublic />

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 cursor-pointer hover:text-red-600 transition-colors duration-300">
              Contactez-<span className="text-red-600">nous</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Notre équipe est là pour répondre à toutes vos questions concernant StageBloom. N'hésitez pas à nous
              contacter !
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { number: "< 2h", label: "Temps de réponse" },
                { number: "24/7", label: "Support disponible" },
                { number: "99%", label: "Satisfaction client" },
                { number: "5★", label: "Note moyenne" },
              ].map((stat, index) => (
                <div key={index} className="text-center hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                  Envoyez-nous un message
                </CardTitle>
                <CardDescription>Remplissez le formulaire et nous vous répondrons rapidement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                      Nom complet *
                    </Label>
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom et prénom"
                      className={`mt-1 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 cursor-text ${errors.nom ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre.email@exemple.com"
                      className={`mt-1 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 cursor-text ${errors.email ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande ou votre question..."
                      rows={6}
                      className={`mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none cursor-text ${errors.message ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-lg font-semibold hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                    Informations de contact
                  </CardTitle>
                  <CardDescription>Plusieurs moyens pour nous joindre rapidement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      icon: Mail,
                      title: "Email",
                      primary: "contact@stagebloom.com",
                      secondary: "support@stagebloom.com",
                    },
                    {
                      icon: Phone,
                      title: "Téléphone",
                      primary: "+33 1 23 45 67 89",
                      secondary: "Lundi - Vendredi, 9h - 18h",
                    },
                    {
                      icon: MapPin,
                      title: "Adresse",
                      primary: "123 Avenue de l'Innovation",
                      secondary: "75001 Paris, France",
                    },
                    {
                      icon: Clock,
                      title: "Horaires",
                      primary: "Lundi - Vendredi : 9h00 - 18h00",
                      secondary: "Support 24/7 disponible",
                    },
                  ].map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-200 transition-colors">
                        <contact.icon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-red-600 transition-colors">
                          {contact.title}
                        </h3>
                        <p className="text-gray-700 font-medium">{contact.primary}</p>
                        <p className="text-gray-600 text-sm">{contact.secondary}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: HeadphonesIcon,
                    title: "Support Technique",
                    description: "Pour toute question technique ou problème d'accès",
                    email: "support@stagebloom.com",
                    response: "Sous 2h en moyenne",
                  },
                  {
                    icon: Users,
                    title: "Partenariats",
                    description: "Vous représentez un institut ou une entreprise ?",
                    email: "partenariats@stagebloom.com",
                    response: "+33 1 23 45 67 90",
                  },
                ].map((support, index) => (
                  <Card
                    key={index}
                    className="shadow-md border-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg hover:text-red-600 transition-colors">{support.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{support.description}</p>
                      <p className="text-sm">
                        <strong>Email:</strong> {support.email}
                      </p>
                      <p className="text-sm">
                        <strong>Réponse:</strong> {support.response}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
            <p className="text-xl text-gray-600">Les réponses aux questions les plus posées</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Comment postuler pour un stage ?",
                answer:
                  "Rendez-vous sur notre page de demande de stage, remplissez le formulaire avec vos informations et téléversez les documents requis.",
              },
              {
                question: "Qui peut utiliser StageBloom ?",
                answer:
                  "StageBloom est destiné aux étudiants, tuteurs, responsables RH et administrateurs d'instituts partenaires.",
              },
              {
                question: "Comment accéder à mon compte ?",
                answer:
                  "Utilisez le lien 'Connexion' dans la navigation. Vos identifiants vous seront fournis par votre institut ou votre entreprise.",
              },
              {
                question: "Problème technique ?",
                answer:
                  "Contactez notre support technique à support@stagebloom.com avec une description détaillée du problème rencontré.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="shadow-md border-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
