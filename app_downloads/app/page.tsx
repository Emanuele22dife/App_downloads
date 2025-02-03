import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DownloadsPage() {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">PORTALE DOWNLOADS</h1>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link href="/autorizzazioni" passHref>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg w-full sm:w-auto">
            Autorizzazioni
          </Button>
        </Link>
        <Link href="/mezzi_attrezzature" passHref>
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg w-full sm:w-auto">
            Mezzi e Attrezzature
          </Button>
        </Link>
      </div>
    </div>
  )
}

