'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DebugStorageOperations() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testCreateFolder = async () => {
    setIsLoading(true)
    setResult('')
    try {
      const folderName = `test-folder-${Date.now()}`
      const { data, error } = await supabase.storage
        .from('autorizzazioni')
        .upload(`${folderName}/.keep`, new Blob([]))

      if (error) throw error

      setResult(`Cartella creata con successo: ${folderName}`)

      // Ora proviamo a leggere la cartella appena creata
      const { data: listData, error: listError } = await supabase.storage
        .from('autorizzazioni')
        .list(folderName)

      if (listError) throw listError

      setResult(prev => `${prev}\nLettura cartella riuscita: ${JSON.stringify(listData)}`)

    } catch (error: any) {
      setResult(`Errore: ${error.message}`)
      console.error('Debug error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkBucketPermissions = async () => {
    setIsLoading(true)
    setResult('')
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('autorizzazioni')

      if (bucketError) throw bucketError

      setResult(`Permessi del bucket: ${JSON.stringify(bucketData, null, 2)}`)

    } catch (error: any) {
      setResult(`Errore nel controllo dei permessi: ${error.message}`)
      console.error('Debug error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserAuthentication = async () => {
    setIsLoading(true)
    setResult('')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error

      setResult(user ? `Utente autenticato: ${JSON.stringify(user, null, 2)}` : 'Nessun utente autenticato')

    } catch (error: any) {
      setResult(`Errore nel controllo dell'autenticazione: ${error.message}`)
      console.error('Debug error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-[#20a136]">Debug Operazioni Storage</h2>
      <div className="space-y-4">
        <button
          onClick={testCreateFolder}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Testa Creazione Cartella
        </button>
        <button
          onClick={checkBucketPermissions}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Controlla Permessi Bucket
        </button>
        <button
          onClick={checkUserAuthentication}
          disabled={isLoading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
        >
          Verifica Autenticazione Utente
        </button>
      </div>
      {isLoading && <p className="mt-4 text-gray-400">Caricamento...</p>}
      {result && (
        <pre className="mt-4 p-4 bg-gray-800 rounded-lg overflow-x-auto text-white">
          {result}
        </pre>
      )}
    </div>
  )
}

