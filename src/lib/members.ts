import type { Member } from '../types'

export interface MemberChange {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Partial<Member>
  old: Partial<Member>
}

export function splitMembers(members: Member[]) {
  return {
    realElders: members.filter(member => member.role === 'elderly' && !member.is_mock),
    realFamily: members.filter(member => member.role === 'family' && !member.is_mock),
    mockCandidates: members.filter(member => member.is_mock),
  }
}

export function orderedMembers(members: Member[]) {
  const { realElders, realFamily, mockCandidates } = splitMembers(members)
  return [...realElders, ...realFamily, ...mockCandidates]
}

export function mergeMemberChange(members: Member[], change: MemberChange, circleId: string): Member[] {
  const id = change.eventType === 'DELETE' ? change.old.id : change.new.id
  if (!id) return members
  if (change.eventType === 'DELETE') return members.filter(member => member.id !== id)
  if (change.new.circle_id !== circleId) {
    return change.eventType === 'UPDATE' && change.new.circle_id
      ? members.filter(member => member.id !== id) : members
  }
  const existing = members.find(member => member.id === id)
  if (existing) return members.map(member => member.id === id ? { ...member, ...change.new } : member)
  return [...members, change.new as Member]
}
