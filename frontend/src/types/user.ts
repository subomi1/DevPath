export type Role = 'admin' | 'hr' | 'manager' | 'developer'

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  status: string
  job_role: string
  department: string | null
  team: string | null
  manager: string | null
  mentor: string | null
  is_mentor: boolean
  start_date: string | null
  phone: string
  created_at: string
}