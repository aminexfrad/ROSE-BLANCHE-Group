/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Video } from "lucide-react"

export default function Video3DPage() {
  return (
    <>
      <Navbar isPublic={true} />
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white via-red-50 to-white py-14 relative overflow-hidden">
        {/* Animated background blobs behind the video */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute left-1/3 top-1/4 w-[500px] h-[300px] rounded-full bg-[#f43f5e] opacity-30 blur-3xl animate-blob1"></div>
          <div className="absolute right-1/4 top-1/2 w-[400px] h-[250px] rounded-full bg-[#fca5a5] opacity-30 blur-3xl animate-blob2"></div>
          <div className="absolute left-1/2 bottom-0 w-[350px] h-[200px] rounded-full bg-[#f87171] opacity-20 blur-2xl animate-blob3"></div>
        </div>
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 sm:px-8 md:px-10 relative z-10">
          <div className="w-full aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden mb-8 relative" style={{boxShadow: '0 0 56px 0 #f43f5e33, 0 8px 28px 0 rgba(0,0,0,0.10)'}}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/qRY9_zQd9Ms"
              title="Vidéo 3D Rose Blanche"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{background: 'black'}}
            ></iframe>
          </div>
          <p className="text-lg text-gray-700 font-normal font-sans text-center max-w-2xl">
            Découvrez la vidéo 3D officielle de Rose Blanche Group, illustrant notre vision, nos valeurs et notre engagement envers l'innovation et l'excellence.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
