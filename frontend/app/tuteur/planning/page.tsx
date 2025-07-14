/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { apiClient, Stage } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Loader2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { format, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { fr } from "date-fns/locale"

interface PlanningEvent {
  id: string
  title: string
  date: Date
  time: string
  type: "meeting" | "evaluation" | "deadline" | "formation"
  stageId: string
  stageTitle: string
  description: string
  status: "pending" | "completed" | "overdue"
}

export default function TuteurPlanningPage() {
  const breadcrumbs = [{ label: "Tableau de bord", href: "/tuteur" }, { label: "Planning" }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<PlanningEvent[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getTuteurStages()
        const stagesData = response.results || []
        setStages(stagesData)
        
        // Generate planning events from real stage data
        const generatedEvents: PlanningEvent[] = []
        
        stagesData.forEach((stage, index) => {
          const startDate = new Date(stage.start_date)
          const endDate = new Date(stage.end_date)
          
          // Add stage start meeting
          generatedEvents.push({
            id: `start-${stage.id}`,
            title: `Début de stage: ${stage.title}`,
            date: startDate,
            time: "09:00",
            type: "meeting",
            stageId: stage.id.toString(),
            stageTitle: stage.title,
            description: `Première réunion avec ${stage.stagiaire_name || "le stagiaire"}`,
            status: startDate < new Date() ? "completed" : "pending"
          })
          
          // Add mid-term evaluation
          const midDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)
          generatedEvents.push({
            id: `mid-${stage.id}`,
            title: `Évaluation mi-parcours`,
            date: midDate,
            time: "14:00",
            type: "evaluation",
            stageId: stage.id.toString(),
            stageTitle: stage.title,
            description: `Évaluation intermédiaire du stage`,
            status: midDate < new Date() ? "completed" : "pending"
          })
          
          // Add final evaluation
          generatedEvents.push({
            id: `final-${stage.id}`,
            title: `Évaluation finale`,
            date: endDate,
            time: "10:00",
            type: "evaluation",
            stageId: stage.id.toString(),
            stageTitle: stage.title,
            description: `Évaluation finale du stage`,
            status: endDate < new Date() ? "completed" : "pending"
          })
          
          // Add weekly meetings
          for (let i = 1; i <= 4; i++) {
            const meetingDate = addDays(startDate, i * 7)
            if (meetingDate < endDate) {
              generatedEvents.push({
                id: `meeting-${stage.id}-${i}`,
                title: `Réunion hebdomadaire`,
                date: meetingDate,
                time: "16:00",
                type: "meeting",
                stageId: stage.id.toString(),
                stageTitle: stage.title,
                description: `Suivi hebdomadaire du stage`,
                status: meetingDate < new Date() ? "completed" : "pending"
              })
            }
          }
        })
        
        setEvents(generatedEvents)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du planning")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting": return <Users className="h-4 w-4" />
      case "evaluation": return <CheckCircle className="h-4 w-4" />
      case "deadline": return <AlertTriangle className="h-4 w-4" />
      case "formation": return <CalendarIcon className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-blue-100 text-blue-800 border-blue-200"
      case "evaluation": return "bg-green-100 text-green-800 border-green-200"
      case "deadline": return "bg-red-100 text-red-800 border-red-200"
      case "formation": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500"
      case "overdue": return "bg-red-500"
      default: return "bg-yellow-500"
    }
  }

  const todayEvents = getEventsForDate(new Date())
  const tomorrowEvents = getEventsForDate(addDays(new Date(), 1))

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement du planning</h2>
            <p className="text-gray-600">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["tuteur"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Planning & Agenda
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Gérez votre planning et suivez vos rendez-vous</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 animate-in slide-in-from-left duration-700 delay-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                  Calendrier
                </CardTitle>
                <CardDescription>
                  Sélectionnez une date pour voir les événements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={fr}
                />
              </CardContent>
            </Card>

            {/* Événements du jour sélectionné */}
            {selectedDate && (
              <Card className="shadow-xl border-0 mt-6 animate-in slide-in-from-bottom duration-700 delay-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                  <CardTitle className="text-xl">
                    Événements du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border ${getEventColor(event.type)} flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm opacity-80">{event.description}</p>
                              <p className="text-xs opacity-70">{event.stageTitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{event.time}</div>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun événement prévu pour cette date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Aujourd'hui */}
            <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-400">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded bg-white">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      </div>
                    ))}
                    {todayEvents.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{todayEvents.length - 3} autres événements
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center">Aucun événement aujourd'hui</p>
                )}
              </CardContent>
            </Card>

            {/* Demain */}
            <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  Demain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {tomorrowEvents.length > 0 ? (
                  <div className="space-y-3">
                    {tomorrowEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded bg-white">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      </div>
                    ))}
                    {tomorrowEvents.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{tomorrowEvents.length - 3} autres événements
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center">Aucun événement demain</p>
                )}
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-600">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stages actifs</span>
                    <Badge variant="secondary">{stages.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Événements ce mois</span>
                    <Badge variant="secondary">
                      {events.filter(e => {
                        const eventDate = new Date(e.date)
                        const now = new Date()
                        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                      }).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Évaluations à venir</span>
                    <Badge variant="secondary">
                      {events.filter(e => e.type === "evaluation" && e.status === "pending").length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="shadow-xl border-0 animate-in slide-in-from-right duration-700 delay-700">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau rendez-vous
                  </Button>
                  <Button className="w-full" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Planifier évaluation
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Réunion d'équipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
