export type TaskStatus = 'locked' | 'upcoming' | 'current' | 'completed' | 'verified' | 'sent_back'
export type VerificationType = 'self' | 'manager_verified' | 'automatic'

export interface JourneyTask {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  estimated_minutes: number
  verification_type: VerificationType
  status: TaskStatus
  completed_at: string | null
  verified_by: string | null
  verified_at: string | null
  verification_note: string
  order: number
}

export interface JourneyPhase {
  id: string
  name: string
  order: number
  tasks: JourneyTask[]
}

export interface DeveloperJourney {
  id: string
  started_at: string
  completed_at: string | null
  overall_progress: number
  phases: JourneyPhase[]
}