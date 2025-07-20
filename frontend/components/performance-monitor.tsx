'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { usePerformanceMonitor } from './performance-optimizer'

interface PerformanceMetrics {
  requestCount: number
  cacheHits: number
  averageResponseTime: number
  totalResponseTime: number
  cacheStats: {
    size: number
    maxSize: number
    keys: string[]
  }
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Use performance monitoring hook
  usePerformanceMonitor()

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = apiClient.getPerformanceMetrics()
      setMetrics(currentMetrics)
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics() // Initial update

    return () => clearInterval(interval)
  }, [])

  if (!metrics || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Show Performance Monitor"
      >
        📊
      </button>
    )
  }

  const cacheHitRate = metrics.requestCount > 0 
    ? (metrics.cacheHits / metrics.requestCount * 100).toFixed(1)
    : '0'

  const avgResponseTime = metrics.averageResponseTime.toFixed(2)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">Requests</div>
              <div className="font-semibold">{metrics.requestCount}</div>
            </div>
            <div>
              <div className="text-gray-600">Cache Hits</div>
              <div className="font-semibold">{metrics.cacheHits}</div>
            </div>
            <div>
              <div className="text-gray-600">Avg Response</div>
              <div className="font-semibold">{avgResponseTime}ms</div>
            </div>
            <div>
              <div className="text-gray-600">Cache Hit Rate</div>
              <div className="font-semibold">{cacheHitRate}%</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Cache Usage</span>
              <span>{metrics.cacheStats.size}/{metrics.cacheStats.maxSize}</span>
            </div>
            <Progress 
              value={(metrics.cacheStats.size / metrics.cacheStats.maxSize) * 100} 
              className="h-2"
            />
          </div>
          
          <div className="flex gap-2">
            <Badge 
              variant={parseFloat(cacheHitRate) > 50 ? "default" : "secondary"}
              className="text-xs"
            >
              Cache: {cacheHitRate}%
            </Badge>
            <Badge 
              variant={parseFloat(avgResponseTime) < 500 ? "default" : "destructive"}
              className="text-xs"
            >
              Avg: {avgResponseTime}ms
            </Badge>
          </div>
          
          <button
            onClick={() => {
              apiClient.clearCache()
              setMetrics(apiClient.getPerformanceMetrics())
            }}
            className="w-full text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition-colors"
          >
            Clear Cache
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

// Development-only performance monitor
export const DevPerformanceMonitor: React.FC = () => {
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  return <PerformanceMonitor />
} 