import { useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Announcement } from '../types/announcement'

export function useAnnouncements(category?: string) {
  return useQuery({
    queryKey: ['announcements', category],
    queryFn: async () => {
      const response = await client.get<Announcement[]>('/announcements/', {
        params: category ? { category } : undefined,
      })
      return response.data
    },
  })
}

export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient()
  return async (id: string) => {
    await client.get(`/announcements/${id}/`)
    queryClient.invalidateQueries({ queryKey: ['announcements'] })
  }
}