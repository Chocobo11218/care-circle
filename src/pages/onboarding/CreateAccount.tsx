import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../hooks/useSession'
import type { Member } from '../../types'

export default function CreateAccount() {
  const { ensureSignedIn, refresh, me, circle } = useSession()
  const [out, setOut] = useState('')
  const [members, setMembers] = useState<Member[]>([])

  async function run() {
    setOut('Working...')
    await ensureSignedIn()
    const { data, error } = await supabase.rpc('create_circle', {
      p_name: 'Test Circle',
      p_role: 'family',
      p_first_name: 'Test',
      p_last_name: 'User',
      p_birthday: '1990-01-01',
    })
    if (error) return setOut(`Error: ${error.message}`)
    setOut(`Created "${data.name}" with code ${data.invite_code}`)
    await refresh()
    const { data: m } = await supabase.from('members').select('*').eq('circle_id', data.id)
    setMembers((m as Member[]) ?? [])
  }

  return (
    <div className="space-y-3 p-6">
      <button onClick={run} className="rounded-xl bg-btn-primary px-6 py-3 text-white">
        Run create_circle test
      </button>
      <p>{out}</p>
      <p>Me: {me ? `${me.first_name} (${me.role})` : 'none'}</p>
      <p>Circle: {circle ? circle.invite_code : 'none'}</p>
      <ul className="list-disc pl-6">
        {members.map((m) => (
          <li key={m.id}>
            {m.first_name} {m.is_mock ? '(mock)' : '(real)'} {m.match_label ?? ''}
          </li>
        ))}
      </ul>
    </div>
  )
}