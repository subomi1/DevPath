import { useQuery } from '@tanstack/react-query'
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