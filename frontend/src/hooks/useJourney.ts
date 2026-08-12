import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { DeveloperJourney } from '../types/journey'

export function useJourney() {
  return useQuery({
    queryKey: ['journey', 'me'],
    queryFn: async () => {
      const response = await client.get<DeveloperJourney>('/journeys/me/')
      return response.data
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await client.post(`/journey-tasks/${taskId}/complete/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey', 'me'] })
    },
  })
}

export function useSubmitTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await client.post(`/journey-tasks/${taskId}/submit/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey', 'me'] })
    },
  })
}