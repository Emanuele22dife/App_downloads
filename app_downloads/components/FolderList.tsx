'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { Folder, PencilIcon as PencilSquare, Trash2, X, Check, Plus } from 'lucide-react'

interface FolderType {
  id: number;
  Name: string;
}

export default function FolderList() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFolders()
  }, [])

  async function fetchFolders() {
    setIsLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('Name', { ascending: true })
    
    if (error) {
      console.error('Error fetching folders:', error)
      setError('Errore nel caricamento delle cartelle. Riprova più tardi.')
    } else {
      setFolders(data || [])
    }
    setIsLoading(false)
  }

  async function createFolder() {
    if (newFolderName.trim()) {
      setError(null)
      const { data, error } = await supabase
        .from('folders')
        .insert({ Name: newFolderName.trim() })
        .select()

      if (error) {
        console.error('Error creating folder:', error)
        setError('Errore nella creazione della cartella. Riprova più tardi.')
      } else if (data) {
        setFolders([...folders, ...data])
        setNewFolderName('')
      }
    }
  }

  async function deleteFolder(id: number) {
    setError(null)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting folder:', error)
      setError('Errore nell\'eliminazione della cartella. Riprova più tardi.')
    } else {
      setFolders(folders.filter(folder => folder.id !== id))
    }
  }

  async function renameFolder(id: number, newName: string) {
    setError(null)
    const { error } = await supabase
      .from('folders')
      .update({ Name: newName })
      .eq('id', id)

    if (error) {
      console.error('Error renaming folder:', error)
      setError('Errore nella rinomina della cartella. Riprova più tardi.')
    } else {
      setFolders(folders.map(folder => 
        folder.id === id ? { ...folder, Name: newName } : folder
      ))
      setEditingFolder(null)
    }
  }

  if (isLoading) {
    return <div className="text-[#20a136] flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20a136]"></div>
    </div>
  }

  if (error) {
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
      <p className="font-bold">Errore</p>
      <p>{error}</p>
    </div>
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-[#20a136] flex items-center">
        <Folder className="mr-2" />
        Cartelle
      </h2>
      {folders.length === 0 ? (
        //<p className="text-gray-400 mb-4">Nessuna cartella presente.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {folders.map((folder) => (
            <li key={folder.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center transition-all duration-200 hover:bg-gray-700">
              {editingFolder?.id === folder.id ? (
                <input
                  type="text"
                  value={editingFolder.Name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, Name: e.target.value })}
                  className="bg-gray-700 text-gray-100 border border-gray-600 p-2 rounded-md focus:outline-none focus:border-[#20a136] flex-grow mr-2"
                />
              ) : (
                <Link href={`/folder/${folder.id}`} className="text-[#20a136] hover:text-[#2dc14a] flex items-center">
                  <Folder className="mr-2" size={20} />
                  {folder.Name}
                </Link>
              )}
              <div className="space-x-2">
                {editingFolder?.id === folder.id ? (
                  <>
                    <button
                      onClick={() => renameFolder(folder.id, editingFolder.Name)}
                      className="text-[#20a136] hover:text-[#2dc14a] p-1 rounded-full hover:bg-gray-600"
                      aria-label="Salva"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setEditingFolder(null)}
                      className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-600"
                      aria-label="Annulla"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingFolder(folder)}
                      className="text-[#20a136] hover:text-[#2dc14a] p-1 rounded-full hover:bg-gray-600"
                      aria-label="Rinomina"
                    >
                      <PencilSquare size={20} />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-600"
                      aria-label="Elimina"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Nome nuova cartella"
          className="bg-gray-700 text-gray-100 border border-gray-600 p-3 rounded-lg flex-grow focus:outline-none focus:border-[#20a136]"
        />
        <button
          onClick={createFolder}
          className="bg-[#20a136] text-white px-4 py-3 rounded-lg hover:bg-[#2dc14a] transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Crea Cartella
        </button>
      </div>
    </div>
  )
}

