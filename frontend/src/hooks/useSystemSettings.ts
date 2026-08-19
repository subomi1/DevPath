import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface SystemSettings {
  company_name: string
  primary_color: string
  min_password_length: number
  require_password_complexity: boolean
  session_timeout_minutes: number
  updated_at: string
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => (await client.get<SystemSettings>('/settings/')).data,
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      const response = await client.patch('/settings/', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['system-settings'], data)
    },
  })
}