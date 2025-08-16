/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient, Candidat } from "@/lib/api"

interface CandidateAuthContextType {
  candidat: Candidat | null
  loading: boolean
  loginCandidat: (email: string, password: string) => Promise<void>
  logoutCandidat: () => Promise<void>
  refreshCandidatProfile: () => Promise<void>
  isCandidateAuthenticated: () => boolean
}

const CandidateAuthContext = createContext<CandidateAuthContextType | undefined>(undefined)

export const CandidateAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [candidat, setCandidat] = useState<Candidat | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if candidate is authenticated
  const isCandidateAuthenticated = () => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    const candidateEmail = localStorage.getItem('candidate_email')
    return !!(token && candidateEmail)
  }

  // Load candidate from backend if token exists
  const refreshCandidatProfile = async () => {
    setLoading(true)
    try {
      // Check if we have a token and candidate email in localStorage
      const token = localStorage.getItem('token')
      const candidateEmail = localStorage.getItem('candidate_email')
      
      if (token && candidateEmail && isCandidateAuthenticated()) {
        const profile = await apiClient.getCandidatProfile()
        setCandidat(profile)
      } else {
        setCandidat(null)
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('candidate_email')
        }
      }
    } catch (error: any) {
      console.error('Candidate profile refresh error:', error)
      // If token is invalid, clear candidate state
      if (error.message?.includes('jeton') || error.message?.includes('token') || error.message?.includes('401') || error.message?.includes('Session expirée')) {
        setCandidat(null)
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('candidate_email')
        }
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCandidatProfile()
    // eslint-disable-next-line
  }, [])

  const loginCandidat = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await apiClient.loginCandidat(email, password)
      
      // Store tokens and candidate email
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access)
        localStorage.setItem('refreshToken', response.refresh)
        localStorage.setItem('candidate_email', email)
      }
      
      setCandidat(response.candidat)
    } catch (error) {
      setCandidat(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logoutCandidat = async () => {
    setLoading(true)
    try {
      // Clear all candidate-related data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('candidate_email')
      }
    } finally {
      setCandidat(null)
      setLoading(false)
    }
  }

  return (
    <CandidateAuthContext.Provider value={{ 
      candidat, 
      loading, 
      loginCandidat, 
      logoutCandidat, 
      refreshCandidatProfile,
      isCandidateAuthenticated 
    }}>
      {children}
    </CandidateAuthContext.Provider>
  )
}

export const useCandidateAuth = () => {
  const context = useContext(CandidateAuthContext)
  if (context === undefined) {
    throw new Error("useCandidateAuth must be used within a CandidateAuthProvider")
  }
  return context
}
