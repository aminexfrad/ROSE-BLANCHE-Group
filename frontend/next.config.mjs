/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper optimizations
  eslint: {
    // Only ignore during builds if there are critical issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Only ignore during builds if there are critical issues
    ignoreBuildErrors: false,
  },
  // Enhanced image optimization
  images: {
    unoptimized: false,
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Development-friendly cache headers
          ...(process.env.NODE_ENV === 'development' ? [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate, max-age=0',
            },
          ] : [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ]),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Advanced performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      'react-icons',
      'framer-motion',
      'recharts'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Updated configuration options
  serverExternalPackages: [],
  bundlePagesRouterDependencies: true,
  // Compression
  compress: true,
  // Bundle analyzer (uncomment for analysis)
  // webpack: (config, { dev, isServer }) => {
  //   if (!dev && !isServer) {
  //     config.optimization.splitChunks.cacheGroups = {
  //       ...config.optimization.splitChunks.cacheGroups,
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all',
  //       },
  //     }
  //   }
  //   return config
  // },
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  // Enable static optimization
  trailingSlash: false,
}

export default nextConfig
