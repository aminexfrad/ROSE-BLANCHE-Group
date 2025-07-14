/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

import { z } from 'zod'

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Email validation schema
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(1, 'Email requis')
  .max(255, 'Email trop long')

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[0-9\s\-\(\)]{8,}$/, 'Numéro de téléphone invalide')

// CIN validation (Moroccan national ID)
export const cinSchema = z
  .string()
  .regex(/^[A-Z]{1,2}[0-9]{6}$/, 'CIN invalide')

// File validation
export const fileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, 'Fichier trop volumineux (max 10MB)'),
  type: z.string().refine(
    (type) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(type),
    'Type de fichier non autorisé'
  ),
})

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken
}

// XSS prevention
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (attempt.count >= this.maxAttempts) {
      return false
    }

    attempt.count++
    return true
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
})

export const contactSchema = z.object({
  nom: z.string().min(2, 'Nom requis').max(100, 'Nom trop long'),
  email: emailSchema,
  message: z.string().min(10, 'Message trop court').max(1000, 'Message trop long'),
})

export const applicationSchema = z.object({
  nom: z.string().min(2, 'Nom requis').max(100, 'Nom trop long'),
  prenom: z.string().min(2, 'Prénom requis').max(100, 'Prénom trop long'),
  email: emailSchema,
  telephone: phoneSchema,
  cin: cinSchema,
  institut: z.string().min(2, 'Institut requis').max(200, 'Institut trop long'),
  specialite: z.string().min(2, 'Spécialité requise').max(200, 'Spécialité trop longue'),
  typeStage: z.string().min(1, 'Type de stage requis'),
  niveau: z.string().min(1, 'Niveau requis'),
  pfeReference: z.string().optional(),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  stageBinome: z.boolean(),
  nomBinome: z.string().optional(),
  prenomBinome: z.string().optional(),
  emailBinome: emailSchema.optional(),
  telephoneBinome: phoneSchema.optional(),
  cinBinome: cinSchema.optional(),
})

// Environment variable validation
export const validateEnvironment = () => {
  const requiredEnvVars = ['NEXT_PUBLIC_API_URL']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}

// Security headers helper
export const getSecurityHeaders = () => ({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
}) 