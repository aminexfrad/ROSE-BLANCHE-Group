/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CandidateAuthProvider } from "@/contexts/candidate-auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { Providers } from "@/components/providers"

// Optimize font loading
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: "StageBloom - Plateforme de gestion des stages",
    template: "%s | StageBloom"
  },
  description: "Plateforme moderne de gestion des stages et stages PFE. Simplifiez la gestion de vos stages avec StageBloom.",
  keywords: ["stage", "PFE", "gestion", "étudiant", "entreprise", "tuteur", "RH"],
  authors: [{ name: "StageBloom Team" }],
  creator: "StageBloom",
  publisher: "StageBloom",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "StageBloom - Plateforme de gestion des stages",
    description: "Plateforme moderne de gestion des stages et stages PFE",
    url: '/',
    siteName: 'StageBloom',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "StageBloom - Plateforme de gestion des stages",
    description: "Plateforme moderne de gestion des stages et stages PFE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  // Performance optimizations
  other: {
    'theme-color': '#dc2626',
    'color-scheme': 'light dark',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance hints - removed /api preload since API is on different server */}
      </head>
      <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <CandidateAuthProvider>
                  {children}
                  <Toaster />
                  {/* Performance tracker temporarily disabled */}
                </CandidateAuthProvider>
              </AuthProvider>
            </ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}