import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { MentorshipSummary, MenteesSummary } from '../types/mentorship'

export function useMyMentorship() {
  return useQuery({
    queryKey: ['mentorship', 'me'],
    queryFn: async () => {
      const response = await client.get<MentorshipSummary>('/mentorship/me/')
      return response.data
    },
  })
}

export function useRequestMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (preferred_time_note: string) => {
      await client.post('/mentor-meetings/', { preferred_time_note })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship', 'me'] })
    },
  })
}

export function useMyMentees() {
  return useQuery({
    queryKey: ['mentorship', 'mentees'],
    queryFn: async () => {
      const response = await client.get<MenteesSummary>('/mentorship/mentees/')
      return response.data
    },
  })
}