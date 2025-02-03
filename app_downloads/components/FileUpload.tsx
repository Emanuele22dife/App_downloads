'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Upload, X, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  folderPath: string
  onFileUploaded: () => void
}

export default function FileUpload({ folderPath, onFileUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setDebugInfo(prev => prev + `\nUser fetched: ${user ? JSON.stringify(user) : 'No user'}\n`)
    }
    fetchUser()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Seleziona un file e assicurati di essere autenticato.')
      return
    }

    setUploading(true)
    setError(null)
    setDebugInfo('')

    try {
      const filePath = `${folderPath}/${file.name}`.replace(/^\//, '')

      setDebugInfo(prev => prev + `\nAttempting to upload file: ${filePath}`)

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('autorizzazioni')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      setDebugInfo(prev => prev + '\nFile uploaded to storage successfully')

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('autorizzazioni')
        .getPublicUrl(filePath)

      if (!publicUrlData) throw new Error('Failed to get public URL')

      setDebugInfo(prev => prev + `\nPublic URL obtained: ${publicUrlData.publicUrl}`)

      setFile(null)
      onFileUploaded()
    } catch (error: any) {
      console.error('Error uploading file:', error)
      setError(`Errore durante il caricamento del file: ${error.message}`)
      setDebugInfo(prev => prev + `\nError: ${JSON.stringify(error)}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-[#20a136]">Carica un nuovo file</h3>
      <div className="flex items-center space-x-4">
        <label className="flex-1">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          <div className="bg-gray-700 text-gray-300 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors flex items-center justify-center">
            {file ? (
              <>
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="ml-2 text-red-500 hover:text-red-400"
                  aria-label="Rimuovi file"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <>
                <Upload size={20} className="mr-2" />
                Seleziona un file
              </>
            )}
          </div>
        </label>
        <button
          onClick={handleUpload}
          disabled={!file || uploading || !user}
          className="bg-[#20a136] text-white px-4 py-2 rounded-lg hover:bg-[#2dc14a] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Caricamento...
            </>
          ) : (
            <>
              <Upload size={20} className="mr-2" />
              Carica
            </>
          )}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-red-500 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      {!user && (
        <div className="mt-2 text-yellow-500 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          Devi essere autenticato per caricare file.
        </div>
      )}
      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-[#20a136]">Debug Info:</h4>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}

