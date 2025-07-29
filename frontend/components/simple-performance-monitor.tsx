'use client'

import { useEffect, useState } from 'react'

interface SimpleMetrics {
  loadTime: number | null
  domContentLoaded: number | null
  firstPaint: number | null
}

export function SimplePerformanceMonitor() {
  const [metrics, setMetrics] = useState<SimpleMetrics>({
    loadTime: null,
    domContentLoaded: null,
    firstPaint: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()

    // DOM Content Loaded
    const handleDOMContentLoaded = () => {
      const domContentLoadedTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, domContentLoaded: domContentLoadedTime }))
    }

    // Window Load
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    // First Paint (approximation)
    const handleFirstPaint = () => {
      const firstPaintTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, firstPaint: firstPaintTime }))
    }

    // Add event listeners
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
    } else {
      handleDOMContentLoaded()
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    // Simulate first paint (this is an approximation)
    setTimeout(handleFirstPaint, 100)

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  const getStatus = (time: number | null, good: number, needsImprovement: number) => {
    if (!time) return 'Loading...'
    if (time < good) return 'Good'
    if (time < needsImprovement) return 'Needs Improvement'
    return 'Poor'
  }

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Monitor</div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : '...'} ({getStatus(metrics.loadTime, 2000, 4000)})</div>
        <div>DOM Ready: {metrics.domContentLoaded ? `${Math.round(metrics.domContentLoaded)}ms` : '...'} ({getStatus(metrics.domContentLoaded, 1000, 2000)})</div>
        <div>First Paint: {metrics.firstPaint ? `${Math.round(metrics.firstPaint)}ms` : '...'} ({getStatus(metrics.firstPaint, 500, 1000)})</div>
      </div>
    </div>
  )
} 