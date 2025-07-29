'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Check if PerformanceObserver is available
      if (!('PerformanceObserver' in window)) {
        setError('PerformanceObserver not supported')
        return
      }

      // LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries()
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1] as PerformanceEntry
              setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
            }
          } catch (err) {
            console.warn('LCP measurement error:', err)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (err) {
        console.warn('LCP observer error:', err)
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries()
            if (entries.length > 0) {
              const firstEntry = entries[0] as any
              if (firstEntry.processingStart && firstEntry.startTime) {
                setMetrics(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }))
              }
            }
          } catch (err) {
            console.warn('FID measurement error:', err)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (err) {
        console.warn('FID observer error:', err)
      }

      // CLS (Cumulative Layout Shift)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          try {
            let clsValue = 0
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any
              if (layoutShiftEntry && !layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
                clsValue += layoutShiftEntry.value
              }
            }
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          } catch (err) {
            console.warn('CLS measurement error:', err)
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (err) {
        console.warn('CLS observer error:', err)
      }

      // TTFB (Time to First Byte)
      try {
        const navigationEntries = performance.getEntriesByType('navigation')
        if (navigationEntries.length > 0) {
          const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming
          if (navigationEntry.responseStart && navigationEntry.requestStart) {
            setMetrics(prev => ({ ...prev, ttfb: navigationEntry.responseStart - navigationEntry.requestStart }))
          }
        }
      } catch (err) {
        console.warn('TTFB measurement error:', err)
      }

    } catch (err) {
      console.error('Performance monitor error:', err)
      setError('Performance monitoring failed')
    }
  }, [])

  const getLCPStatus = (lcp: number | null) => {
    if (!lcp) return 'Loading...'
    if (lcp < 2500) return 'Good'
    if (lcp < 4000) return 'Needs Improvement'
    return 'Poor'
  }

  const getFIDStatus = (fid: number | null) => {
    if (!fid) return 'Loading...'
    if (fid < 100) return 'Good'
    if (fid < 300) return 'Needs Improvement'
    return 'Poor'
  }

  const getCLSStatus = (cls: number | null) => {
    if (!cls) return 'Loading...'
    if (cls < 0.1) return 'Good'
    if (cls < 0.25) return 'Needs Improvement'
    return 'Poor'
  }

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg text-xs font-mono z-50">
        <div className="mb-2 font-bold">Performance Monitor</div>
        <div>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Monitor</div>
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'} ({getLCPStatus(metrics.lcp)})</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : '...'} ({getFIDStatus(metrics.fid)})</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '...'} ({getCLSStatus(metrics.cls)})</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '...'}</div>
      </div>
    </div>
  )
} 