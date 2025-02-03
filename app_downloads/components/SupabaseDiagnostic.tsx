'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseDiagnostic() {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runDiagnostics() {
      setLoading(true)
      const results: any = {}

      // Test connection
      try {
        const { data, error } = await supabase.from('files').select('count').single()
        results.connection = error ? 'Errore' : 'OK'
        results.connectionError = error ? error.message : null
      } catch (err: any) {
        results.connection = 'Errore'
        results.connectionError = err.message
      }

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      results.authentication = user ? 'Autenticato' : 'Non autenticato'
      results.userId = user?.id

      // Test file table structure
      try {
        const { data, error } = await supabase
          .from('files')
          .select('id, nome, folder_id, file_path, public_url, user_id, created_at, updated_at, size, mime_type')
          .limit(1)
        results.fileStructure = error ? 'Errore' : 'OK'
        results.fileStructureError = error ? error.message : null
        results.fileStructureData = data
      } catch (err: any) {
        results.fileStructure = 'Errore'
        results.fileStructureError = err.message
      }

      // Test file insertion
      if (user) {
        try {
          const { data, error } = await supabase.from('files').insert({
            nome: 'test.txt',
            folder_id: null,
            file_path: 'test/test.txt',
            public_url: 'https://example.com/test.txt',
            user_id: user.id,
            size: 1024,
            mime_type: 'text/plain'
          }).select()
          results.fileInsertion = error ? 'Errore' : 'OK'
          results.fileInsertionError = error ? error.message : null
          results.fileInsertionData = data
        } catch (err: any) {
          results.fileInsertion = 'Errore'
          results.fileInsertionError = err.message
        }
      } else {
        results.fileInsertion = 'Non testato (utente non autenticato)'
      }

      // Test RLS policies
      try {
        const { data, error } = await supabase.rpc('check_rls_policies')
        results.rlsPolicies = error ? 'Errore' : 'OK'
        results.rlsPoliciesError = error ? error.message : null
        results.rlsPoliciesData = data
      } catch (err: any) {
        results.rlsPolicies = 'Errore'
        results.rlsPoliciesError = err.message
      }

      setDiagnosticResults(results)
      setLoading(false)
    }

    runDiagnostics()
  }, [])

  if (loading) {
    return <div>Esecuzione diagnostica in corso...</div>
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-semibold mb-4 text-[#20a136]">Diagnostica Supabase</h2>
      <ul className="space-y-2">
        <li>
          <strong>Connessione:</strong> {diagnosticResults.connection}
          {diagnosticResults.connectionError && (
            <span className="text-red-500 ml-2">({diagnosticResults.connectionError})</span>
          )}
        </li>
        <li>
          <strong>Autenticazione:</strong> {diagnosticResults.authentication}
          {diagnosticResults.userId && <span className="ml-2">(User ID: {diagnosticResults.userId})</span>}
        </li>
        <li>
          <strong>Struttura tabella files:</strong> {diagnosticResults.fileStructure}
          {diagnosticResults.fileStructureError && (
            <span className="text-red-500 ml-2">({diagnosticResults.fileStructureError})</span>
          )}
          {diagnosticResults.fileStructureData && (
            <pre className="mt-2 bg-gray-700 p-2 rounded text-xs">{JSON.stringify(diagnosticResults.fileStructureData, null, 2)}</pre>
          )}
        </li>
        <li>
          <strong>Inserimento file di test:</strong> {diagnosticResults.fileInsertion}
          {diagnosticResults.fileInsertionError && (
            <span className="text-red-500 ml-2">({diagnosticResults.fileInsertionError})</span>
          )}
          {diagnosticResults.fileInsertionData && (
            <pre className="mt-2 bg-gray-700 p-2 rounded text-xs">{JSON.stringify(diagnosticResults.fileInsertionData, null, 2)}</pre>
          )}
        </li>
        <li>
          <strong>Policy RLS:</strong> {diagnosticResults.rlsPolicies}
          {diagnosticResults.rlsPoliciesError && (
            <span className="text-red-500 ml-2">({diagnosticResults.rlsPoliciesError})</span>
          )}
          {diagnosticResults.rlsPoliciesData && (
            <pre className="mt-2 bg-gray-700 p-2 rounded text-xs">{JSON.stringify(diagnosticResults.rlsPoliciesData, null, 2)}</pre>
          )}
        </li>
      </ul>
    </div>
  )
}

