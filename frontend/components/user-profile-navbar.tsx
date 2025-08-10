/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"

const roleColors = {
  stagiaire: "from-blue-500 to-blue-600",
  tuteur: "from-green-500 to-green-600", 
  rh: "from-purple-500 to-purple-600",
  admin: "from-red-500 to-red-600",
}

export function UserProfileNavbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      {/* Notification Bell */}
      <NotificationBell className="mr-2" />
      
      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-all duration-300 rounded-lg group"
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-8 w-8 ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-red-300">
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
            <div className="text-left flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.prenom || ''} {user.nom || ''}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-64 mt-2 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
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
    </div>
  )
} 