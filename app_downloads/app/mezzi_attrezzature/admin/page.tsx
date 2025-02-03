"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FolderManager from "../../../components/FolderManager"
import { Button } from "@/components/ui/button"

export default function MezziAttrezzatureAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      const utenteInterno = localStorage.getItem("utenteInterno")
      if (!token || utenteInterno !== "true") {
        console.log("Redirecting to login...")
        router.push("/login?returnUrl=/mezzi_attrezzature/admin")
        return
      }
      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("utenteInterno")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-[#20a136] text-2xl">Caricamento...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/mezzi_attrezzature")}
            className="bg-[#20a136] text-white hover:bg-[#2dc14a]"
          >
            Visualizzazione Pubblica
          </Button>
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
            Logout
          </Button>
        </div>
      </div>
      <div className="text-white text-xl mb-4">Gestione Mezzi e Attrezzature (Admin)</div>
      <FolderManager category="mezzi_attrezzature" />
    </div>
  )
}

