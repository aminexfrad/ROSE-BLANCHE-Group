/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-sm text-gray-700">
              © 2025 Rose Blanche. Tous droits réservés.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/public" 
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Accueil
            </Link>
            <Link 
              href="/public/contact" 
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Espace Collaborateurs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 