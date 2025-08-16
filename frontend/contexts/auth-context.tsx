/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient, User, Candidat } from "@/lib/api"

interface AuthContextType {
  user: User | null
  candidat: Candidat | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginCandidat: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAuthenticated: () => boolean
  isCandidate: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [candidat, setCandidat] = useState<Candidat | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    return !!token
  }

  // Check if authenticated user is a candidate
  const isCandidate = () => {
    return !!candidat
  }

  // Load user from backend if token exists
  const refreshProfile = async () => {
    setLoading(true)
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('token')
      if (token && isAuthenticated()) {
        try {
          // First try to get regular user profile
          const profile = await apiClient.getProfile()
          setUser(profile)
          setCandidat(null)
        } catch (error: any) {
          // If regular profile fails, try candidate profile
          if (error.message?.includes('candidat') || error.message?.includes('403')) {
            try {
              const candidatProfile = await apiClient.getCandidatProfile()
              setCandidat(candidatProfile)
              setUser(null)
            } catch (candidatError: any) {
              // If both fail, clear everything
              console.error('Both profile attempts failed:', candidatError)
              setUser(null)
              setCandidat(null)
              throw candidatError
            }
          } else {
            throw error
          }
        }
      } else {
        setUser(null)
        setCandidat(null)
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          localStorage.removeItem('candidate_email')
        }
      }
    } catch (error: any) {
      console.error('Profile refresh error:', error)
      // If token is invalid, clear user state and redirect to main login
      if (error.message?.includes('jeton') || error.message?.includes('token') || error.message?.includes('401') || error.message?.includes('Session expirée')) {
        setUser(null)
        setCandidat(null)
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          localStorage.removeItem('candidate_email')
        }
        
        // Redirect to main login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
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
      const response = await apiClient.login(email, password)
      setUser(response.user)
      setCandidat(null)
    } catch (error) {
      setUser(null)
      setCandidat(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginCandidat = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await apiClient.loginCandidat(email, password)
      setCandidat(response.candidat)
      setUser(null)
      
      // Store candidate email for reference
      if (typeof window !== 'undefined') {
        localStorage.setItem('candidate_email', email)
      }
    } catch (error) {
      setUser(null)
      setCandidat(null)
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
      setCandidat(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      candidat, 
      loading, 
      login, 
      loginCandidat, 
      logout, 
      refreshProfile,
      isAuthenticated,
      isCandidate
    }}>
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
