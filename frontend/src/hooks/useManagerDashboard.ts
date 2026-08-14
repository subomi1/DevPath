import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { ManagerDashboard } from '../types/managerDashboard'

export function useManagerDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: async () => {
      const response = await client.get<ManagerDashboard>('/dashboard/manager/')
      return response.data
    },
  })
}