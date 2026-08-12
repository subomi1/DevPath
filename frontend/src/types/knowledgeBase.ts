export interface Category {
  id: string
  name: string
  slug: string
}

export interface Tag {
  id: string
  name: string
}

export interface ArticleListItem {
  id: string
  title: string
  slug: string
  category: Category
  tags: Tag[]
  author_name: string
  excerpt: string
  view_count: number
  updated_at: string
}

export interface Attachment {
  id: string
  file: string
  filename: string
  file_size: number
  uploaded_at: string
}

export interface ArticleDetail {
  id: string
  title: string
  slug: string
  category: Category
  tags: Tag[]
  body: string
  author_name: string
  view_count: number
  created_at: string
  updated_at: string
  attachments: Attachment[]
}