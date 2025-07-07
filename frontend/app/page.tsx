"use client"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/public")
}

// The rest of the code is not needed as the redirect function will handle the navigation
