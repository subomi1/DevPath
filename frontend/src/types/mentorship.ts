export interface MentorMeeting {
  id: string
  developer: string
  developer_name: string
  mentor: string
  mentor_name: string
  requested_at: string
  preferred_time_note: string
  scheduled_at: string | null
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled'
}

export interface MentorNote {
  id: string
  developer: string
  mentor: string
  mentor_name: string
  content: string
  is_goal: boolean
  created_at: string
}

export interface MentorshipSummary {
  mentor: {
    id: string | null
    full_name: string | null
    email: string | null
  }
  meetings: MentorMeeting[]
  goals: MentorNote[]
}