"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

interface NavbarProps {
  isPublic?: boolean
}

export function Navbar({ isPublic = false }: NavbarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isPublic) return null

  const publicLinks = [
    { href: "/public", label: "Accueil" },
    { href: "/public/pfe-book", label: "PFE Book" },
    { href: "/public/video-3d", label: "Vidéo 3D" },
    { href: "/public/contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Simple */}
          <Link href="/public" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              StageBloom
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-red-50 text-red-600 font-semibold"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-6">
              <Link href="/public/demande-stage">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                  Postuler
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Connexion
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-red-50 text-red-600 font-semibold"
                      : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                <Link href="/public/demande-stage" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                    Postuler
                  </Button>
                </Link>

                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-semibold"
                  >
                    Connexion
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
