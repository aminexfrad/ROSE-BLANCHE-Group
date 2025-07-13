import { z } from 'zod'

// Environment variable schema with better defaults
const envSchema = z.object({
  // Required environment variables with defaults
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL').default('http://localhost:8000/api'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'NEXT_PUBLIC_APP_NAME is required').default('StageBloom'),
  
  // Optional environment variables
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_VERSION: z.string().optional().default('1.0.0'),
  
  // Security
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Analytics and monitoring
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // External services
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  
  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate environment variables with better error handling
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'))
      console.warn(`Missing or invalid environment variables: ${missingVars.join(', ')}`)
      console.warn('Using default values. Please set up your .env.local file properly.')
      
      // Return a default configuration instead of throwing
      return {
        NEXT_PUBLIC_API_URL: 'http://localhost:8000/api',
        NEXT_PUBLIC_APP_NAME: 'StageBloom',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
        NODE_ENV: 'development' as const,
        NEXTAUTH_SECRET: undefined,
        NEXTAUTH_URL: undefined,
        NEXT_PUBLIC_GA_ID: undefined,
        NEXT_PUBLIC_SENTRY_DSN: undefined,
        GOOGLE_SITE_VERIFICATION: undefined,
      }
    }
    throw error
  }
}

// Get validated environment variables
export const env = validateEnv()

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Feature flags
export const features = {
  analytics: isProduction && !!env.NEXT_PUBLIC_GA_ID,
  errorReporting: isProduction && !!env.NEXT_PUBLIC_SENTRY_DSN,
  debugMode: isDevelopment,
} as const

// Security configuration
export const security = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  passwordRequirements: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
} as const

// API configuration
export const api = {
  baseUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

// File upload configuration
export const upload = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  maxFiles: 5,
} as const

// App configuration
export const app = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  url: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const 