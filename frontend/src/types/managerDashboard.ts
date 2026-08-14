export interface RosterEntry {
  id: string
  full_name: string
  job_role: string
  overall_progress: number
}

export interface ManagerDashboard {
  assigned_developers_count: number
  average_progress: number
  overdue_tasks_count: number
  pending_approvals_count: number
  roster: RosterEntry[]
}