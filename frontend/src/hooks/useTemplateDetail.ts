import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

interface TemplateTask { id: string; title: string; category: string; verification_type: string }
interface TemplatePhase { id: string; name: string; tasks: TemplateTask[] }
interface TemplateDetail {
  id: string
  name: string
  target_role: string
  description: string
  phases: TemplatePhase[]
}

export function useTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: async () => (await client.get<TemplateDetail>(`/templates/${id}/`)).data,
    enabled: !!id,
  })
}