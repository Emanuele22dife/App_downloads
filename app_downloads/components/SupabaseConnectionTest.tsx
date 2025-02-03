'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseConnectionTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setTestResult('')
    setError(null)

    try {
      const { data, error } = await supabase.from('autorizzazioni').select('*').limit(1)

      if (error) throw error

      setTestResult('Connessione a Supabase riuscita')
    } catch (err: any) {
      console.error('Test error:', err)
      setError(`Errore di connessione: ${err.message}`)
    }
  }

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-[#20a136]">Test Connessione Supabase</h3>
      <button
        onClick={runTest}
        className="bg-[#20a136] text-white px-4 py-2 rounded-lg hover:bg-[#2dc14a] transition-colors"
      >
        Verifica Connessione
      </button>
      {testResult && (
        <div className="mt-4 p-2 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-[#20a136]">Risultato del test:</h4>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
          Errore: {error}
        </div>
      )}
    </div>
  )
}

