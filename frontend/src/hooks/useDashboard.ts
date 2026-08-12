import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

interface DeveloperDashboard {
  overall_progress: number
  today_tasks: Array<{
    id: string
    title: string
    priority: string
    estimated_minutes: number
  }>
  today_tasks_count: number
  open_access_requests_count: number
  mentor: {
    id: string | null
    full_name: string | null
  }
  recent_announcements: Array<{
    id: string
    title: string
    published_at: string
    is_read: boolean
  }>
}

export function useDeveloperDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'developer'],
    queryFn: async () => {
      const response = await client.get<DeveloperDashboard>('/dashboard/developer/')
      return response.data
    },
  })
}