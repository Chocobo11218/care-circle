import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateAccount() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    supabase.auth.signInAnonymously().then(({ data, error }) => {
      setStatus(error ? `Error: ${error.message}` : `Connected. User ID: ${data.user?.id}`)
    })
  }, [])

  return <div className="p-6">{status}</div>
}