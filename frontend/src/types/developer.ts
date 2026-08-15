export interface DeveloperListItem {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  job_role: string
  department: string | null
  team: string | null
  manager: string | null
  mentor: string | null
  start_date: string | null
  phone: string
  created_at: string
}