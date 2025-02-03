'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Insert the user into the users table with the 'standard' role
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: data.user.id, name: name, role: 'standard' })

        if (insertError) throw insertError

        // Redirect to login page after successful registration
        router.push('/login')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#20a136]">Registrazione</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#20a136] text-white hover:bg-[#2dc14a]"
              disabled={loading}
            >
              {loading ? 'Caricamento...' : 'Registrati'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-[#20a136] hover:underline">
            Hai già un account? Accedi
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

