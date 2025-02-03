"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { Folder, File, ArrowLeft, Eye, Download, Archive, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import JSZip from "jszip"

interface FolderType {
  id: string
  name: string
  path: string
  date: string
  description: string
  is_hidden: boolean
  category: string
  order: number
}

interface FileType {
  id: string
  name: string
  path: string
  date?: string
  description?: string
  category: string
  order: number
}

export default function PublicFolderViewer({ category }: { category: string }) {
  const [currentPath, setCurrentPath] = useState("")
  const [folders, setFolders] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchFoldersAndFiles()
  }, [category, currentPath]) // Updated dependency array

  const fetchFoldersAndFiles = async (path: string = currentPath) => {
    setIsLoading(true)
    setError(null)
    console.log("Fetching files for path:", path)
    console.log("Category:", category)
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from("folders")
        .select("id, name, path, date, description, is_hidden, category, order")
        .eq("path", path)
        .eq("category", category)
        .eq("is_hidden", false)
        .order("order", { ascending: true })

      if (foldersError) throw foldersError

      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .select("id, name, path, date, description, category, order")
        .eq("path", path)
        .eq("category", category)
        .eq("isHidden", false)
        .order("order", { ascending: true })

      if (filesError) throw filesError
      console.log("Files data:", filesData)

      setFolders(foldersData || [])
      setFiles(filesData || [])
    } catch (error: any) {
      console.error("Error fetching folders and files:", error)
      setError(`Errore nel caricamento delle cartelle e dei file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToFolder = (folder: FolderType) => {
    const newPath = `${currentPath}/${folder.name}`.replace(/^\//, "")
    setCurrentPath(newPath)
    fetchFoldersAndFiles(newPath)
  }

  const navigateUp = () => {
    const pathParts = currentPath.split("/")
    if (pathParts.length > 0) {
      const newPath = pathParts.slice(0, -1).join("/")
      setCurrentPath(newPath)
      fetchFoldersAndFiles(newPath)
    }
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.storage.from(category).download(filePath)

      if (error) throw error
      if (!data) throw new Error("No data received from download")

      const blob = new Blob([data], { type: data.type })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download avviato",
        description: `Il download di ${fileName} è stato avviato.`,
      })
    } catch (error: any) {
      console.error("Error in downloadFile:", error)
      setError(`Errore nel download del file: ${error.message}`)
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante il download: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const viewFile = async (fileName: string) => {
    try {
      const filePath = `${currentPath}/${fileName}`.replace(/^\//, "")
      const { data, error } = await supabase.storage.from(category).createSignedUrl(filePath, 60)

      if (error) throw error
      if (!data || !data.signedUrl) throw new Error("No signed URL received")

      window.open(data.signedUrl, "_blank")
    } catch (error: any) {
      console.error("Error in viewFile:", error)
      setError(`Errore nella visualizzazione del file: ${error.message}`)
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante l'apertura del file: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const downloadAllFiles = async () => {
    setIsDownloading(true)
    setError(null)
    const zip = new JSZip()

    try {
      // Funzione ricorsiva per aggiungere file e sottocartelle allo zip
      const addFolderToZip = async (folderPath: string, zipFolder: JSZip) => {
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("name, path")
          .eq("path", folderPath)
          .eq("category", category)
          .eq("isHidden", false)

        if (filesError) throw filesError

        for (const file of filesData || []) {
          const filePath = `${file.path}/${file.name}`.replace(/^\//, "")
          const { data, error } = await supabase.storage.from(category).download(filePath)
          if (error) throw error
          zipFolder.file(file.name, data)
        }

        const { data: foldersData, error: foldersError } = await supabase
          .from("folders")
          .select("name, path")
          .eq("path", folderPath)
          .eq("category", category)
          .eq("is_hidden", false)

        if (foldersError) throw foldersError

        for (const folder of foldersData || []) {
          const subfolderPath = `${folder.path}/${folder.name}`.replace(/^\//, "")
          const subfolderZip = zipFolder.folder(folder.name)
          if (subfolderZip) {
            await addFolderToZip(subfolderPath, subfolderZip)
          }
        }
      }

      await addFolderToZip(currentPath, zip)

      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `${category}_${currentPath.replace(/\//g, "_") || "root"}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download completato",
        description: "Tutti i file sono stati scaricati con successo.",
      })
    } catch (error: any) {
      console.error("Error in downloadAllFiles:", error)
      setError(`Errore nel download di tutti i file: ${error.message}`)
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante il download di tutti i file: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <CardContent className="p-6">
          {/* Breadcrumb e navigazione */}
          <div className="mb-6 flex items-center flex-wrap text-sm md:text-base">
            <Button
              variant="link"
              onClick={() => setCurrentPath("")}
              className="text-[#20a136] hover:text-[#2dc14a] font-semibold"
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
            </Button>
            {currentPath.split("/").map((folder, index, array) => (
              <span key={index} className="flex items-center">
                <ChevronRight className="mx-2 text-[#20a136]" size={16} />
                <Button
                  variant="link"
                  onClick={() => setCurrentPath(array.slice(0, index + 1).join("/"))}
                  className="text-[#20a136] hover:text-[#2dc14a]"
                >
                  {folder}
                </Button>
              </span>
            ))}
          </div>

          {currentPath && (
            <div className="flex justify-between mb-6">
              <Button
                variant="outline"
                onClick={navigateUp}
                className="flex items-center text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft size={16} className="mr-2" />
                Torna indietro
              </Button>
              {files.length > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadAllFiles}
                  disabled={isDownloading}
                  className="flex items-center text-green-600 hover:text-green-800 border-green-300 hover:border-green-400"
                >
                  <Archive size={16} className="mr-2" />
                  {isDownloading ? "Scaricamento in corso..." : "Scarica tutti i file"}
                </Button>
              )}
            </div>
          )}

          {/* Lista cartelle */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Cartelle{currentPath ? ` in "${currentPath.split("/").pop() || category}"` : ""}
            </h3>
            {folders.length === 0 ? (
              <p className="text-gray-500 italic">
                Nessuna cartella presente
                {currentPath ? ` nella cartella "${currentPath.split("/").pop() || category}"` : ""}.
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <div className="flex items-center mb-2">
                      <Folder className="mr-2 text-yellow-500" size={24} />
                      <span className="text-gray-800 font-semibold">{folder.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Data: {folder.date || "Non specificata"}</p>
                      <p className="truncate">Descrizione: {folder.description || "Nessuna descrizione"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista file */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              File{currentPath ? ` in "${currentPath.split("/").pop() || category}"` : ""}
            </h3>
            {files.length === 0 ? (
              <p className="text-gray-500 italic">
                Nessun file presente nella cartella "{currentPath ? currentPath.split("/").pop() || category : category}
                ".
              </p>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <File className="mr-2 text-blue-500" size={20} />
                        <span className="text-gray-800 font-medium">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewFile(file.name)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                        >
                          <Eye size={16} className="mr-1" />
                          Visualizza
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(`${currentPath}/${file.name}`.replace(/^\//, ""), file.name)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <Download size={16} className="mr-1" />
                          Scarica
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Data: {file.date || "Non specificata"}</p>
                      <p className="truncate">Descrizione: {file.description || "Nessuna descrizione"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && <p className="mt-8 text-red-500 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

