'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import PublicFolderViewer from '../../components/PublicFolderViewer'

export default function PublicViewPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="text-[#20a136] text-2xl">Caricamento...</div>
    </div>
  }

  if (!user) {
    return null // This should not happen due to the redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold text-[#20a136] rounded-lg px-4 py-2 inline-block">
          Visualizzazione Pubblica Autorizzazioni
        </h1>
      </div>
      <PublicFolderViewer />
    </div>
  )
}

