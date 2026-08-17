import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Category, ArticleListItem, ArticleDetail } from '../types/knowledgeBase'

export function useCategories() {
  return useQuery({
    queryKey: ['kb', 'categories'],
    queryFn: async () => {
      const response = await client.get<Category[]>('/kb/categories/')
      return response.data
    },
  })
}

export function useArticles(params: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['kb', 'articles', params],
    queryFn: async () => {
      const response = await client.get<ArticleListItem[]>('/kb/articles/', { params })
      return response.data
    },
  })
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ['kb', 'article', slug],
    queryFn: async () => {
      const response = await client.get<ArticleDetail>(`/kb/articles/${slug}/`)
      return response.data
    },
    enabled: !!slug,
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; category: string; body: string }) => {
      const response = await client.post('/kb/articles/', data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb'] }),
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Record<string, any> }) => {
      const response = await client.patch(`/kb/articles/${slug}/`, data)
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb'] }),
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slug: string) => {
      await client.delete(`/kb/articles/${slug}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb'] }),
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await client.post(`/kb/articles/${slug}/attachments/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb'] }),
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await client.delete(`/kb/attachments/${attachmentId}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb'] }),
  })
}

export function useArticleDetail(slug: string | null) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const response = await client.get(`/kb/articles/${slug}/`)
      return response.data
    },
    enabled: !!slug,
  })
}