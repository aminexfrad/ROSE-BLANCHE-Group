// API Client for StageBloom Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
  date_joined: string
}

export interface Application {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  cin: string
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
  cin_binome?: string
  cv?: string
  lettre_motivation?: string
  demande_stage?: string
  cv_binome?: string
  lettre_motivation_binome?: string
  demande_stage_binome?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Stage {
  id: number;
  title: string;
  company: string;
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
  reference_id: string
  title: string
  description: string
  objectives: string
  keywords: string
  diplome: string
  specialite: string
  nombre_postes: number
  ville: string
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
      const response = await fetch(url, config)
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.token && typeof window !== 'undefined') {
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
            throw new Error(errorData.detail || errorData.message || `HTTP ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw original error
          this.token = null
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    const response = await this.request<{ access: string; refresh: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.token = response.access
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
    }
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout/', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) throw new Error('No refresh token available')
    
    const response = await this.request<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    })
    
    this.token = response.access
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.access)
    }
    
    return response
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // User profile methods
  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/')
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Application methods
  async createApplication(formData: FormData): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/demandes/create/`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', errorData)
      console.error('Response Status:', response.status)
      throw new Error(errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}`)
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
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
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.testimonial_type) queryParams.append('testimonial_type', params.testimonial_type)
    
    return this.request<{ results: Testimonial[]; count: number }>(`/testimonials/?${queryParams}`)
  }

  async createTestimonial(formData: FormData): Promise<Testimonial> {
    const response = await fetch(`${API_BASE_URL}/testimonials/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  async moderateTestimonial(id: number, action: 'approve' | 'reject', comment?: string): Promise<Testimonial> {
    return this.request<Testimonial>(`/testimonials/${id}/moderate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        status: action === 'approve' ? 'approved' : 'rejected',
        moderation_comment: comment 
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
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Public PFE Documents API request failed:', error)
      throw error
    }
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
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  // Tuteur-specific methods
  async getTuteurStages(): Promise<{ results: Stage[]; count: number }> {
    return this.request<{ results: Stage[]; count: number }>('/tuteur/stages/')
  }

  async getTuteurStageDetail(stageId: number): Promise<{ stage: Stage; student: User; steps: Step[] }> {
    return this.request<{ stage: Stage; student: User; steps: Step[] }>(`/tuteur/stages/${stageId}/`)
  }

  async validateStep(stepId: number, action: 'validate' | 'reject', feedback?: string): Promise<any> {
    const endpoint = action === 'validate' ? 'validate' : 'reject'
    return this.request<any>(`/tuteur/steps/${stepId}/${endpoint}/`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  async getTuteurEvaluations(): Promise<{ results: Evaluation[]; count: number }> {
    return this.request<{ results: Evaluation[]; count: number }>('/tuteur/evaluations/')
  }

  async createTuteurEvaluation(data: any): Promise<any> {
    return this.request<any>('/tuteur/evaluations/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTuteurDocuments(): Promise<{ results: Document[]; count: number }> {
    return this.request<{ results: Document[]; count: number }>('/tuteur/documents/')
  }

  async approveDocument(docId: number, action: 'approve' | 'reject', feedback?: string): Promise<any> {
    const endpoint = action === 'approve' ? 'approve' : 'reject'
    return this.request<any>(`/tuteur/documents/${docId}/${endpoint}/`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  async getTuteurNotifications(): Promise<{ results: Notification[]; count: number }> {
    return this.request<{ results: Notification[]; count: number }>('/tuteur/notifications/')
  }

  // RH-specific methods
  async getRHStagiaires(): Promise<{ results: User[]; count: number }> {
    return this.request<{ results: User[]; count: number }>('/rh/stagiaires/')
  }

  async getRHStagiaireDetail(stagiaireId: number): Promise<{ stagiaire: User; stages: Stage[] }> {
    return this.request<{ stagiaire: User; stages: Stage[] }>(`/rh/stagiaires/${stagiaireId}/`)
  }

  async getRHTestimonials(): Promise<{ results: Testimonial[]; count: number }> {
    return this.request<{ results: Testimonial[]; count: number }>('/rh/testimonials/')
  }

  async moderateRHTestimonial(testimonialId: number, action: 'approve' | 'reject', comment?: string): Promise<Testimonial> {
    return this.request<Testimonial>(`/rh/testimonials/${testimonialId}/moderate/`, {
      method: 'PUT',
      body: JSON.stringify({ 
        status: action === 'approve' ? 'approved' : 'rejected',
        moderation_comment: comment 
      }),
    })
  }

  async getRHKPIGlobaux(): Promise<any> {
    return this.request<any>('/rh/kpi-globaux/')
  }

  async getRHStages(): Promise<{ results: Stage[]; count: number }> {
    return this.request<{ results: Stage[]; count: number }>('/rh/stages/')
  }

  async getRHStageDetail(stageId: number): Promise<any> {
    return this.request<any>(`/rh/stages/${stageId}/`)
  }

  async getRHEvaluations(): Promise<{ results: Evaluation[]; count: number }> {
    return this.request<{ results: Evaluation[]; count: number }>('/rh/evaluations/')
  }

  async getRHNotifications(): Promise<{ results: Notification[]; count: number }> {
    return this.request<{ results: Notification[]; count: number }>('/rh/notifications/')
  }

  async getRHReports(reportType?: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (reportType) queryParams.append('type', reportType)
    
    return this.request<any>(`/rh/rapports/?${queryParams}`)
  }

  // Admin-specific methods
  async getUsers(params: { limit?: number; role?: string } = {}): Promise<{ results: User[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.role) queryParams.append('role', params.role)
    
    return this.request<{ results: User[]; count: number }>(`/users/?${queryParams}`)
  }

  async getStagiaires(params: { limit?: number } = {}): Promise<{ results: Stagiaire[]; count: number }> {
    const url = new URL(`${API_BASE_URL}/users/`);
    url.searchParams.append('role', 'stagiaire');
    if (params.limit) url.searchParams.append('limit', params.limit.toString());
    return this.request<{ results: Stagiaire[]; count: number }>(url.toString());
  }

  // OffreStage methods
  async getOffresStage(params: { 
    search?: string; 
    specialite?: string; 
    niveau?: string; 
    localisation?: string; 
    featured?: boolean 
  } = {}): Promise<{ results: any[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.specialite) queryParams.append('specialite', params.specialite)
    if (params.niveau) queryParams.append('niveau', params.niveau)
    if (params.localisation) queryParams.append('localisation', params.localisation)
    if (params.featured) queryParams.append('featured', 'true')
    
    // Use public endpoint for stage offers
    return this.getPublicOffresStage(params)
  }

  // Public method for getting stage offers without authentication
  async getPublicOffresStage(params: { 
    search?: string; 
    specialite?: string; 
    niveau?: string; 
    localisation?: string; 
    featured?: boolean 
  } = {}): Promise<{ results: any[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.specialite) queryParams.append('specialite', params.specialite)
    if (params.niveau) queryParams.append('niveau', params.niveau)
    if (params.localisation) queryParams.append('localisation', params.localisation)
    if (params.featured) queryParams.append('featured', 'true')
    
    const url = `${API_BASE_URL}/offres-stage/?${queryParams}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Public API request failed:', error)
      throw error
    }
  }

  async getOffreStage(id: number): Promise<any> {
    return this.request<any>(`/offres-stage/${id}/`)
  }

  async applyToOffreStage(id: number): Promise<any> {
    return this.request<any>(`/offres-stage/${id}/apply/`, { method: 'POST' })
  }

  async createOffreStage(data: any): Promise<any> {
    return this.request<any>('/offres-stage/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOffreStage(id: number, data: any): Promise<any> {
    return this.request<any>(`/offres-stage/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteOffreStage(id: number): Promise<void> {
    return this.request<void>(`/offres-stage/${id}/delete/`, { method: 'DELETE' })
  }

  // PFE Projects API
  async getPFEProjects(params: { 
    domain?: string; 
    status?: string; 
    academic_year?: string; 
    search?: string; 
    featured?: boolean 
  } = {}): Promise<{ results: PFEProject[]; count: number }> {
    // Use public endpoint for PFE projects
    return this.getPublicPFEProjects(params)
  }

  // Public method for getting PFE projects without authentication
  async getPublicPFEProjects(params: { 
    domain?: string; 
    status?: string; 
    academic_year?: string; 
    search?: string; 
    featured?: boolean 
  } = {}): Promise<{ results: PFEProject[]; count: number }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const url = `${API_BASE_URL}/pfe-projects/${queryString ? `?${queryString}` : ''}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Public PFE API request failed:', error)
      throw error
    }
  }

  async getPFEProject(id: number): Promise<PFEProject> {
    return this.request(`/pfe-projects/${id}/`)
  }

  async createPFEProject(data: Partial<PFEProject>): Promise<PFEProject> {
    return this.request('/pfe-projects/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async updatePFEProject(id: number, data: Partial<PFEProject>): Promise<PFEProject> {
    return this.request(`/pfe-projects/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async deletePFEProject(id: number): Promise<void> {
    return this.request(`/pfe-projects/${id}/delete/`, { method: 'DELETE' })
  }

  async getDemandes(): Promise<{ results: Demande[]; count: number }> {
    return this.request('/demandes/');
  }

  async getAdminDatabaseStats(): Promise<any> {
    return this.request('/admin/database/stats/');
  }

  async postAdminDatabaseBackup(): Promise<any> {
    return this.request('/admin/database/backup/', { method: 'POST' });
  }
}

export const apiClient = new ApiClient()
