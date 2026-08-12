export type AccessRequestStatus = 'submitted' | 'under_review' | 'approved' | 'completed' | 'rejected'

export interface AccessRequestStatusLog {
  status: AccessRequestStatus
  changed_by_name: string
  changed_at: string
}

export interface AccessRequest {
  id: string
  developer: string
  developer_name: string
  resource: string
  resource_display: string
  resource_other_label: string
  access_level: string
  justification: string
  status: AccessRequestStatus
  reviewed_by: string | null
  rejection_reason: string
  created_at: string
  updated_at: string
  status_log: AccessRequestStatusLog[]
}