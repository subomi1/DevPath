import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
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

export function useReadStats(announcementId: string | null) {
  return useQuery({
    queryKey: ['announcements', 'read-stats', announcementId],
    queryFn: async () => {
      const response = await client.get(`/announcements/${announcementId}/read-stats/`)
      return response.data
    },
    enabled: !!announcementId,
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/announcements/${id}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; body: string; category: string } }) => {
      await client.patch(`/announcements/${id}/`, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })
}