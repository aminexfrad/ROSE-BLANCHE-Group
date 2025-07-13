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
  // Enable proper image optimization
  images: {
    unoptimized: false,
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
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
        ],
      },
    ]
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Compression
  compress: true,
  // Bundle analyzer (optional)
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
}

export default nextConfig
