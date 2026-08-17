import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { TemplateDetail, TemplateSummary } from '../types/templateBuilder'

export function useTemplateList() {
  return useQuery({
    queryKey: ['templates', 'list'],
    queryFn: async () => (await client.get<TemplateSummary[]>('/templates/')).data,
  })
}

export function useTemplateBuilderDetail(id: string | null) {
  return useQuery({
    queryKey: ['templates', 'builder', id],
    queryFn: async () => (await client.get<TemplateDetail>(`/templates/${id}/`)).data,
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; target_role: string; description: string }) => {
      const response = await client.post('/templates/create/', { ...data, is_active: true })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TemplateDetail> }) => {
      await client.patch(`/templates/${id}/update/`, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useCreatePhase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { template: string; name: string; order: number }) => {
      const response = await client.post('/template-phases/', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useUpdatePhase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string } }) => {
      await client.patch(`/template-phases/${id}/`, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useDeletePhase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/template-phases/${id}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useReorderPhases() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pairs: { id: string; order: number }[]) => {
      await client.post('/template-phases/reorder/', pairs)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await client.post('/template-tasks/', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await client.patch(`/template-tasks/${id}/`, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/template-tasks/${id}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pairs: { id: string; order: number }[]) => {
      await client.post('/template-tasks/reorder/', pairs)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', 'builder'] }),
  })
}