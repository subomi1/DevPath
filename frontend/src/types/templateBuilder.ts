export interface BuilderTask {
  id: string
  title: string
  description: string
  category: string
  priority: string
  due_offset_days: number
  estimated_minutes: number
  verification_type: string
  order: number
}

export interface BuilderPhase {
  id: string
  name: string
  tasks: BuilderTask[]
}

export interface TemplateDetail {
  id: string
  name: string
  target_role: string
  description: string
  phases: BuilderPhase[]
}

export interface TemplateSummary {
  id: string
  name: string
  target_role: string
  phase_count: number
  task_count: number
}