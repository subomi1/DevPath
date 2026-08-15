import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { HRDashboard } from '../types/hrDashboard'

export function useHRDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: async () => {
      const response = await client.get<HRDashboard>('/dashboard/hr/')
      return response.data
    },
  })
}