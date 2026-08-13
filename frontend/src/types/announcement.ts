export type AnnouncementCategory = 'orientation' | 'engineering' | 'office' | 'maintenance' | 'training'

export interface Announcement {
  id: string
  title: string
  body: string
  category: AnnouncementCategory
  author_name: string
  audience_scope: string
  audience_department: string | null
  audience_team: string | null
  published_at: string
  updated_at: string
  is_read: boolean
}