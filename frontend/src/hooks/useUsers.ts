import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { DeveloperListItem } from '../types/developer'

export function useAllUsers(search?: string) {
  return useQuery({
    queryKey: ['users', 'all', search],
    queryFn: async () => {
      const response = await client.get<DeveloperListItem[]>('/users/', {
        params: search ? { search } : undefined,
      })
      return response.data
    },
  })
}

export function useChangeRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await client.post(`/users/${userId}/role/`, { role })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await client.post(`/users/${userId}/suspend/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useArchiveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await client.post(`/users/${userId}/archive/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useToggleMentor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, is_mentor }: { userId: string; is_mentor: boolean }) => {
      await client.patch(`/users/${userId}/`, { is_mentor })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}