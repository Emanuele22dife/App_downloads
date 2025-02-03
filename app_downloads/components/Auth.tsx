"use client"

import { useState } from "react"
import { Lock, Mail, Sun, Moon, Eye, EyeOff } from "lucide-react"
import { useCustomRouter } from "../hooks/useCustomRouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "../lib/ThemeProvider"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useCustomRouter()
  const { theme, toggleTheme } = useTheme()

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
      console.log("API Response:", data)

      if (response.ok && data.response && data.response.token && data.response.utenteInterno === true) {
        localStorage.setItem("authToken", data.response.token)
        localStorage.setItem("utenteInterno", "true")
        console.log("Login successful, redirecting...")
        const urlParams = new URLSearchParams(window.location.search)
        const returnUrl = urlParams.get("returnUrl") || "/"
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
    <Card className={`w-[350px] shadow-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-center">Accedi</CardTitle>
        <div className="flex items-center space-x-2">
          <Sun size={20} className={theme === "dark" ? "text-gray-400" : "text-yellow-500"} />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
            className={theme === "dark" ? "bg-[#20a136]" : "bg-gray-200"}
          />
          <Moon size={20} className={theme === "dark" ? "text-blue-300" : "text-gray-400"} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
  )
}

