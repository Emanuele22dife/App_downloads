"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Lock, Mail } from "lucide-react"

interface AdminLoginProps {
  returnUrl: string
}

export default function AdminLogin({ returnUrl }: AdminLoginProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://portale.dife.it/version-live/api/1.1/wf/user_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.response && data.response.token && data.response.utenteInterno === true) {
        localStorage.setItem("authToken", data.response.token)
        localStorage.setItem("utenteInterno", "true")
        router.push(returnUrl)
      } else {
        throw new Error(data.error || "Accesso non autorizzato")
      }
    } catch (error: any) {
      console.error("Error during login:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[350px] bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Accesso Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#20a136] text-white hover:bg-[#2dc14a]" disabled={loading}>
              {loading ? "Caricamento..." : "Accedi"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/")} className="text-[#20a136] hover:underline">
            Torna alla visualizzazione pubblica
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

