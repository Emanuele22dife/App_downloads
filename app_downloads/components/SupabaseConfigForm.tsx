'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'

export default function SupabaseConfigForm() {
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedUrl = localStorage.getItem('SUPABASE_URL')
    const savedApiKey = localStorage.getItem('SUPABASE_API_KEY')
    if (savedUrl) setUrl(savedUrl)
    if (savedApiKey) setApiKey(savedApiKey)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('SUPABASE_URL', url)
    localStorage.setItem('SUPABASE_API_KEY', apiKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleReset = () => {
    setUrl('')
    setApiKey('')
    localStorage.removeItem('SUPABASE_URL')
    localStorage.removeItem('SUPABASE_API_KEY')
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#20a136]">Configurazione Supabase</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-300 mb-1">
            URL Supabase
          </label>
          <input
            type="url"
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#20a136]"
            placeholder="https://your-project.supabase.co"
            required
          />
        </div>
        <div>
          <label htmlFor="supabase-api-key" className="block text-sm font-medium text-gray-300 mb-1">
            API Key Supabase
          </label>
          <input
            type="password"
            id="supabase-api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#20a136]"
            placeholder="La tua API key"
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-[#20a136] text-white rounded-md hover:bg-[#2dc14a] focus:outline-none focus:ring-2 focus:ring-[#20a136] focus:ring-opacity-50 flex items-center"
          >
            <Save className="mr-2" size={18} />
            Salva
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
          >
            <RefreshCw className="mr-2" size={18} />
            Resetta
          </button>
        </div>
      </form>
      {isSaved && (
        <p className="mt-4 text-green-400 text-center">Configurazione salvata con successo!</p>
      )}
    </div>
  )
}

