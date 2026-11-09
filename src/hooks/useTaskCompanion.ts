import type { Task } from '../types'
import { useFamilyMembers } from './useFamilyMembers'

export function useTaskCompanion(task?: Task) {
  const { members } = useFamilyMembers()
  return members.find(member => member.id === task?.assignee_id)
}

