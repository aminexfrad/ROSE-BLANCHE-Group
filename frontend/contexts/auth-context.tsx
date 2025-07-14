/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient, User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from backend if token exists
  const refreshProfile = async () => {
    setLoading(true)
    try {
      // Only try to get profile if we have a token
      if (apiClient.isAuthenticated()) {
        const profile = await apiClient.getProfile()
        setUser(profile)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.error('Profile refresh error:', error)
      // If token is invalid, clear user state
      if (error.message?.includes('jeton') || error.message?.includes('token') || error.message?.includes('401')) {
        setUser(null)
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      await apiClient.login(email, password)
      const profile = await apiClient.getProfile()
      setUser(profile)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await apiClient.logout()
    } finally {
      setUser(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
