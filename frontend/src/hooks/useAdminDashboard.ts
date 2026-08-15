import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { AdminDashboard } from '../types/adminDashboard'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await client.get<AdminDashboard>('/dashboard/admin/')
      return response.data
    },
  })
}