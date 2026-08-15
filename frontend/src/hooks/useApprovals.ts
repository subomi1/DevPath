import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface PendingTask {
  id: string
  title: string
  category: string
  developer_id: string
  developer_name: string
}

export function usePendingTaskVerifications() {
  return useQuery({
    queryKey: ['approvals', 'tasks'],
    queryFn: async () => {
      const response = await client.get<PendingTask[]>('/journey-tasks/pending-verification/')
      return response.data
    },
  })
}

export function useVerifyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await client.post(`/journey-tasks/${taskId}/verify/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
    },
  })
}

export function useSendBackTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await client.post(`/journey-tasks/${taskId}/send-back/`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
    },
  })
}

export function useApproveAccessRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      await client.post(`/access-requests/${requestId}/approve/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] })
    },
  })
}

export function useRejectAccessRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      await client.post(`/access-requests/${requestId}/reject/`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] })
    },
  })
}