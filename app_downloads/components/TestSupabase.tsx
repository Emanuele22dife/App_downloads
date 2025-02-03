'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to fetch a simple query to test the connection
        const { data, error } = await supabase
          .from('folders')
          .select('count')
          .single()

        if (error) throw error
        
        setStatus('success')
      } catch (err: any) {
        console.error('Connection error:', err)
        setStatus('error')
        setError(err.message)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg">
      {status === 'loading' && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#20a136]"></div>
          <span>Verifica connessione Supabase...</span>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-[#20a136]">
          ✓ Connessione a Supabase stabilita con successo
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-500">
          ✗ Errore di connessione: {error}
        </div>
      )}
    </div>
  )
}

