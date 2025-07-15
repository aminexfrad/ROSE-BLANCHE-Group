/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  User,
  ChevronUp,
  Award,
  Shield,
  Database,
  Upload,
  Activity,
  CheckCircle,
  TrendingUp,
  Bell,
  Star,
  Zap,
  Briefcase,
  UserPlus,
} from "lucide-react"

const menuItems = {
  stagiaire: [
    {
      title: "Navigation",
      items: [
        { title: "Tableau de bord", url: "/stagiaire", icon: Home },
        { title: "Mon Parcours", url: "/stagiaire/parcours", icon: Calendar },
        { title: "Documents", url: "/stagiaire/documents", icon: FileText },
        { title: "KPI & Évaluation", url: "/stagiaire/kpi", icon: BarChart3 },
        { title: "Témoignages", url: "/stagiaire/temoignages", icon: MessageSquare },
      ],
    },
    {
      title: "Ressources",
      items: [
        { title: "Rose Blanche", url: "/public/pfe-book", icon: BookOpen },
        { title: "Vidéo 3D", url: "/public/video-3d", icon: Award },
      ],
    },
  ],
  tuteur: [
    {
      title: "Gestion",
      items: [
        { title: "Tableau de bord", url: "/tuteur", icon: Home },
        { title: "Mes Stagiaires", url: "/tuteur/stagiaires", icon: Users },
        { title: "Évaluations", url: "/tuteur/evaluations", icon: CheckCircle },
        { title: "Statistiques", url: "/tuteur/statistiques", icon: BarChart3 },
      ],
    },
    {
      title: "Suivi",
      items: [
        { title: "Planning", url: "/tuteur/planning", icon: Calendar },
        { title: "Messages", url: "/tuteur/messages", icon: MessageSquare },
      ],
    },
  ],
  rh: [
    {
      title: "Vue d'ensemble",
      items: [
        { title: "Tableau de bord", url: "/rh", icon: Home },
        { title: "Tous les Stagiaires", url: "/rh/stagiaires", icon: Users },
        { title: "KPI Globaux", url: "/rh/kpi-globaux", icon: TrendingUp },
        { title: "Statistiques", url: "/rh/statistiques", icon: BarChart3 },
      ],
    },
    {
      title: "Gestion",
      items: [
        { title: "Témoignages", url: "/rh/temoignages", icon: MessageSquare },
        { title: "Demandes de stage", url: "/rh/demandes", icon: FileText },
        { title: "Rapports", url: "/rh/rapports", icon: Upload },
        { title: "Assignation Tuteurs", url: "/rh/assignation-tuteurs", icon: UserPlus },
        { title: "Ajouter Stagiaire", url: "/rh/ajouter-stagiaire", icon: UserPlus },
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
        { title: "Rose Blanche", url: "/admin/pfe-book", icon: BookOpen },
        { title: "Configuration", url: "/admin/configuration", icon: Settings },
      ],
    },
    {
      title: "Système",
      items: [
        { title: "Statistiques", url: "/admin/statistiques", icon: BarChart3 },
        { title: "Monitoring", url: "/admin/monitoring", icon: Activity },
        { title: "Sécurité", url: "/admin/security", icon: Shield },
        { title: "Base de données", url: "/admin/database", icon: Database },
      ],
    },
  ],
}

const roleColors = {
  stagiaire: "from-blue-500 to-purple-600",
  tuteur: "from-green-500 to-teal-600",
  rh: "from-orange-500 to-red-600",
  admin: "from-purple-500 to-pink-600",
}

const roleIcons = {
  stagiaire: Star,
  tuteur: Users,
  rh: TrendingUp,
  admin: Shield,
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
          <img
            src="/RoseBlancheLOGO.png"
            alt="Rose Blanche Logo"
            className="h-16 w-auto max-h-20 object-contain mx-auto"
            style={{ flex: 1, background: 'white' }}
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

      <SidebarFooter className="border-t border-gray-200/50 p-3 bg-gradient-to-r from-white to-gray-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-300 rounded-xl p-3 group">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-red-300">
                        <AvatarFallback
                          className={`bg-gradient-to-br ${roleColors[user.role]} text-white text-sm font-bold`}
                        >
                          {user.prenom?.[0]}
                          {user.nom?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.prenom || ''} {user.nom || ''}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bell className="h-3 w-3 text-gray-400" />
                    <ChevronUp className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-64 mb-2 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">
                    {user.prenom || ''} {user.nom || ''}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role} • En ligne</p>
                </div>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-3"
                >
                  <Link href="/profile">
                    <User className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Mon Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-3"
                >
                  <Link href="/settings">
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-3"
                >
                  {/* Notifications removed as requested */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600 hover:bg-red-50 transition-colors duration-200 p-3 font-medium"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
