/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

// API Client for StageBloom Backend
import { validateEnvironment, sanitizeInput } from './security'
import { api as apiConfig, isProduction } from './env'
import { apiCache, cachedFetch, createDebouncedAPI } from './api-cache'

// Validate environment variables only on client side
if (typeof window !== 'undefined') {
  validateEnvironment()
}

// Use direct backend URL instead of proxy
const API_BASE_URL = 'http://localhost:8000/api'

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>()

// Performance monitoring
const performanceMetrics = {
  requestCount: 0,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  averageResponseTime: 0,
  totalResponseTime: 0,
}

export interface Entreprise {
  id: number
  nom: string
  description?: string
  secteur_activite?: string
  adresse?: string
  ville?: string
  pays: string
  telephone?: string
  email?: string
  site_web?: string
  logo?: string
  is_active: boolean
  nombre_stagiaires: number
  nombre_rh: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  nom: string
  prenom: string
  role: 'stagiaire' | 'tuteur' | 'rh' | 'admin'
  telephone?: string
  departement?: string
  institut?: string
  specialite?: string
  bio?: string
  avatar?: string
  entreprise?: Entreprise
  date_joined: string
}

export interface Application {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  institut: string
  specialite: string
  type_stage: string
  niveau: string
  pfe_reference?: string
  date_debut: string
  date_fin: string
  stage_binome: boolean
  nom_binome?: string
  prenom_binome?: string
  email_binome?: string
  telephone_binome?: string
  cv?: string
  lettre_motivation?: string
  demande_stage?: string
  cv_binome?: string
  lettre_motivation_binome?: string
  demande_stage_binome?: string
  status: 'pending' | 'approved' | 'rejected'
  entreprise?: Entreprise
  created_at: string
  updated_at: string
  offres?: { id: number; reference: string; title: string }[]
}

export interface Stage {
  id: number;
  title: string;
  company_entreprise?: Entreprise;
  company_name?: string;
  company?: string; // Keep for backward compatibility
  location: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  progress?: number;
  stagiaire: User;
  stagiaire_name?: string;
  tuteur?: User;
  duration_days: number;
  days_remaining: number;
  created_at: string;
  // Add other fields as needed
}

export interface Step {
  id: number
  title: string
  description?: string
  order: number
  status: 'pending' | 'in_progress' | 'completed' | 'validated' | 'rejected'
  due_date?: string
  completed_date?: string
  validated_date?: string
  tuteur_feedback?: string
  stagiaire_comment?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  title: string
  description?: string
  document_type: 'rapport' | 'fiche_suivi' | 'pfe' | 'presentation' | 'other'
  file_url?: string
  file_size?: number
  is_approved: boolean
  feedback?: string
  uploaded_by: User
  approved_by?: User
  approved_at?: string
  created_at: string
}

export interface Evaluation {
  id: number
  evaluation_type: 'stagiaire_self' | 'tuteur_stagiaire' | 'stagiaire_tuteur' | 'rh_global'
  scores: Record<string, number>
  comments?: string
  overall_score?: number
  is_completed: boolean
  completed_at?: string
  evaluator: User
  evaluated: User
  created_at: string
}

export interface Testimonial {
  id: number
  title: string
  content: string
  testimonial_type: 'text' | 'video'
  video_url?: string
  video_file?: string
  status: 'pending' | 'approved' | 'rejected'
  author: User
  stage: Stage
  moderated_by?: User
  moderated_at?: string
  moderation_comment?: string
  created_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  notification_type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface PFEDocument {
  id: number
  title: string
  description?: string
  authors: string
  year: number
  speciality: string
  supervisor?: string
  keywords?: string
  abstract?: string
  status: 'draft' | 'published' | 'archived'
  download_count: number
  view_count: number
  created_at: string
}

export interface PFEProject {
  id: number
  title: string
  description: string
  authors: string
  year: number
  speciality: string
  supervisor?: string
  keywords?: string
  abstract?: string
  status: 'draft' | 'published' | 'archived'
  download_count: number
  view_count: number
  created_at: string
}

export interface PFEReport {
  id: number;
  title: string;
  abstract: string;
  keywords: string;
  speciality: string;
  year: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'archived';
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  version: number;
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  tuteur_feedback: string;
  stagiaire_comment: string;
  rejection_reason: string;
  pdf_file: string;
  presentation_file: string | null;
  additional_files: string | null;
  stagiaire: User;
  tuteur: User | null;
}


export interface OffreStage {
  id: number
  reference: string
  title: string
  description: string
  objectives: string
  keywords: string
  diplome: string
  specialite: string
  nombre_postes: number
  ville: string
  entreprise?: Entreprise
  status: 'open' | 'closed' | 'draft' | 'expired'
  type: 'Classique' | 'PFE'
  validated: boolean
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  total_users: number
  total_applications: number
  total_stages: number
  recent_applications: number
  active_stages: number
  completed_stages: number
  avg_progression: number
  current_progression: number
  status_stats: Array<{ status: string; count: number }>
  role_stats: Array<{ role: string; count: number }>
}

export interface Demande {
  id: number;
  prenom: string;
  nom: string;
  poste: string;
  created_at: string;
  status: string;
  // Add other fields as needed
}

export interface Stagiaire extends User {
  // Add any stagiaire-specific fields here if needed
}

class ApiClient {
  private token: string | null = null

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Enhanced request method with caching and deduplication
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheOptions?: { ttl?: number; skipCache?: boolean }
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`
    
    // Check for pending requests to avoid duplicates
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey) as Promise<T>
    }
    
    // Try cache first for GET requests
    if (options.method === 'GET' && !cacheOptions?.skipCache) {
      const cached = apiCache.get<T>(url, options)
      if (cached) {
        performanceMetrics.cacheHits++
        return cached
      }
    }
    
    const startTime = performance.now()
    
    // Create the request promise
    const requestPromise = this.executeRequest<T>(url, options, cacheOptions)
    
    // Store the promise to prevent duplicate requests
    pendingRequests.set(requestKey, requestPromise)
    
    try {
      const result = await requestPromise
      
      // Update performance metrics
      const responseTime = performance.now() - startTime
      performanceMetrics.requestCount++
      performanceMetrics.totalResponseTime += responseTime
      performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.requestCount
      
      return result
    } finally {
      // Clean up pending request
      pendingRequests.delete(requestKey)
    }
  }

  // Separate method for actual request execution
  private async executeRequest<T>(
    url: string,
    options: RequestInit = {},
    cacheOptions?: { ttl?: number; skipCache?: boolean }
  ): Promise<T> {
    const controller = new AbortController()
    const REQUEST_TIMEOUT = apiConfig.timeout

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, REQUEST_TIMEOUT)

    // Don't set Content-Type for FormData, let browser set it automatically
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    }
    
    // Add custom headers if provided
    if (options.headers) {
      Object.assign(headers, options.headers)
    }
    
    // Only set Content-Type to application/json if not sending FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    }

    // Add auth token if available
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Update performance metrics
      performanceMetrics.totalRequests++
      if (response.ok) {
        performanceMetrics.successfulRequests++
      } else {
        performanceMetrics.failedRequests++
      }
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.token && typeof window !== 'undefined') {
        // Store the original response text before attempting refresh
        const originalResponseText = await response.text();
        let originalErrorData;
        try {
          originalErrorData = originalResponseText ? JSON.parse(originalResponseText) : {};
        } catch {
          originalErrorData = {};
        }
        
        try {
          await this.refreshToken()
          // Retry the request with new token
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${this.token}`,
          }
          const retryResponse = await fetch(url, config)
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}))
            throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${retryResponse.status}`)
          }
          
          const result = await retryResponse.json()
          
          // Cache successful GET requests
          if (options.method === 'GET' && !cacheOptions?.skipCache) {
            apiCache.set(url, result, options, cacheOptions?.ttl)
          }
          
          return result
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw original error
          this.token = null
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          
          // Handle specific error cases for the original response
          if (originalErrorData.error === 'No active internship found') {
            throw new Error('Aucun stage actif trouvé. Veuillez contacter votre administrateur.');
          }
          
          // Handle validation errors
          if (originalErrorData.email) {
            throw new Error(`Erreur de validation email: ${originalErrorData.email.join(', ')}`);
          }
          if (originalErrorData.password) {
            throw new Error(`Erreur de validation mot de passe: ${originalErrorData.password.join(', ')}`);
          }
          if (originalErrorData.non_field_errors) {
            throw new Error(originalErrorData.non_field_errors.join(', '));
          }
          if (originalErrorData.detail) {
            throw new Error(originalErrorData.detail);
          }
          
          // Default error message
          throw new Error(originalErrorData.detail || originalErrorData.message || originalErrorData.error || `Erreur HTTP ${response.status}`);
        }
      }

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch {
          errorData = {};
        }
        
        // Handle specific error cases
        if (response.status === 404 && errorData.error === 'No active internship found') {
          throw new Error('Aucun stage actif trouvé. Veuillez contacter votre administrateur.');
        }
        
        if (response.status === 400) {
          // Handle validation errors
          if (errorData.email) {
            throw new Error(`Erreur de validation email: ${errorData.email.join(', ')}`);
          }
          if (errorData.password) {
            throw new Error(`Erreur de validation mot de passe: ${errorData.password.join(', ')}`);
          }
          if (errorData.non_field_errors) {
            throw new Error(errorData.non_field_errors.join(', '));
          }
          if (errorData.detail) {
            throw new Error(errorData.detail);
          }
        }
        
        if (response.status === 401) {
          // Try to refresh token if we have one
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              await this.refreshToken()
              // Retry the original request with new token
              const retryResponse = await fetch(url, {
                ...config,
                headers: {
                  ...config.headers,
                  'Authorization': `Bearer ${this.token}`,
                },
                signal: controller.signal,
              })
              
              if (retryResponse.ok) {
                const text = await retryResponse.text()
                let result: T
                try {
                  result = text ? JSON.parse(text) : ({} as T)
                } catch {
                  result = {} as T
                }
                return result
              }
            } catch (refreshError) {
              // If refresh fails, logout and throw original error
              this.logout()
            }
          }
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        if (response.status === 403) {
          throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        }
        
        if (response.status === 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }
        
        // Default error message
        throw new Error(errorData.detail || errorData.message || errorData.error || `Erreur HTTP ${response.status}`);
      }

      const text = await response.text();
      let result: T;
      try {
        result = text ? JSON.parse(text) : ({} as T);
      } catch {
        result = {} as T;
      }
      
      // Cache successful GET requests
      if (options.method === 'GET' && !cacheOptions?.skipCache) {
        apiCache.set(url, result, options, cacheOptions?.ttl)
      }
      
      return result
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé. Veuillez réessayer.')
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw new Error('Erreur réseau. Veuillez vérifier votre connexion.')
      }
      
      console.error('API request failed:', error)
      throw error
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...performanceMetrics,
      cacheStats: apiCache.getStats(),
    }
  }

  // Clear cache
  clearCache() {
    apiCache.clear()
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    try {
      const response = await this.request<{
        access: string
        refresh: string
        user: User
      }>('/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, { skipCache: true })

      // Store tokens
      this.token = response.access
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access)
        localStorage.setItem('refreshToken', response.refresh)
        localStorage.setItem('user', JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          await this.request('/auth/logout/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          }, { skipCache: true })
        } catch (backendError) {
          // If backend logout fails, just log it but don't throw
          console.warn('Backend logout failed, but continuing with local cleanup:', backendError)
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear all stored data regardless of backend response
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token') // Also clear the old key
      }
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await this.request<{ access: string }>('/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }, { skipCache: true })

      // Update stored token
      this.token = response.access
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access)
      }

      return response
    } catch (error) {
      // Clear invalid tokens
      this.logout()
      throw error
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    return !!token
  }

  // User profile methods with caching
  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/', {}, { ttl: 2 * 60 * 1000 }) // Cache for 2 minutes
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.request<User>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { skipCache: true })
    
    // Invalidate profile cache
    apiCache.delete('/auth/profile/')
    
    return response
  }

  async changePassword(data: { old_password: string; new_password: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, { skipCache: true })
  }

  // Application methods
  async createApplication(formData: FormData): Promise<Application> {
    console.log('API Client - FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }
    
    const response = await fetch(`${API_BASE_URL}/demandes/create/`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Full error response:', errorData)
        
        // Handle different error response formats
        if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === 'object') {
          // Handle validation errors
          const validationErrors = []
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              validationErrors.push(`${field}: ${errors.join(', ')}`)
            } else if (typeof errors === 'string') {
              validationErrors.push(`${field}: ${errors}`)
            }
          }
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join('; ')
          }
        }
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage
      }
      console.error('API Error Response:', errorMessage)
      console.error('Response Status:', response.status)
      throw new Error(errorMessage)
    }
    
    return response.json()
  }

  async getApplications(params: { limit?: number; status?: string } = {}): Promise<{ results: Application[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    
    return this.request<{ results: Application[]; count: number }>(`/demandes/?${queryParams}`)
  }

  async getApplication(id: number): Promise<Application> {
    return this.request<Application>(`/demandes/${id}/`)
  }

  async approveApplication(id: number): Promise<Application> {
    return this.request<Application>(`/demandes/${id}/approve/`, { method: 'POST' })
  }

  async rejectApplication(id: number, reason?: string): Promise<Application> {
    return this.request<Application>(`/demandes/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', raison: reason }),
    })
  }

  async updateDemandeOffreStatus(demandeId: number, offreId: number, status: 'accepted' | 'rejected'): Promise<any> {
    return this.request<any>(`/demandes/stage/${demandeId}/offre/${offreId}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    return this.request<{ stats: DashboardStats }>('/stats/')
  }

  // Stage methods
  async getStages(params: { tuteur?: number } = {}): Promise<{ results: Stage[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.tuteur) queryParams.append('tuteur', params.tuteur.toString())
    
    return this.request<{ results: Stage[]; count: number }>(`/stages/?${queryParams}`)
  }

  async getStage(id: number): Promise<Stage> {
    return this.request<Stage>(`/stages/${id}/`)
  }

  // Stagiaire-specific methods
  async getMyInternship(): Promise<Stage> {
    return this.request<Stage>('/stagiaire/internship/')
  }

  async getMyInternshipSteps(): Promise<{ internship: Stage; steps: Step[] }> {
    return this.request<{ internship: Stage; steps: Step[] }>('/stagiaire/internship/steps/')
  }

  async getMyInternshipDocuments(): Promise<{ internship: Stage; documents: Document[] }> {
    return this.request<{ internship: Stage; documents: Document[] }>('/stagiaire/internship/documents/')
  }

  async getMyInternshipEvaluations(): Promise<{ internship: Stage; evaluations: Evaluation[] }> {
    return this.request<{ internship: Stage; evaluations: Evaluation[] }>('/stagiaire/internship/evaluations/')
  }

  async getMyInternshipTestimonials(): Promise<{ internship: Stage; testimonials: Testimonial[] }> {
    return this.request<{ internship: Stage; testimonials: Testimonial[] }>('/stagiaire/internship/testimonials/')
  }

  async getMyNotifications(): Promise<{ notifications: Notification[] }> {
    return this.request<{ notifications: Notification[] }>('/stagiaire/internship/notifications/')
  }

  // Step methods
  async getSteps(params: { stage?: number } = {}): Promise<{ results: Step[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.stage) queryParams.append('stage', params.stage.toString())
    
    return this.request<{ results: Step[]; count: number }>(`/steps/?${queryParams}`)
  }

  async getStep(id: number): Promise<Step> {
    return this.request<Step>(`/steps/${id}/`)
  }

  async updateStep(id: number, data: Partial<Step>): Promise<Step> {
    return this.request<Step>(`/steps/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Document methods
  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = text ? JSON.parse(text) : {};
      } catch {
        errorData = {};
      }
      
      // Handle specific error cases
      if (response.status === 404 && errorData.error === 'No active internship found') {
        throw new Error('Aucun stage actif trouvé. Veuillez contacter votre administrateur.');
      }
      
      if (response.status === 400) {
        // Handle validation errors
        if (errorData.email) {
          throw new Error(`Erreur de validation email: ${errorData.email.join(', ')}`);
        }
        if (errorData.password) {
          throw new Error(`Erreur de validation mot de passe: ${errorData.password.join(', ')}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors.join(', '));
        }
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
      }
      
      if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (response.status === 403) {
        throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      }
      
      if (response.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      // Default error message
      throw new Error(errorData.detail || errorData.message || errorData.error || `Erreur HTTP ${response.status}`);
    }
    
    return response.json()
  }

  async getDocuments(params: { stage?: number; document_type?: string } = {}): Promise<{ results: Document[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.stage) queryParams.append('stage', params.stage.toString())
    if (params.document_type) queryParams.append('document_type', params.document_type)
    
    return this.request<{ results: Document[]; count: number }>(`/documents/?${queryParams}`)
  }

  async getDocument(id: number): Promise<Document> {
    return this.request<Document>(`/documents/${id}/`)
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download/`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return response.blob()
  }

  // Evaluation methods
  async getEvaluations(params: { stage?: number; evaluation_type?: string } = {}): Promise<{ results: Evaluation[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.stage) queryParams.append('stage', params.stage.toString())
    if (params.evaluation_type) queryParams.append('evaluation_type', params.evaluation_type)
    
    return this.request<{ results: Evaluation[]; count: number }>(`/evaluations/?${queryParams}`)
  }

  async createEvaluation(data: Partial<Evaluation>): Promise<Evaluation> {
    return this.request<Evaluation>('/evaluations/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // KPI methods
  async getKPIQuestions(params: { category?: string } = {}): Promise<{ results: any[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.append('category', params.category)
    
    return this.request<{ results: any[]; count: number }>(`/kpi-questions/?${queryParams}`)
  }

  async getKPIs(): Promise<{ results: any[]; count: number }> {
    return this.request<{ results: any[]; count: number }>('/kpis/')
  }

  // Testimonial methods
  async getTestimonials(params: { status?: string; testimonial_type?: string } = {}): Promise<{ results: Testimonial[]; count: number }> {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.append('status', params.status)
    if (params.testimonial_type) searchParams.append('testimonial_type', params.testimonial_type)
    
    const response = await this.request<{ results: Testimonial[]; count: number }>(`/testimonials/?${searchParams}`)
    return response
  }

  async getPublicTestimonials(params: { testimonial_type?: string } = {}): Promise<{ results: Testimonial[]; count: number }> {
    const searchParams = new URLSearchParams()
    if (params.testimonial_type) searchParams.append('testimonial_type', params.testimonial_type)
    
    const response = await this.request<{ results: Testimonial[]; count: number }>(`/public/testimonials/?${searchParams}`)
    return response
  }

  async createTestimonial(formData: FormData): Promise<Testimonial> {
    const response = await this.request<Testimonial>('/testimonials/create/', {
      method: 'POST',
      body: formData,
    })
    return response
  }

  async updateTestimonial(id: number, formData: FormData): Promise<Testimonial> {
    const response = await this.request<Testimonial>(`/testimonials/${id}/update/`, {
      method: 'PUT',
      body: formData,
    })
    return response
  }

  async moderateTestimonial(id: number, action: 'approve' | 'reject', comment?: string): Promise<Testimonial> {
    return this.request<Testimonial>(`/testimonials/${id}/moderate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        action: action,
        comment: comment 
      }),
    })
  }

  // Notification methods
  async getNotifications(): Promise<{ results: Notification[]; count: number }> {
    return this.request<{ results: Notification[]; count: number }>('/notifications/')
  }

  async markNotificationAsRead(id: number): Promise<void> {
    return this.request<void>(`/notifications/${id}/read/`, { method: 'POST' })
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/notifications/mark-all-read/', { method: 'POST' })
  }

  // PFE Document methods
  async getPFEDocuments(params: { status?: string; year?: number; speciality?: string } = {}): Promise<{ results: PFEDocument[]; count: number }> {
    // Use public endpoint for PFE documents
    return this.getPublicPFEDocuments(params)
  }

  // Public method for getting PFE documents without authentication
  async getPublicPFEDocuments(params: { status?: string; year?: number; speciality?: string } = {}): Promise<{ results: PFEDocument[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.year) queryParams.append('year', params.year.toString())
    if (params.speciality) queryParams.append('speciality', params.speciality)
    
    const url = `${API_BASE_URL}/pfe-documents/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Public PFE Documents API request failed:', error)
      throw error
    }
  }

  // PFE Report methods
  async getPfeReports(params: { status?: string; year?: number; speciality?: string } = {}): Promise<{ results: PFEReport[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.year) queryParams.append('year', params.year.toString())
    if (params.speciality) queryParams.append('speciality', params.speciality)
    
    return this.request<{ results: PFEReport[]; count: number }>(`/pfe-reports/?${queryParams}`)
  }

  async getPfeReport(id: number): Promise<PFEReport> {
    return this.request<PFEReport>(`/pfe-reports/${id}/`)
  }

  async createPfeReport(formData: FormData): Promise<PFEReport> {
    const response = await fetch(`${API_BASE_URL}/pfe-reports/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async updatePfeReport(id: number, formData: FormData): Promise<PFEReport> {
    const response = await fetch(`${API_BASE_URL}/pfe-reports/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async submitPfeReport(id: number): Promise<PFEReport> {
    return this.request<PFEReport>(`/pfe-reports/${id}/submit/`, { method: 'POST' })
  }

  async validatePfeReport(id: number, action: 'approve' | 'reject', feedback?: string): Promise<PFEReport> {
    return this.request<PFEReport>(`/pfe-reports/${id}/validate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        action,
        feedback 
      }),
    })
  }

  async archivePfeReport(id: number): Promise<PFEReport> {
    return this.request<PFEReport>(`/pfe-reports/${id}/archive/`, { method: 'POST' })
  }

  async downloadPFEReport(id: number): Promise<{ download_url: string; filename: string }> {
    const response = await fetch(`${API_BASE_URL}/pfe-reports/${id}/download/`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  // Tuteur methods
  async getTuteurStages(): Promise<{ results: Stage[]; count: number }> {
    return this.request<{ results: Stage[]; count: number }>('/tuteur/stagiaires/')
  }

  async getTuteurEvaluations(): Promise<{ results: Evaluation[]; count: number }> {
    return this.request<{ results: Evaluation[]; count: number }>('/tuteur/evaluations/')
  }

  async getTuteurStatistics(): Promise<any> {
    return this.request<any>('/tuteur/statistiques/')
  }

  // RH methods
  async getRHTestimonials(): Promise<{ results: Testimonial[]; count: number }> {
    return this.request<{ results: Testimonial[]; count: number }>('/rh/testimonials/')
  }

  async moderateRHTestimonial(id: number, action: 'approve' | 'reject', comment?: string): Promise<Testimonial> {
    return this.request<Testimonial>(`/rh/testimonials/${id}/moderate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        action: action,
        comment: comment 
      }),
    })
  }

  async getRHKPIGlobaux(): Promise<any> {
    return this.request<any>('/rh/kpi-globaux/')
  }

  async triggerKPISurvey(): Promise<any> {
    return this.request<any>('/rh/kpi-globaux/', { method: 'POST' })
  }

  async creerStagiaire(formData: FormData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/rh/creer-stagiaire/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  // Admin methods
  async getUsers(params: { limit?: number; role?: string } = {}): Promise<{ results: User[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.role) queryParams.append('role', params.role)
    
    return this.request<{ results: User[]; count: number }>(`/admin/users/?${queryParams}`)
  }

  async createUser(formData: FormData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async updateUser(id: number, formData: FormData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/admin/users/${id}/delete/`, { method: 'DELETE' })
  }

  async getAdminDatabaseStats(): Promise<any> {
    return this.request<any>('/admin/database/stats/')
  }

  async postAdminDatabaseBackup(): Promise<any> {
    return this.request<any>('/admin/database/backup/', { method: 'POST' })
  }

  // Offre Stage management methods
  async createOffreStage(formData: FormData): Promise<OffreStage> {
    const response = await fetch(`${API_BASE_URL}/admin/offres-stage/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async updateOffreStage(id: number, formData: FormData): Promise<OffreStage> {
    const response = await fetch(`${API_BASE_URL}/admin/offres-stage/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async deleteOffreStage(id: number): Promise<void> {
    return this.request<void>(`/admin/offres-stage/${id}/delete/`, { method: 'DELETE' })
  }

  // Alias methods for consistency
  async getDemandes(params: { limit?: number; status?: string } = {}): Promise<{ results: Application[]; count: number }> {
    return this.getApplications(params)
  }

  async getStagiaires(): Promise<{ results: User[]; count: number }> {
    return this.getRHStagiaires()
  }

  async getPFEDocument(id: number): Promise<PFEDocument> {
    return this.request<PFEDocument>(`/pfe-documents/${id}/`)
  }

  async createPFEDocument(formData: FormData): Promise<PFEDocument> {
    const response = await fetch(`${API_BASE_URL}/pfe-documents/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  // Entreprise methods
  async getEntreprises(): Promise<Entreprise[]> {
    return this.request<Entreprise[]>('/entreprises/')
  }

  async getEntreprise(id: number): Promise<Entreprise> {
    return this.request<Entreprise>(`/entreprises/${id}/`)
  }

  async getEntrepriseStages(id: number): Promise<Stage[]> {
    return this.request<Stage[]>(`/entreprises/${id}/stages/`)
  }

  async getEntrepriseOffres(id: number): Promise<OffreStage[]> {
    return this.request<OffreStage[]>(`/entreprises/${id}/offres/`)
  }

  // Company-specific demandes
  async getEntrepriseDemandes(entrepriseId: number): Promise<Application[]> {
    return this.request<Application[]>(`/demandes/?entreprise=${entrepriseId}`)
  }

  // Get demandes for current user's company (RH users)
  async getMyCompanyDemandes(): Promise<Application[]> {
    return this.request<Application[]>('/demandes/')
  }

  // Offre Stage methods
  async getOffresStage(params: { status?: string; type?: string } = {}): Promise<{ results: OffreStage[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.type) queryParams.append('type', params.type)
    
    return this.request<{ results: OffreStage[]; count: number }>(`/offres-stage/?${queryParams}`)
  }

  async getOffreStage(id: number): Promise<OffreStage> {
    return this.request<OffreStage>(`/offres-stage/${id}/`)
  }

  // RH methods
  async getRHStagiaires(): Promise<{ results: User[]; count: number }> {
    return this.request<{ results: User[]; count: number }>('/rh/stagiaires/')
  }

  async getRHStages(): Promise<{ results: Stage[]; count: number }> {
    return this.request<{ results: Stage[]; count: number }>('/rh/stages/')
  }

  async getRHTuteursDisponibles(): Promise<{ results: any[]; count: number }> {
    return this.request<{ results: any[]; count: number }>('/rh/tuteurs-disponibles/')
  }

  async assignerTuteur(stagiaireId: number, tuteurId: number): Promise<any> {
    return this.request<any>(`/rh/stagiaires/${stagiaireId}/assigner-tuteur/`, {
      method: 'POST',
      body: JSON.stringify({ tuteur_id: tuteurId }),
    })
  }

  async createStageForStagiaire(stagiaireId: number, stageData: {
    title: string;
    description?: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
  }): Promise<any> {
    return this.request<any>(`/rh/stagiaires/${stagiaireId}/create-stage/`, {
      method: 'POST',
      body: JSON.stringify(stageData),
    })
  }

  // RH Survey Management
  async getRHSurveys() {
    return this.executeRequest('/api/rh/surveys/', 'GET');
  }

  async createRHSurvey(surveyData: any) {
    return this.executeRequest('/api/rh/surveys/', 'POST', surveyData);
  }

  async getRHSurveyDetail(surveyId: number) {
    return this.executeRequest(`/api/rh/surveys/${surveyId}/`, 'GET');
  }

  async updateRHSurvey(surveyId: number, surveyData: any) {
    return this.executeRequest(`/api/rh/surveys/${surveyId}/`, 'PUT', surveyData);
  }

  async deleteRHSurvey(surveyId: number) {
    return this.executeRequest(`/api/rh/surveys/${surveyId}/`, 'DELETE');
  }

  async performRHSurveyAction(surveyId: number, action: string) {
    return this.executeRequest(`/api/rh/surveys/${surveyId}/action/`, 'POST', { action });
  }

  async getRHSurveyAnalysis() {
    return this.executeRequest('/api/rh/surveys/analysis/', 'GET');
  }

  // Stagiaire Survey Management
  async getStagiaireSurveys() {
    return this.executeRequest('/api/stagiaire/surveys/', 'GET');
  }

  async getStagiaireSurveyDetail(surveyId: number) {
    return this.executeRequest(`/api/stagiaire/surveys/${surveyId}/`, 'GET');
  }

  async submitStagiaireSurveyResponse(surveyId: number, responseData: any) {
    return this.executeRequest(`/api/stagiaire/surveys/${surveyId}/respond/`, 'POST', responseData);
  }

  async getStagiaireSurveyHistory() {
    return this.executeRequest('/api/stagiaire/surveys/history/', 'GET');
  }
}

export const apiClient = new ApiClient()