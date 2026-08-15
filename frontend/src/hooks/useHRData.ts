import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

interface SimpleUser {
  id: string
  full_name: string
  email: string
}

interface Template {
  id: string
  name: string
  target_role: string
  description: string
  phase_count: number
  task_count: number
}

export function useManagers() {
  return useQuery({
    queryKey: ['users', 'managers'],
    queryFn: async () => {
      const response = await client.get<SimpleUser[]>('/users/', { params: { role: 'manager' } })
      return response.data
    },
  })
}

export function useMentors() {
  return useQuery({
    queryKey: ['users', 'mentors'],
    queryFn: async () => {
      const response = await client.get<SimpleUser[]>('/users/')
      return response.data
    },
  })
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => (await client.get<Template[]>('/templates/')).data,
  })
}