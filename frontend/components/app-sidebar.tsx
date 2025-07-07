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
} from "lucide-react"

const menuItems = {
  stagiaire: [
    {
      title: "Navigation",
      items: [
        { title: "Tableau de bord", url: "/stagiaire", icon: Home, badge: null },
        { title: "Mon Parcours", url: "/stagiaire/parcours", icon: Calendar, badge: "3" },
        { title: "Documents", url: "/stagiaire/documents", icon: FileText, badge: null },
        { title: "KPI & Évaluation", url: "/stagiaire/kpi", icon: BarChart3, badge: "Nouveau" },
        { title: "Témoignages", url: "/stagiaire/temoignages", icon: MessageSquare, badge: null },
      ],
    },
    {
      title: "Ressources",
      items: [
        { title: "Rose Blanche", url: "/public/pfe-book", icon: BookOpen, badge: null },
        { title: "Vidéo 3D", url: "/public/video-3d", icon: Award, badge: "Premium" },
      ],
    },
  ],
  tuteur: [
    {
      title: "Gestion",
      items: [
        { title: "Tableau de bord", url: "/tuteur", icon: Home, badge: null },
        { title: "Mes Stagiaires", url: "/tuteur/stagiaires", icon: Users, badge: "12" },
        { title: "Évaluations", url: "/tuteur/evaluations", icon: CheckCircle, badge: "5" },
        { title: "Statistiques", url: "/tuteur/statistiques", icon: BarChart3, badge: null },
      ],
    },
    {
      title: "Suivi",
      items: [
        { title: "Planning", url: "/tuteur/planning", icon: Calendar, badge: "2" },
        { title: "Messages", url: "/tuteur/messages", icon: MessageSquare, badge: "8" },
      ],
    },
  ],
  rh: [
    {
      title: "Vue d'ensemble",
      items: [
        { title: "Tableau de bord", url: "/rh", icon: Home, badge: null },
        { title: "Tous les Stagiaires", url: "/rh/stagiaires", icon: Users, badge: "45" },
        { title: "KPI Globaux", url: "/rh/kpi-globaux", icon: TrendingUp, badge: "Urgent" },
        { title: "Statistiques", url: "/rh/statistiques", icon: BarChart3, badge: null },
      ],
    },
    {
      title: "Gestion",
      items: [
        { title: "Témoignages", url: "/rh/temoignages", icon: MessageSquare, badge: "3" },
        { title: "Demandes de stage", url: "/rh/demandes", icon: FileText, badge: "7" },
        { title: "Rapports", url: "/rh/rapports", icon: Upload, badge: null },
      ],
    },
  ],
  admin: [
    {
      title: "Administration",
      items: [
        { title: "Tableau de bord", url: "/admin", icon: Home, badge: null },
        { title: "Utilisateurs", url: "/admin/utilisateurs", icon: Users, badge: "156" },
        { title: "Offres de Stage", url: "/admin/offres-stage", icon: Briefcase, badge: "Nouveau" },
        { title: "Rose Blanche", url: "/admin/pfe-book", icon: BookOpen, badge: null },
        { title: "Configuration", url: "/admin/configuration", icon: Settings, badge: "1" },
      ],
    },
    {
      title: "Système",
      items: [
        { title: "Statistiques", url: "/admin/statistiques", icon: BarChart3, badge: null },
        { title: "Monitoring", url: "/admin/monitoring", icon: Activity, badge: "OK" },
        { title: "Sécurité", url: "/admin/security", icon: Shield, badge: "Alerte" },
        { title: "Base de données", url: "/admin/database", icon: Database, badge: null },
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
          <div
            className={`w-10 h-10 bg-gradient-to-br ${roleColors[user.role]} rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-lg tracking-tight">StageBloom</h2>
            <div className="flex items-center gap-2">
              <RoleIcon className="w-3 h-3 text-gray-500" />
              <p className="text-xs text-gray-500 capitalize font-medium">{user.role}</p>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Pro
              </Badge>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
                          {item.badge && (
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className={`
                                text-xs px-2 py-0.5 transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                                }
                                ${isHovered ? "animate-bounce" : ""}
                              `}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isHovered && <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />}
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
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-red-300">
                        <AvatarFallback
                          className={`bg-gradient-to-br ${roleColors[user.role]} text-white text-sm font-bold`}
                        >
                          {user.prenom?.[0]}
                          {user.nom?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-left flex-1">
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
                  <Link href="/notifications">
                    <Bell className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Notifications</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      3
                    </Badge>
                  </Link>
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
