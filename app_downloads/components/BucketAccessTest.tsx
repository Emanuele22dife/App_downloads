'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BucketAccessTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setTestResult('')
    setError(null)

    try {
      const testFile = new Blob([''], { type: 'text/plain' })
      const fileName = `test-file-${Date.now()}.txt`
      
      console.log('Attempting to upload file:', fileName)
      
      const { data, error } = await supabase.storage
        .from('autorizzazioni')
        .upload(fileName, testFile)

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('Upload successful:', data)
      setTestResult(`File created successfully: ${fileName}`)

      // Cleanup: remove the test file
      console.log('Attempting to remove file:', fileName)
      const { error: removeError } = await supabase.storage
        .from('autorizzazioni')
        .remove([fileName])

      if (removeError) {
        console.warn('Failed to remove test file:', removeError)
        setTestResult(prev => `${prev}\nWarning: Failed to remove test file: ${removeError.message}`)
      } else {
        console.log('Test file removed successfully')
        setTestResult(prev => `${prev}\nTest file removed successfully`)
      }
    } catch (err: any) {
      console.error('Test error:', err)
      setError(`Error in test: ${err.message}\nCheck console for more details.`)
    }
  }

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-[#20a136]">Test Accesso al Bucket</h3>
      <button
        onClick={runTest}
        className="bg-[#20a136] text-white px-4 py-2 rounded-lg hover:bg-[#2dc14a] transition-colors"
      >
        Esegui Test
      </button>
      {testResult && (
        <div className="mt-4 p-2 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-[#20a136]">Risultato del test:</h4>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
          <h4 className="text-sm font-semibold mb-2">Errore:</h4>
          <pre className="text-xs whitespace-pre-wrap">{error}</pre>
        </div>
      )}
    </div>
  )
}

