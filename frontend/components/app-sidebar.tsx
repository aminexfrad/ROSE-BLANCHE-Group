/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Shield,
  Upload,
  CheckCircle,
  TrendingUp,
  Star,
  Zap,
  Briefcase,
  UserPlus,
} from "lucide-react"

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<any>
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuItems: Record<string, MenuGroup[]> = {
  stagiaire: [
    {
      title: "Navigation",
      items: [
        { title: "Tableau de bord", url: "/stagiaire", icon: Home },
        { title: "Mon Parcours", url: "/stagiaire/parcours", icon: Calendar },
        { title: "Documents", url: "/stagiaire/documents", icon: FileText },
        { title: "Rapports PFE", url: "/stagiaire/pfe-reports", icon: FileText },
        { title: "KPI & Évaluation", url: "/stagiaire/kpi", icon: BarChart3 },
        { title: "Témoignages", url: "/stagiaire/temoignages", icon: MessageSquare },
      ],
    },
  ],
  tuteur: [
    {
      title: "Gestion",
      items: [
        { title: "Tableau de bord", url: "/tuteur", icon: Home },
        { title: "Mes Stagiaires", url: "/tuteur/stagiaires", icon: Users },
        { title: "Entretiens", url: "/tuteur/entretiens", icon: Calendar },
        { title: "Rapports PFE", url: "/tuteur/pfe-reports", icon: FileText },
        { title: "Évaluations", url: "/tuteur/evaluations", icon: CheckCircle },
        { title: "Statistiques", url: "/tuteur/statistiques", icon: BarChart3 },
      ],
    },
  ],
  rh: [
    {
      title: "Vue d'ensemble",
      items: [
        { title: "Tableau de bord", url: "/rh", icon: Home },
        { title: "Tous les Stagiaires", url: "/rh/stagiaires", icon: Users },
      ],
    },
    {
      title: "Gestion",
      items: [
        { title: "Témoignages", url: "/rh/temoignages", icon: MessageSquare },
        { title: "Demandes de stage", url: "/rh/demandes", icon: FileText },
        { title: "Entretiens", url: "/rh/entretiens", icon: Calendar },
        { title: "PFE Digital Hub", url: "/rh/pfe-digital-hub", icon: FileText },
        { title: "Assignation Tuteurs", url: "/rh/assignation-tuteurs", icon: UserPlus },
      ],
    },
  ],
  admin: [
    {
      title: "Administration",
      items: [
        { title: "Tableau de bord", url: "/admin", icon: Home },
        { title: "Utilisateurs", url: "/admin/utilisateurs", icon: Users },
        { title: "Offres de Stage", url: "/admin/offres-stage", icon: Briefcase },
        { title: "Configuration", url: "/admin/configuration", icon: Shield },
      ],
    },
    {
      title: "Système",
      items: [
        { title: "Statistiques", url: "/admin/statistiques", icon: BarChart3 },
      ],
    },
  ],
  candidat: [
    {
      title: "Candidature",
      items: [
        { title: "Tableau de bord", url: "/candidate", icon: Home },
        { title: "Mes Demandes", url: "/candidate/demandes", icon: FileText },
        { title: "Profil", url: "/candidate/profile", icon: Users },
      ],
    },
  ],
}

const roleColors = {
  stagiaire: "from-blue-500 to-purple-600",
  tuteur: "from-green-500 to-teal-600",
  rh: "from-orange-500 to-red-600",
  admin: "from-purple-500 to-pink-600",
  candidat: "from-indigo-500 to-blue-600",
}

const roleIcons = {
  stagiaire: Star,
  tuteur: Users,
  rh: TrendingUp,
  admin: Shield,
  candidat: Star,
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  if (!user) return null

  const userMenuItems = menuItems[user.role] || []
  const RoleIcon = roleIcons[user.role]

  return (
    <Sidebar variant="inset" className="border-r border-gray-200/50 backdrop-blur-sm">
      <SidebarHeader className="border-b border-gray-200/50 p-4 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex items-center gap-3 group">
          <Image
            src="/RoseBlancheLOGO.webp"
            alt="Rose Blanche Logo"
            width={120}
            height={40}
            className="h-16 w-auto max-h-20 object-contain mx-auto"
            style={{ flex: 1, background: 'white' }}
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-gradient-to-b from-white to-gray-50/30">
        {userMenuItems.map((group, index) => (
          <SidebarGroup key={index} className="mb-6">
            <SidebarGroupLabel className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleColors[user.role]}`}></div>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  const isHovered = hoveredItem === item.url

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        onMouseEnter={() => setHoveredItem(item.url)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                          group relative transition-all duration-300 ease-out
                          hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50
                          data-[active=true]:bg-gradient-to-r data-[active=true]:from-red-50 data-[active=true]:to-red-100/50
                          data-[active=true]:text-red-800 data-[active=true]:shadow-md
                          data-[active=true]:border-r-4 data-[active=true]:border-red-500
                          rounded-xl mx-1 overflow-hidden
                          ${isHovered ? "transform scale-[1.02] shadow-lg" : ""}
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-3 relative">
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/5 animate-pulse"></div>
                          )}
                          <div
                            className={`
                            relative p-1.5 rounded-lg transition-all duration-300
                            ${
                              isActive
                                ? "bg-red-100 text-red-600 shadow-sm"
                                : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm"
                            }
                            ${isHovered ? "transform rotate-12 scale-110" : ""}
                          `}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 relative">
                            <span
                              className={`
                              font-semibold transition-all duration-300
                              ${isActive ? "text-red-800" : "text-gray-700 group-hover:text-gray-900"}
                            `}
                            >
                              {item.title}
                            </span>
                            {isHovered && (
                              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            )}
                          </div>
                          {/* Zap icon removed as requested */}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
