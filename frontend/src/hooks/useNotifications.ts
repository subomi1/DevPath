import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export interface Notification {
  id: string
  category: 'task' | 'access_request' | 'announcement' | 'mentorship'
  title: string
  body: string
  object_id: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await client.get<Notification[]>('/notifications/')).data,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () =>
      (await client.get<{ unread_count: number }>('/notifications/unread-count/')).data.unread_count,
    refetchInterval: 30000, // poll every 30s — cheap stand-in until there's a websocket layer
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      (await client.post<Notification>(`/notifications/${id}/mark-read/`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => (await client.post('/notifications/mark-all-read/')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}