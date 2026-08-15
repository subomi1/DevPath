import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

interface Department { id: string; name: string }
interface Team { id: string; name: string; department: string }

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await client.get<Department[]>('/departments/')).data,
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await client.get<Team[]>('/teams/')).data,
  })
}