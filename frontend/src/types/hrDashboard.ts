export interface OnboardingRow {
  developer_id: string
  full_name: string
  department: string | null
  progress: number
}

export interface HRDashboard {
  active_onboardings_count: number
  pending_activations_count: number
  completed_this_month_count: number
  onboardings: OnboardingRow[]
}