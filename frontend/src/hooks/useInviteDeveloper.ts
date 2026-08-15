import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { InviteFormData } from '../types/invite'

export function useInviteDeveloper() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: InviteFormData) => {
      const response = await client.post('/invitations/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'hr'] })
    },
  })
}