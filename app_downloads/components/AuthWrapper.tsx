'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Login from './Login'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Caricamento...</div>
  }

  if (!user) {
    return <Login />
  }

  return <>{children}</>
}

