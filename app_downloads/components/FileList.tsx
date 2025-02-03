'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

interface File {
  id: number;
  nome: string;
  folder_id: number | null;
}

export default function FileList() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    setIsLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .is('folder_id', null)
      .order('nome', { ascending: true })
    
    if (error) {
      console.error('Error fetching files:', error)
      setError('Errore nel caricamento dei file. Riprova più tardi.')
    } else {
      setFiles(data || [])
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="text-[#20a136]">Caricamento file...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-[#20a136]">File PDF Generali</h2>
      {files.length === 0 ? (
        <p className="text-gray-400">Nessun file generale presente.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="bg-gray-800 p-3 rounded-xl shadow">
              <Link href={`/view/${file.id}`} className="text-[#20a136] hover:text-[#2dc14a]">
                {file.nome}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

