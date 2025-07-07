import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function useProtectedRoute(allowedRoles?: string[]) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace("/login")
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login")
    }
  }, [user, allowedRoles, router])
} 