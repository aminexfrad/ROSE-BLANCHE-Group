'use client'

import { useEffect, useState } from 'react'

export function BasicPerformance() {
  const [loadTime, setLoadTime] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()

    const handleLoad = () => {
      const time = performance.now() - startTime
      setLoadTime(time)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-1">Performance</div>
      <div>
        Load: {loadTime ? `${Math.round(loadTime)}ms` : '...'}
        {loadTime && (
          <span className="ml-2">
            ({loadTime < 2000 ? '✅' : loadTime < 4000 ? '⚠️' : '❌'})
          </span>
        )}
      </div>
    </div>
  )
} 