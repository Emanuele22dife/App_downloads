"use client"

import "./globals.css"
import { Lato } from "next/font/google"
import Image from "next/image"
import { ThemeProvider } from "../lib/ThemeProvider"
import { usePathname } from "next/navigation"
import type React from "react"

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getPortalTitle = () => {
    if (pathname === "/") return "portale downloads"
    if (pathname?.includes("autorizzazioni")) return "portale autorizzazioni"
    if (pathname?.includes("mezzi_attrezzature")) return "portale mezzi e attrezzature"
    return "portale"
  }

  return (
    <html lang="it">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><text y='32' x='3' font-size='40' font-weight='900' fill='%2320a136'>D</text></svg>"
          type="image/svg+xml"
        />
        <title>{getPortalTitle()}</title>
      </head>
      <body className={`${lato.variable} font-sans`}>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-b from-white to-gray-600 dark:from-gray-800 dark:to-gray-900">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md p-4">
              <div className="container mx-auto">
                <div className="flex flex-col items-start">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kSjPjjqVc5oin7uOq1wiZ09myzmR2g.png"
                    alt="DIFE Logo"
                    width={100}
                    height={40}
                    className="object-contain"
                    priority
                  />
                  <div className="text-[#20a136] text-base font-medium lowercase mt-0.5">{getPortalTitle()}</div>
                </div>
              </div>
            </header>
            <main className="container mx-auto p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-lg mt-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

