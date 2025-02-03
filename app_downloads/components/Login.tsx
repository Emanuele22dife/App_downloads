'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, Mail } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if the user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for a new user
        throw userError
      }

      if (!userData) {
        // If the user doesn't exist in the users table, create them
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: data.user?.id, email: data.user?.email })

        if (insertError) throw insertError
      }

      // Redirect or update UI state
      window.location.href = '/'
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-[#20a136] text-center">Accedi</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 pl-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#20a136]"
              required
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pl-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#20a136]"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#20a136] text-white p-2 rounded hover:bg-[#2dc14a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#20a136] focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? 'Caricamento...' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}

