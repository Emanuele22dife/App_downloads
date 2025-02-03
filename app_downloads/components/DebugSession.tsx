import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface DebugSessionProps {
  status: string
}

export default function DebugSession({ status }: DebugSessionProps) {
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const getSessionData = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data) {
        setSessionData(data)
      }
    }
    getSessionData()
  }, [status])

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-2">Debug Session Info</h2>
      <p>Status: {status}</p>
      {sessionData && (
        <pre className="mt-2 p-2 bg-gray-700 rounded overflow-auto">
          {JSON.stringify(sessionData, null, 2)}
        </pre>
      )}
    </div>
  )
}

