import { useOutletContext } from 'react-router-dom'
import type { useMembers } from './useMembers'

export function useFamilyMembers() {
  return useOutletContext<ReturnType<typeof useMembers>>()
}
