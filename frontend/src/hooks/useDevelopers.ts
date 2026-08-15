import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type { DeveloperListItem } from '../types/developer'

export function useDevelopers(search?: string) {
  return useQuery({
    queryKey: ['users', 'developers', search],
    queryFn: async () => {
      const response = await client.get<DeveloperListItem[]>('/users/', {
        params: { role: 'developer', ...(search ? { search } : {}) },
      })
      return response.data
    },
  })
}