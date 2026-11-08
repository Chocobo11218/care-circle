export type Role = 'family' | 'elderly'

export interface Circle {
  id: string
  name: string
  invite_code: string
  created_by: string | null
  created_at: string
}

export interface Member {
  id: string
  circle_id: string
  user_id: string | null
  role: Role
  first_name: string
  last_name: string | null
  birthday: string | null
  is_mock: boolean
  joined_at: string
  distance_km: number | null
  availability: string | null
  match_label: 'best' | 'good' | 'alternative' | null
  match_reasons: string[] | null
}

export interface Task {
  id: string
  circle_id: string
  elder_id: string | null
  created_by: string
  assignee_id: string | null
  title: string
  location: string | null
  task_date: string | null
  start_time: string | null
  end_time: string | null
  description: string | null
  note: string | null
  created_at: string
}