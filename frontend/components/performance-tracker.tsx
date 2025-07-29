'use client'

import { useEffect, useState } from 'react'

interface PerformanceData {
  lcp: number | null
  fcp: number | null
  ttfb: number | null
  domLoad: number | null
  windowLoad: number | null
}

export function PerformanceTracker() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    lcp: null,
    fcp: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()

    // TTFB measurement
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart
      }))
    }

    // DOM Load measurement
    const handleDOMContentLoaded = () => {
      setMetrics(prev => ({
        ...prev,
        domLoad: performance.now() - startTime
      }))
    }

    // Window Load measurement
    const handleLoad = () => {
      setMetrics(prev => ({
        ...prev,
        windowLoad: performance.now() - startTime
      }))
    }

    // LCP measurement
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // FCP measurement
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          setMetrics(prev => ({ ...prev, fcp: entries[0].startTime }))
        }
      })
      fcpObserver.observe({ entryTypes: ['first-contentful-paint'] })
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

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  const getStatus = (value: number | null, good: number, needsImprovement: number) => {
    if (!value) return 'Loading...'
    if (value < good) return '✅ Good'
    if (value < needsImprovement) return '⚠️ Needs Improvement'
    return '❌ Poor'
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold text-green-400">Performance Tracker</div>
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'} ({getStatus(metrics.lcp, 2500, 4000)})</div>
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '...'} ({getStatus(metrics.fcp, 1800, 3000)})</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '...'} ({getStatus(metrics.ttfb, 800, 1800)})</div>
        <div>DOM: {metrics.domLoad ? `${Math.round(metrics.domLoad)}ms` : '...'}</div>
        <div>Load: {metrics.windowLoad ? `${Math.round(metrics.windowLoad)}ms` : '...'}</div>
      </div>
    </div>
  )
} 