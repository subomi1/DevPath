import type { DeveloperJourney } from './journey'

export interface DeveloperJourneyDetail {
  developer: {
    id: string
    full_name: string
    email: string
    job_role: string
    start_date: string | null
  }
  journey: DeveloperJourney | null
}