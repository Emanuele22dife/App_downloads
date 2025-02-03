'use client'

import { useEffect, useState } from 'react'
import { useCustomRouter } from '../../hooks/useCustomRouter'
import FolderManager from '../../components/FolderManager'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useCustomRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const utenteInterno = localStorage.getItem('utenteInterno')
      if (!token || utenteInterno !== 'true') {
        console.log('No token or not an internal user, redirecting to login...')
        router.push('/login')
        return
      }
      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('utenteInterno')
    router.push('/')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="text-[#20a136] text-2xl">Caricamento...</div>
    </div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="fixed top-4 left-4 z-50">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kSjPjjqVc5oin7uOq1wiZ09myzmR2g.png"
          alt="DIFE Logo"
          width={100}
          height={40}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex justify-end items-center mb-8 pt-16">
        <h1 className="text-xl font-semibold text-white mr-4">
          Gestione Autorizzazioni (Admin)
        </h1>
        <div className="space-x-4">
          <Button onClick={() => router.push('/')} className="bg-[#20a136] text-white hover:bg-[#2dc14a]">
            Visualizzazione Pubblica
          </Button>
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
            Logout
          </Button>
        </div>
      </div>
      <FolderManager />
    </div>
  )
}

