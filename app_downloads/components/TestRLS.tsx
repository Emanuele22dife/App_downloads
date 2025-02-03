'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestRLS() {
  const [folders, setFolders] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('*')
          .limit(5)

        if (folderError) throw folderError

        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*')
          .limit(5)

        if (fileError) throw fileError

        setFolders(folderData)
        setFiles(fileData)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-semibold mb-4 text-[#20a136]">Test RLS</h2>
      {error ? (
        <p className="text-red-500">Errore: {error}</p>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-[#20a136]">Cartelle (prime 5):</h3>
            <ul className="list-disc list-inside">
              {folders.map(folder => (
                <li key={folder.id}>{folder.Name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-[#20a136]">File (primi 5):</h3>
            <ul className="list-disc list-inside">
              {files.map(file => (
                <li key={file.id}>{file.nome}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

