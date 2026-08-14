import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { DeveloperJourneyDetail } from '../types/managerJourney'

export function useDeveloperJourneyDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['journey', 'detail', userId],
    queryFn: async () => {
      const response = await client.get<DeveloperJourneyDetail>(`/journeys/${userId}/`)
      return response.data
    },
    enabled: !!userId,
  })
}