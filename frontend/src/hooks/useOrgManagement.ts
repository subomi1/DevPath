import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface Department { id: string; name: string; description: string }
interface Team { id: string; name: string; department: string }

export function useDepartmentsWithTeams() {
  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await client.get<Department[]>('/departments/')).data,
  })
  const teams = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await client.get<Team[]>('/teams/')).data,
  })
  return { departments, teams }
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      await client.post('/departments/create/', data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; department: string }) => {
      await client.post('/teams/create/', data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ teamId, confirm }: { teamId: string; confirm?: boolean }) => {
      await client.delete(`/teams/${teamId}/${confirm ? '?confirm=true' : ''}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (departmentId: string) => {
      await client.delete(`/departments/${departmentId}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}