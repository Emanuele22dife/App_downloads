'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'
import FileUpload from '../../../components/FileUpload'
import { Folder, File, ArrowLeft, Upload } from 'lucide-react'

interface FolderType {
  id: number;
  Name: string;
}

interface FileType {
  id: number;
  nome: string;
  file_path: string;
}

export default function FolderPage() {
  const params = useParams()
  const folderId = parseInt(params.id as string)
  const [folder, setFolder] = useState<FolderType | null>(null)
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    fetchFolderAndFiles()
  }, [folderId])

  async function fetchFolderAndFiles() {
    setIsLoading(true)
    setError(null)

    try {
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .single()

      if (folderError) throw folderError

      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('folder_id', folderId)
        .order('nome', { ascending: true })

      if (filesError) throw filesError

      setFolder(folderData)
      setFiles(filesData || [])
    } catch (error) {
      console.error('Error fetching folder and files:', error)
      setError('Errore nel caricamento della cartella e dei file. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20a136]"></div>
      </div>
    )
  }

  if (error || !folder) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Errore</p>
          <p>{error || 'Cartella non trovata'}</p>
        </div>
        <Link href="/" className="mt-4 inline-flex items-center text-[#20a136] hover:text-[#2dc14a]">
          <ArrowLeft className="mr-2" size={20} />
          Torna alla home
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[#20a136] flex items-center">
        <Folder className="mr-2" size={32} />
        {folder.Name}
      </h1>
      <Link href="/" className="text-[#20a136] hover:text-[#2dc14a] mb-6 inline-flex items-center">
        <ArrowLeft className="mr-2" size={20} />
        Torna alla home
      </Link>
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#20a136] flex items-center">
            <File className="mr-2" size={24} />
            File nella cartella
          </h2>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#20a136] text-white px-4 py-2 rounded-lg hover:bg-[#2dc14a] transition-colors flex items-center"
          >
            <Upload size={20} className="mr-2" />
            Carica file
          </button>
        </div>
        {files.length === 0 ? (
          <p className="text-gray-400">Nessun file presente in questa cartella.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="bg-gray-800 p-3 rounded-lg shadow flex items-center justify-between">
                <Link href={`/view/${file.id}`} className="text-[#20a136] hover:text-[#2dc14a] flex items-center">
                  <File className="mr-2" size={20} />
                  {file.nome}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-semibold mb-4 text-[#20a136]">Carica un nuovo file</h3>
            <FileUpload
              folderId={folderId}
              onFileUploaded={() => {
                fetchFolderAndFiles()
                setIsUploadModalOpen(false)
              }}
            />
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="mt-4 text-gray-400 hover:text-gray-200"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

