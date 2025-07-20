import { useEffect, useState } from 'react'

/**
 * Hook to suppress hydration warnings caused by browser extensions
 * and other client-side differences that don't affect functionality
 */
export function useHydrationSuppression() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Suppress console warnings about hydration mismatches
  useEffect(() => {
    const originalWarn = console.warn
    console.warn = (...args) => {
      const message = args[0]
      if (typeof message === 'string' && 
          (message.includes('Hydration') || 
           message.includes('Text content did not match') ||
           message.includes('Expected server HTML to contain'))) {
        return
      }
      originalWarn.apply(console, args)
    }

    return () => {
      console.warn = originalWarn
    }
  }, [])

  return isClient
} 