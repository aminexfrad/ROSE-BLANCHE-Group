import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-400">
              © 2025 Rose Blanche. Tous droits réservés.
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/public" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Accueil
            </Link>
            <Link 
              href="/public/contact" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/public/demande-stage" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Candidature
            </Link>
            <Link 
              href="/login" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Espace Collaborateurs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 