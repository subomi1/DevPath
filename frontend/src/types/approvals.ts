export interface TaskApprovalItem {
  type: 'task'
  id: string
  title: string
  developer_name: string
  developer_id: string
  category: string
}

export interface AccessRequestApprovalItem {
  type: 'access_request'
  id: string
  resource_display: string
  developer_name: string
  justification: string
  status: string
}