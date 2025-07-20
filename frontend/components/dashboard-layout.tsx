/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import type React from "react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { UserProfileNavbar } from "@/components/user-profile-navbar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles: ('stagiaire' | 'tuteur' | 'rh' | 'admin')[]
  breadcrumbs?: { label: string; href?: string }[]
}

export function DashboardLayout({ children, allowedRoles, breadcrumbs = [] }: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 hover:bg-red-50 hover:text-red-700 transition-colors duration-200" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {breadcrumbs.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList className="flex-wrap">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {crumb.href ? (
                            <BreadcrumbLink href={crumb.href} className="hover:text-red-600 transition-colors text-sm">
                              {crumb.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-red-600 font-medium text-sm">{crumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
            <UserProfileNavbar />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-3 sm:p-6 shadow-sm">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
