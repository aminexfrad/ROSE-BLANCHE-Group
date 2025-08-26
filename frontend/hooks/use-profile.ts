/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { User } from "@/lib/api"

export function useProfile() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch user profile
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
             try {
         console.log('Fetching profile data...')
         const profileData = await apiClient.getProfile()
         console.log('Profile data received:', profileData)
         return profileData
       } catch (error) {
        console.error('Error fetching profile:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }
      if (error instanceof Error && error.message.includes('403')) {
        return false
      }
      return failureCount < 2
    },
    onError: (error) => {
      console.error('Profile query error:', error)
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          toast({
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter pour accéder à votre profil.",
            variant: "destructive",
          })
        } else if (error.message.includes('fetch')) {
          toast({
            title: "Erreur de connexion",
            description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger les informations du profil.",
            variant: "destructive",
          })
        }
      }
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User> | FormData) => apiClient.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser)
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    },
    onError: (error) => {
      console.error('Profile update error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
        variant: "destructive",
      })
    },
  })

  return {
    user,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  }
} 