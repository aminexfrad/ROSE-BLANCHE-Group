'use client'

import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'

// Lazy loading wrapper
export const LazyComponent = ({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 h-4 rounded" /> 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true)
          setHasIntersected(true)
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, options])

  return { ref, isIntersecting, hasIntersected }
}

// Image lazy loading component
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.jpg',
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string
}) => {
  const { ref, isIntersecting } = useIntersectionObserver()
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (isIntersecting && src) {
      setImageSrc(src)
    }
  }, [isIntersecting, src])

  return (
    <img
      ref={ref as React.RefObject<HTMLImageElement>}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      {...props}
    />
  )
}

// Debounced input hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Virtual scrolling hook
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItemCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleItemCount + 1, itemCount)

  const visibleItems = Array.from(
    { length: endIndex - startIndex },
    (_, index) => startIndex + index
  )

  const totalHeight = itemCount * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  }
}

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
          }
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming
            console.log('FID:', firstInputEntry.processingStart - firstInputEntry.startTime)
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', (entry as any).value)
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      return () => observer.disconnect()
    }
  }, [])
}

// Memoized component wrapper
export const memoize = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual)
}

// Resource preloader
export const useResourcePreloader = (resources: string[]) => {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.endsWith('.css') ? 'style' : 'script'
      document.head.appendChild(link)
    })
  }, [resources])
} 