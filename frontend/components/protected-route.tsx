"use client"

import type React from "react"
import { useProtectedRoute } from "@/hooks/use-protected-route"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  useProtectedRoute(allowedRoles)
  return <>{children}</>
}
