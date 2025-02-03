"use client"

import Auth from "../../components/Auth"
import { useTheme } from "../../lib/ThemeProvider"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
    >
      <Auth />
    </div>
  )
}

