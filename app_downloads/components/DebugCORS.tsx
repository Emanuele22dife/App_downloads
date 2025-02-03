import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DebugCORS() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const getSessionInfo = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSessionInfo(data)
    }
    getSessionInfo()
  }, [])

  const testCORS = async () => {
    try {
      const { data, error } = await supabase.from('your_table').select('*').limit(1)
      if (error) throw error
      setTestResult('CORS test successful')
    } catch (error: any) {
      setTestResult(`CORS test failed: ${error.message}`)
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Debug CORS</h2>
      <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(sessionInfo, null, 2)}</pre>
      <button 
        onClick={testCORS}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test CORS
      </button>
      {testResult && <p className="mt-2">{testResult}</p>}
    </div>
  )
}

