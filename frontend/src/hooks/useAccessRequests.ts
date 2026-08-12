import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { AccessRequest } from '../types/accessRequest'

export function useAccessRequests() {
  return useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const response = await client.get<AccessRequest[]>('/access-requests/')
      return response.data
    },
  })
}

interface CreateAccessRequestPayload {
  resource: string
  resource_other_label?: string
  access_level?: string
  justification: string
}

export function useCreateAccessRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAccessRequestPayload) => {
      const response = await client.post<AccessRequest>('/access-requests/', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] })
    },
  })
}