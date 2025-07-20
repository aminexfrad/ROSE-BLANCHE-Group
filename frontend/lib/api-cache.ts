// API Caching System for Performance Optimization

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private defaultTTL: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutes default
  }

  // Generate cache key from URL and params
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${url}${paramString}`
  }

  // Get cached data
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Set cache entry
  set<T>(url: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const key = this.generateKey(url, params)
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  // Clear specific cache entry
  delete(url: string, params?: Record<string, any>): void {
    const key = this.generateKey(url, params)
    this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50
})

// Enhanced fetch with caching
export const cachedFetch = async <T>(
  url: string,
  options?: RequestInit,
  cacheOptions?: { ttl?: number; skipCache?: boolean }
): Promise<T> => {
  const cacheKey = `${url}${JSON.stringify(options || {})}`
  
  // Try to get from cache first
  if (!cacheOptions?.skipCache) {
    const cached = apiCache.get<T>(url, options)
    if (cached) {
      return cached
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Cache the response
    if (!cacheOptions?.skipCache) {
      apiCache.set(url, data, options, cacheOptions?.ttl)
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Debounced API calls
export const createDebouncedAPI = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await apiFunction(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

// Batch API calls
export const batchAPI = async <T>(
  requests: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = []
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(req => req()))
    results.push(...batchResults)
  }
  
  return results
}

// Auto-cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 60 * 1000) // Cleanup every minute
} 