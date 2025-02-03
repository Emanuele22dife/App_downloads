"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import { Folder, File, Plus, Trash2, ArrowLeft, Upload, Edit, Eye, EyeOff, Move, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  isHidden: boolean
  size?: number
  mime_type?: string
  date?: string
  description?: string
  category: string
  order: number
}

export default function FolderManager({ category }: { category: string }) {
  const [currentPath, setCurrentPath] = useState("")
  const [folders, setFolders] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderDate, setNewFolderDate] = useState("")
  const [newFolderDescription, setNewFolderDescription] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null)
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false)
  const [newFileDate, setNewFileDate] = useState("")
  const [newFileDescription, setNewFileDescription] = useState("")
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [fileToMove, setFileToMove] = useState<FileType | null>(null)
  const [destinationFolder, setDestinationFolder] = useState<string>("")
  const [allFolders, setAllFolders] = useState<FolderType[]>([])
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileType | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false)
  const [folderToRename, setFolderToRename] = useState<FolderType | null>(null)
  const [newFolderName2, setNewFolderName2] = useState("")
  const [isEditFileDialogOpen, setIsEditFileDialogOpen] = useState(false)
  const [fileToEdit, setFileToEdit] = useState<FileType | null>(null)
  const [editedFileDate, setEditedFileDate] = useState("")
  const [editedFileDescription, setEditedFileDescription] = useState("")
  const [isEditFolderDialogOpen, setIsEditFolderDialogOpen] = useState(false)
  const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null)
  const [editedFolderDate, setEditedFolderDate] = useState("")
  const [editedFolderDescription, setEditedFolderDescription] = useState("")
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const [draggedFiles, setDraggedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  //const [sortBy, setSortBy] = useState<"name" | "date" | "custom">("custom")
  //const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  //const [userSelectedSort, setUserSelectedSort] = useState(false)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [recentlyMovedItem, setRecentlyMovedItem] = useState<string | null>(null)
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: "folder" | "file" } | null>(null)
  const [isHideAllFilesDialogOpen, setIsHideAllFilesDialogOpen] = useState(false)
  const [itemToHide, setItemToHide] = useState<{ id: string; name: string; type: "folder" | "file" } | null>(null)
  const [areAllFilesHidden, setAreAllFilesHidden] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Ordina i file per nome prima di aggiungerli allo stato
    const sortedFiles = acceptedFiles.sort((a, b) => a.name.localeCompare(b.name))
    setDraggedFiles((prevFiles) => [...prevFiles, ...sortedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      setIsAuthenticated(!!token)
    }

    checkAuth()
    fetchFoldersAndFiles()
  }, [])

  useEffect(() => {
    setSelectedFolder(null)
  }, [])

  const fetchFoldersAndFiles = async (path: string = currentPath) => {
    setIsLoading(true)
    setError(null)
    try {
      const foldersQuery = supabase
        .from("folders")
        .select("id, name, path, date, description, is_hidden, order, category")
        .eq("path", path)
        .eq("category", category)
        .order("order", { ascending: true }) // Ordina sempre per il campo 'order'

      const filesQuery = supabase
        .from("files")
        .select("*")
        .eq("path", path)
        .eq("category", category)
        .order("order", { ascending: true }) // Ordina sempre per il campo 'order'

      const [{ data: foldersData, error: foldersError }, { data: filesData, error: filesError }] = await Promise.all([
        foldersQuery,
        filesQuery,
      ])

      if (foldersError) throw foldersError
      if (filesError) throw filesError

      setFolders(foldersData || [])
      setFiles(filesData || [])
      setAreAllFilesHidden(filesData?.every((file) => file.isHidden) ?? false)
    } catch (error: any) {
      console.error("Error fetching folders and files:", error)
      setError(`Errore nel caricamento delle cartelle e dei file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemOrder = async (itemType: "folders" | "files", items: FolderType[] | FileType[]) => {
    const updates = items.map((item, index) => ({
      id: item.id,
      order: index,
      path: item.path,
      category: item.category,
    }))

    const { error } = await supabase.from(itemType).upsert(updates, {
      onConflict: "id",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error(`Error updating ${itemType} order:`, error)
      toast({
        title: `Errore nell'aggiornamento dell'ordine`,
        description: `Si è verificato un errore durante l'aggiornamento dell'ordine degli elementi.`,
        variant: "destructive",
      })
    } else {
      await fetchFoldersAndFiles()
    }
  }

  const onDragEnd = async (newOrder: FolderType[]) => {
    setFolders(newOrder)
    setHasManuallyReordered(true)
    await updateItemOrder("folders", newOrder)
  }

  const onDragEndFiles = async (newOrder: FileType[]) => {
    setFiles(newOrder)

    // Aggiorna l'ordine nel database
    const updates = newOrder.map((file, index) => ({
      id: file.id,
      order: index,
    }))

    const { error } = await supabase.from("files").upsert(updates, {
      onConflict: "id",
    })

    if (error) {
      console.error("Error updating file order:", error)
      toast({
        title: "Errore nell'aggiornamento dell'ordine",
        description: "Si è verificato un errore durante l'aggiornamento dell'ordine dei file.",
        variant: "destructive",
      })
    }
  }

  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName
    setCurrentPath(newPath)
    fetchFoldersAndFiles(newPath)
  }

  const navigateUp = () => {
    const pathParts = currentPath.split("/")
    if (pathParts.length > 1) {
      const newPath = pathParts.slice(0, -1).join("/")
      setCurrentPath(newPath)
      fetchFoldersAndFiles(newPath)
    } else {
      setCurrentPath("")
      fetchFoldersAndFiles("")
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim() || !isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const folderPath = `${currentPath}/${newFolderName.trim()}`.replace(/^\//, "")

      const { data: existingFolder, error: checkError } = await supabase
        .from("folders")
        .select("id")
        .eq("name", newFolderName.trim())
        .eq("path", currentPath)
        .eq("category", category)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existingFolder) {
        toast({
          title: "Cartella già esistente",
          description: `La cartella ${newFolderName} esiste già.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { error: storageError } = await supabase.storage.from(category).upload(`${folderPath}/.keep`, new Blob([]))

      if (storageError && storageError.message !== "The resource already exists") {
        throw storageError
      }

      const maxOrder = Math.max(...folders.map((folder) => folder.order), 0)
      const { error: dbError } = await supabase.from("folders").insert({
        name: newFolderName.trim(),
        path: currentPath,
        date: newFolderDate,
        description: newFolderDescription,
        is_hidden: false,
        category: category,
        order: maxOrder + 1,
      })

      if (dbError) throw dbError

      setNewFolderName("")
      setNewFolderDate("")
      setNewFolderDescription("")
      setIsNewFolderDialogOpen(false)
      await fetchFoldersAndFiles()
      toast({
        title: "Cartella creata",
        description: `La cartella ${newFolderName} è stata creata con successo.`,
      })
    } catch (error: any) {
      console.error("Error creating folder:", error)
      setError(`Errore nella creazione della cartella: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFolder = async (folderId: string, folderName: string) => {
    if (!isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const { error: dbError } = await supabase.from("folders").delete().eq("id", folderId)

      if (dbError) throw dbError

      const { error: filesDbError } = await supabase
        .from("files")
        .delete()
        .eq("path", `${currentPath}/${folderName}`.replace(/^\//, ""))
        .eq("category", category)

      if (filesDbError) throw filesDbError

      const { data: storageData, error: storageError } = await supabase.storage
        .from(category)
        .list(`${currentPath}/${folderName}`.replace(/^\//, ""))

      if (storageError) throw storageError

      const filesToDelete = storageData.map((file) => `${currentPath}/${folderName}/${file.name}`.replace(/^\//, ""))

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage.from(category).remove(filesToDelete)

        if (deleteError) throw deleteError
      }

      await fetchFoldersAndFiles()
      toast({
        title: "Cartella eliminata",
        description: `La cartella ${folderName} è stata eliminata con successo.`,
      })
    } catch (error: any) {
      console.error("Error deleting folder:", error)
      setError(`Errore nell'eliminazione della cartella: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFile = async (fileId: string, filePath: string, fileName: string) => {
    if (!isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const fullFilePath = `${filePath}/${fileName}`.replace(/^\//, "")
      console.log("Attempting to delete file:", fullFilePath)

      const { data: fileData, error: fileError } = await supabase.storage.from(category).getPublicUrl(fullFilePath)

      if (fileError) {
        console.error("Error getting file metadata:", fileError)
        throw new Error(`Error getting file metadata: ${fileError.message}`)
      }

      if (!fileData) {
        console.error("File not found in storage")
        throw new Error("File not found in storage")
      }

      const { data, error: storageError } = await supabase.storage.from(category).remove([fullFilePath])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
        throw new Error(`Error deleting file from storage: ${storageError.message}`)
      }

      if (!data || data.length === 0) {
        console.error("No files were deleted from storage")
        throw new Error("No files were deleted from storage")
      }

      console.log("File deleted from storage successfully")

      const { error: dbError } = await supabase.from("files").delete().eq("id", fileId).eq("category", category)

      if (dbError) {
        console.error("Error deleting file from database:", dbError)
        throw new Error(`Error deleting file from database: ${dbError.message}`)
      }

      console.log("File deleted from database successfully")

      await fetchFoldersAndFiles()
      toast({
        title: "File eliminato",
        description: `Il file ${fileName} è stato eliminato con successo dal database e dal bucket.`,
      })
    } catch (error: any) {
      console.error("Error in deleteFile:", error)
      setError(`Errore nell'eliminazione del file: ${error.message}`)
      toast({
        title: "Errore nell'eliminazione",
        description: `Si è verificato un errore durante l'eliminazione del file: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
      setTotalFiles(event.target.files.length)
    }
  }

  const uploadFile = useCallback(
    async (file: File) => {
      const filePath = `${currentPath}/${file.name}`.replace(/^\//, "")

      try {
        const { data: uploadData, error: storageError } = await supabase.storage
          .from(category)
          .upload(filePath, file, { upsert: true })

        if (storageError) throw storageError

        const maxOrder = Math.max(...files.map((file) => file.order), 0)
        const { data: insertData, error: dbError } = await supabase
          .from("files")
          .insert({
            name: file.name,
            path: currentPath,
            size: file.size,
            mime_type: file.type,
            description: newFileDescription,
            isHidden: false,
            date: newFileDate ? new Date(newFileDate).toISOString().split("T")[0] : null,
            category: category,
            order: maxOrder + 1,
          })
          .select()

        if (dbError) throw dbError

        return insertData[0]
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error)
        throw error
      }
    },
    [category, currentPath, newFileDate, newFileDescription, files],
  )

  const handleFileUpload = async () => {
    if (draggedFiles.length === 0 || !isAuthenticated) {
      setError("Nessun file selezionato o utente non autenticato")
      return
    }

    setError(null)
    setIsLoading(true)
    setUploadProgress({})

    // Ordina i file per nome prima di caricarli
    const sortedFiles = [...draggedFiles].sort((a, b) => a.name.localeCompare(b.name))

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i]
      try {
        const filePath = `${currentPath}/${file.name}`.replace(/^\//, "")

        const { data: uploadData, error: storageError } = await supabase.storage.from(category).upload(filePath, file, {
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: Math.round((progress.loaded / progress.total) * 100),
            }))
          },
        })

        if (storageError) throw storageError

        const { data: insertData, error: dbError } = await supabase
          .from("files")
          .insert({
            name: file.name,
            path: currentPath,
            size: file.size,
            mime_type: file.type,
            description: newFileDescription,
            isHidden: false,
            date: newFileDate ? new Date(newFileDate).toISOString().split("T")[0] : null,
            category: category,
            order: i, // Usa l'indice come ordine per mantenere l'ordinamento alfabetico iniziale
          })
          .select()

        if (dbError) throw dbError
      } catch (error: any) {
        console.error(`Failed to upload file ${file.name}:`, error)
        toast({
          title: "Errore nel caricamento",
          description: `Impossibile caricare il file ${file.name}: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    await fetchFoldersAndFiles()

    setDraggedFiles([])
    setIsFileUploadDialogOpen(false)
    setNewFileDate("")
    setNewFileDescription("")
    setIsLoading(false)
    setUploadProgress({})

    toast({
      title: "Caricamento completato",
      description: `${sortedFiles.length} file caricati con successo.`,
    })
  }

  const toggleFileVisibility = async (fileId: string, filePath: string, currentVisibility: boolean) => {
    if (!isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const newVisibility = !currentVisibility

      const { error: dbError } = await supabase
        .from("files")
        .update({ isHidden: newVisibility })
        .eq("id", fileId)
        .eq("category", category)

      if (dbError) throw dbError

      setFiles(files.map((file) => (file.id === fileId ? { ...file, isHidden: newVisibility } : file)))

      toast({
        title: newVisibility ? "File nascosto" : "File reso visibile",
        description: `Il file ${filePath.split("/").pop()} è stato ${newVisibility ? "nascosto" : "reso visibile"}.`,
      })
    } catch (error: any) {
      console.error("Error toggling file visibility:", error)
      setError(`Errore nel cambiare la visibilità del file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFolderVisibility = async (folderId: string, folderName: string, currentVisibility: boolean) => {
    if (!isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const newVisibility = !currentVisibility

      const { error: dbError } = await supabase
        .from("folders")
        .update({ is_hidden: newVisibility })
        .eq("id", folderId)
        .eq("category", category)

      if (dbError) throw dbError

      setFolders(folders.map((folder) => (folder.id === folderId ? { ...folder, is_hidden: newVisibility } : folder)))

      toast({
        title: newVisibility ? "Cartella nascosta" : "Cartella resa visibile",
        description: `La cartella ${folderName} è stata ${newVisibility ? "nascosta" : "resa visibile"}.`,
      })
    } catch (error: any) {
      console.error("Error toggling folder visibility:", error)
      setError(`Errore nel cambiare la visibilità della cartella: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMove = async () => {
    if (!fileToMove || !destinationFolder) {
      setError("Seleziona un file e una cartella di destinazione")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const oldPath = `${category}/${fileToMove.path}/${fileToMove.name}`.replace(/^\//, "")
      const newPath = `${category}/${destinationFolder}/${fileToMove.name}`.replace(/^\//, "")

      console.log("Attempting to move file:", oldPath, "to", newPath)

      const { error: moveError } = await supabase.storage.from(category).move(oldPath, newPath)

      if (moveError) {
        console.error("Error moving file in storage:", moveError)
        throw moveError
      }

      console.log("File moved successfully in storage")

      const { error: updateError } = await supabase
        .from("files")
        .update({ path: destinationFolder })
        .eq("id", fileToMove.id)
        .eq("category", category)

      if (updateError) {
        console.error("Error updating file path in database:", updateError)
        throw updateError
      }

      console.log("File path updated successfully in database")

      await fetchFoldersAndFiles()
      toast({
        title: "File spostato",
        description: `Il file ${fileToMove.name} è stato spostato in ${destinationFolder}.`,
      })
      setIsMoveDialogOpen(false)
      setFileToMove(null)
      setDestinationFolder("")
    } catch (error: any) {
      console.error("Error moving file:", error)
      setError(`Errore nello spostamento del file: ${error.message}`)
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante lo spostamento del file: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renameFile = async () => {
    if (!fileToRename || !newFileName.trim() || !isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const oldPath = `${category}/${fileToRename.path}/${fileToRename.name}`.replace(/^\//, "")
      const newPath = `${category}/${fileToRename.path}/${newFileName.trim()}`.replace(/^\//, "")

      const { error: moveError } = await supabase.storage.from(category).move(oldPath, newPath)

      if (moveError) throw moveError

      const { error: updateError } = await supabase
        .from("files")
        .update({ name: newFileName.trim() })
        .eq("id", fileToRename.id)
        .eq("category", category)

      if (updateError) throw updateError

      await fetchFoldersAndFiles()
      toast({
        title: "File rinominato",
        description: `Il file è stato rinominato da ${fileToRename.name} a ${newFileName.trim()}.`,
      })
      setIsRenameDialogOpen(false)
      setFileToRename(null)
      setNewFileName("")
    } catch (error: any) {
      console.error("Error renaming file:", error)
      setError(`Errore nel rinominare il file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileUrl = async (filePath: string) => {
    try {
      console.log("Attempting to get URL for file:", filePath)

      const fullPath = `${filePath}`.replace(/^\//, "").replace(/\/+/g, "/")
      console.log("Full path:", fullPath)

      const { data, error } = await supabase.storage.from(category).getPublicUrl(fullPath)

      if (error) {
        console.error("Error getting public URL:", error)
        throw error
      }

      if (data && data.publicUrl) {
        console.log("Category:", category)
        console.log("File path:", filePath)
        console.log("File name:", filePath.split("/").pop())
        console.log("Public URL:", data.publicUrl)
        window.open(data.publicUrl, "_blank")
      } else {
        throw new Error("Impossibile ottenere l'URL pubblico del file")
      }
    } catch (error: any) {
      console.error("Error getting file URL:", error)
      setError(`Errore nell'ottenere l'URL del file: ${error.message}`)
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const renameFolder = async () => {
    if (!folderToRename || !newFolderName2.trim() || !isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const oldPath = `${category}/${folderToRename.path}/${folderToRename.name}`.replace(/^\//, "")
      const newPath = `${category}/${folderToRename.path}/${newFolderName2.trim()}`.replace(/^\//, "")

      const { error: updateError } = await supabase
        .from("folders")
        .update({ name: newFolderName2.trim() })
        .eq("id", folderToRename.id)
        .eq("category", category)

      if (updateError) throw updateError

      const { data: files, error: listError } = await supabase.storage.from(category).list(oldPath)

      if (listError) throw listError

      for (const file of files) {
        const oldFilePath = `${oldPath}/${file.name}`
        const newFilePath = `${newPath}/${file.name}`
        const { error: moveError } = await supabase.storage.from(category).move(oldFilePath, newFilePath)

        if (moveError && moveError.message !== "The resource already exists") {
          throw moveError
        }
      }

      const { error: updateFilesError } = await supabase
        .from("files")
        .update({ path: newPath.replace(`${category}/`, "") })
        .eq("path", oldPath.replace(`${category}/`, ""))
        .eq("category", category)

      if (updateFilesError) throw updateFilesError

      await fetchFoldersAndFiles()
      toast({
        title: "Cartella rinominata",
        description: `La cartella è stata rinominata da ${folderToRename.name} a ${newFolderName2.trim()}.`,
      })
      setIsRenameFolderDialogOpen(false)
      setFolderToRename(null)
      setNewFolderName2("")
    } catch (error: any) {
      console.error("Error renaming folder:", error)
      setError(`Errore nel rinominare la cartella: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const editFile = async () => {
    if (!fileToEdit || !isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("files")
        .update({
          date: editedFileDate,
          description: editedFileDescription,
        })
        .eq("id", fileToEdit.id)
        .eq("category", category)

      if (updateError) throw updateError

      await fetchFoldersAndFiles()
      toast({
        title: "File modificato",
        description: `Il file ${fileToEdit.name} è stato modificato con successo.`,
      })
      setIsEditFileDialogOpen(false)
      setFileToEdit(null)
      setEditedFileDate("")
      setEditedFileDescription("")
    } catch (error: any) {
      console.error("Error editing file:", error)
      setError(`Errore nella modifica del file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const editFolder = async () => {
    if (!folderToEdit || !isAuthenticated) return
    setError(null)
    setIsLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("folders")
        .update({
          date: editedFolderDate,
          description: editedFolderDescription,
        })
        .eq("id", folderToEdit.id)
        .eq("category", category)

      if (updateError) throw updateError

      await fetchFoldersAndFiles()
      toast({
        title: "Cartella modificata",
        description: `La cartella ${folderToEdit.name} è stata modificata con successo.`,
      })
      setIsEditFolderDialogOpen(false)
      setFolderToEdit(null)
      setEditedFolderDate("")
      setEditedFolderDescription("")
    } catch (error: any) {
      console.error("Error editing folder:", error)
      setError(`Errore nella modifica della cartella: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sortItems = async (items: any[], itemType: "folders" | "files") => {
    const sortedItems = items.sort((a, b) => a.order - b.order)

    const updates = sortedItems.map((item, index) => ({
      id: item.id,
      order: index,
      path: item.path,
    }))

    const { error } = await supabase.from(itemType).upsert(updates, {
      onConflict: "id",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error(`Error updating ${itemType} order:`, error)
      toast({
        title: `Errore nell'aggiornamento dell'ordine`,
        description: `Si è verificato un errore durante l'aggiornamento dell'ordine degli elementi.`,
        variant: "destructive",
      })
    }

    return sortedItems
  }

  const toggleAllFilesVisibility = async () => {
    if (!isAuthenticated || !currentPath) return
    setError(null)
    setIsLoading(true)
    try {
      const newVisibility = !areAllFilesHidden
      const { data: filesToUpdate, error: fetchError } = await supabase
        .from("files")
        .select("id")
        .eq("path", currentPath)
        .eq("category", category)

      if (fetchError) throw fetchError

      if (filesToUpdate && filesToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from("files")
          .update({ isHidden: newVisibility })
          .in(
            "id",
            filesToUpdate.map((file) => file.id),
          )
          .eq("category", category)

        if (updateError) throw updateError

        setAreAllFilesHidden(newVisibility)
        await fetchFoldersAndFiles()
        toast({
          title: newVisibility ? "File nascosti" : "File resi visibili",
          description: `Tutti i file nella cartella "${currentPath.split("/").pop()}" sono stati ${
            newVisibility ? "nascosti" : "resi visibili"
          }.`,
        })
      } else {
        toast({
          title: "Nessun file da aggiornare",
          description: "Non ci sono file in questa cartella.",
        })
      }
    } catch (error: any) {
      console.error("Error toggling all files visibility:", error)
      setError(`Errore nel cambiare la visibilità dei file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const hideAllFiles = async () => {
    if (!isAuthenticated || !currentPath) return
    setError(null)
    setIsLoading(true)
    try {
      const { data: filesToHide, error: fetchError } = await supabase
        .from("files")
        .select("id")
        .eq("path", currentPath)
        .eq("category", category)
        .eq("isHidden", false)

      if (fetchError) throw fetchError

      if (filesToHide && filesToHide.length > 0) {
        const { error: updateError } = await supabase
          .from("files")
          .update({ isHidden: true })
          .in(
            "id",
            filesToHide.map((file) => file.id),
          )
          .eq("category", category)

        if (updateError) throw updateError

        await fetchFoldersAndFiles()
        toast({
          title: "File nascosti",
          description: `Tutti i file nella cartella "${currentPath.split("/").pop()}" sono stati nascosti.`,
        })
      } else {
        toast({
          title: "Nessun file da nascondere",
          description: "Non ci sono file visibili in questa cartella.",
        })
      }
    } catch (error: any) {
      console.error("Error hiding all files:", error)
      setError(`Errore nel nascondere i file: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsHideAllFilesDialogOpen(false)
    }
  }

  // Rimuovi questa funzione
  // const resetOrder = async () => {
  //   setHasManuallyReordered(false)
  //   await fetchFoldersAndFiles()
  // }

  return (
    <Card className="bg-gray-800 shadow-lg w-11/12 mx-auto">
      <CardContent className="text-gray-200 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-700">
        {/* Breadcrumb e navigazione */}
        <div className="mb-4 flex items-center flex-wrap">
          <Button
            variant="ghost"
            onClick={() => setCurrentPath("")}
            className="text-[#20a136] hover:text-[#2dc14a] font-semibold"
          >
            {category}
          </Button>
          {currentPath.split("/").map((folder, index, array) => (
            <span key={index} className="flex items-center">
              <span className="mx-2 text-[#20a136]">/</span>
              <Button
                variant="ghost"
                onClick={() => setCurrentPath(array.slice(0, index + 1).join("/"))}
                className="text-[#20a136] hover:text-[#2dc14a]"
              >
                {folder}
              </Button>
            </span>
          ))}
        </div>

        {currentPath && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={navigateUp}
              className="bg-gray-200 text-gray-800 hover:bgwhite hover:text-black"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna indietro
            </Button>
          </div>
        )}

        {/* Pulsante Nuova Cartella, Carica File e Nascondi Tutti i File */}
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex space-x-2">
            <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black">
                  <Plus size={20} className="mr-2" />
                  Nuova Cartella
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-[#f0f0f0]">Crea Nuova Cartella</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Inserisci i dettagli per la nuova cartella.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-gray-400">
                      Nome
                    </label>
                    <Input
                      id="name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-right text-gray-400">
                      Data
                    </label>
                    <Input
                      id="date"
                      type="date"
                      value={newFolderDate}
                      onChange={(e) => setNewFolderDate(e.target.value)}
                      className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right text-gray-400">
                      Descrizione
                    </label>
                    <Textarea
                      id="description"
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createFolder}
                    disabled={isLoading || !newFolderName.trim()}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
                  >
                    Crea Cartella
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isFileUploadDialogOpen} onOpenChange={setIsFileUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black">
                  <Upload size={20} className="mr-2" />
                  Carica File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600 max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-[#f0f0f0]">Carica Nuovo File</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Seleziona un file da caricare e inserisci i dettagli. I file saranno ordinati alfabeticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4 mr-[-1rem]">
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-500 p-4 text-center cursor-pointer mb-4"
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p>Rilascia i file qui...</p>
                    ) : (
                      <p>Trascina e rilascia i file qui, o clicca per selezionare i file</p>
                    )}
                  </div>
                  {draggedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-[#f0f0f0] mb-2">File selezionati (ordinati alfabeticamente):</h4>
                      <ul className="list-disc pl-5 max-h-[200px] overflow-y-auto">
                        {draggedFiles.map((file, index) => (
                          <li key={index} className="text-gray-300">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="fileDate" className="text-right text-gray-400">
                        Data
                      </label>
                      <Input
                        id="fileDate"
                        type="date"
                        value={newFileDate}
                        onChange={(e) => setNewFileDate(e.target.value)}
                        className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="fileDescription" className="text-right text-gray-400">
                        Descrizione
                      </label>
                      <Textarea
                        id="fileDescription"
                        value={newFileDescription}
                        onChange={(e) => setNewFileDescription(e.target.value)}
                        className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    onClick={handleFileUpload}
                    disabled={draggedFiles.length === 0 || isLoading}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
                  >
                    {isLoading ? "Caricamento in corso..." : "Carica File"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleAllFilesVisibility}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
                  >
                    {areAllFilesHidden ? <Eye size={20} /> : <EyeOff size={20} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{areAllFilesHidden ? "Mostra tutti i file" : "Nascondi tutti i file"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Lista cartelle */}
        <h3 className="text-xl font-semibold mb-2 text-white">Cartelle</h3>
        {folders.length === 0 ? (
          <p className="text-gray-300">Nessuna cartella presente nella cartella {currentPath || "principale"}.</p>
        ) : (
          <Reorder.Group axis="y" values={folders} onReorder={onDragEnd}>
            <AnimatePresence>
              {folders.map((folder) => (
                <Reorder.Item key={folder.id} value={folder}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`bg-gray-700 p-4 rounded-lg ${
                      folder.is_hidden ? "opacity-50" : ""
                    } hover:bg-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 cursor-move`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <GripVertical className="mr-2 text-gray-400 cursor-move" size={20} />
                        <div
                          className="flex items-center cursor-pointer hover:text-white"
                          onClick={() => navigateToFolder(folder.name)}
                        >
                          <Folder className="mr-2 text-gray-300" size={20} />
                          <span className="text-gray-200 text-lg font-semibold">{folder.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFolderToRename(folder)
                            setNewFolderName2(folder.name)
                            setIsRenameFolderDialogOpen(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 rounded-full flex flex-col items-center"
                        >
                          <Edit size={16} />
                          <span className="text-xs mt-1">Rinomina</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFolderToEdit(folder)
                            setEditedFolderDate(folder.date)
                            setEditedFolderDescription(folder.description)
                            setIsEditFolderDialogOpen(true)
                          }}
                          className="text-green-400 hover:text-green-300 rounded-full flex flex-col items-center"
                        >
                          <Edit size={16} />
                          <span className="text-xs mt-1">Modifica</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFolderVisibility(folder.id, folder.name, folder.is_hidden)}
                          className="text-yellow-400 hover:text-yellow-300 rounded-full flex flex-col items-center"
                        >
                          {folder.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
                          <span className="text-xs mt-1">{folder.is_hidden ? "Mostra" : "Nascondi"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete({ id: folder.id, name: folder.name, type: "folder" })
                            setIsDeleteConfirmOpen(true)
                          }}
                          className="text-red-400 hover:text-red-300 rounded-full flex flex-col items-center"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs mt-1">Elimina</span>
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>
                        <span className="font-semibold">Data:</span> {folder.date}
                      </p>
                      <p>
                        <span className="font-semibold">Descrizione:</span> {folder.description}
                      </p>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}

        {/* Lista file */}
        <h3 className="text-xl font-semibold mb-2 text-white">File</h3>
        {files.length === 0 ? (
          <p className="text-gray-300">Nessun file presente nella cartella {currentPath || "principale"}.</p>
        ) : (
          <Reorder.Group axis="y" values={files} onReorder={onDragEndFiles}>
            <AnimatePresence>
              {files.map((file) => (
                <Reorder.Item key={file.id} value={file}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`bg-gray-700 p-4 rounded-lg ${
                      file.isHidden ? "opacity-50" : ""
                    } hover:bg-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 cursor-move`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <GripVertical className="mr-2 text-gray-400 cursor-move" size={20} />
                        <File className="mr-2 text-gray-300" size={20} />
                        <span className="text-[#f0f0f0]">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFileToRename(file)
                            setNewFileName(file.name)
                            setIsRenameDialogOpen(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 rounded-full flex flex-col items-center"
                        >
                          <Edit size={16} />
                          <span className="text-xs mt-1">Rinomina</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFileToEdit(file)
                            setEditedFileDate(file.date || "")
                            setEditedFileDescription(file.description || "")
                            setIsEditFileDialogOpen(true)
                          }}
                          className="text-green-400 hover:text-green-300 rounded-full flex flex-col items-center"
                        >
                          <Edit size={16} />
                          <span className="text-xs mt-1">Modifica</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileVisibility(file.id, file.path, file.isHidden)}
                          className="text-yellow-400 hover:text-yellow-300 rounded-full flex flex-col items-center"
                        >
                          {file.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          <span className="text-xs mt-1">{file.isHidden ? "Mostra" : "Nascondi"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFileToMove(file)
                            setIsMoveDialogOpen(true)
                          }}
                          className="text-green-400 hover:text-green-300 rounded-full flex flex-col items-center"
                        >
                          <Move size={16} />
                          <span className="text-xs mt-1">Sposta</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => getFileUrl(`${file.path}/${file.name}`)}
                          className="text-purple-400 hover:text-purple-300 rounded-full flex flex-col items-center"
                        >
                          <Eye size={16} />
                          <span className="text-xs mt-1">Visualizza</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete({ id: file.id, name: file.name, type: "file" })
                            setIsDeleteConfirmOpen(true)
                          }}
                          className="text-red-400 hover:text-red-300 rounded-full flex flex-col items-center"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs mt-1">Elimina</span>
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>
                        <span className="font-semibold">Data:</span> {file.date || "Non specificata"}
                      </p>
                      <p>
                        <span className="font-semibold">Descrizione:</span> {file.description || "Nessuna descrizione"}
                      </p>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}

        {/* Move File Dialog */}
        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Sposta File</DialogTitle>
              <DialogDescription className="text-gray-300">
                Seleziona la cartella di destinazione per il file {fileToMove?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <select
                value={destinationFolder}
                onChange={(e) => setDestinationFolder(e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-200"
              >
                <option value="">Seleziona una cartella</option>
                {allFolders.map((folder) => (
                  <option key={folder.id} value={`${folder.path}/${folder.name}`.replace(/^\//, "")}>
                    {`${folder.path}/${folder.name}`.replace(/^\//, "")}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                onClick={handleMove}
                disabled={!destinationFolder || isLoading}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                {isLoading ? "Spostamento in corso..." : "Sposta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename File Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Rinomina File</DialogTitle>
              <DialogDescription className="text-gray-300">
                Inserisci il nuovo nome per il file {fileToRename?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-200"
                placeholder="Nuovo nome del file"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={renameFile}
                disabled={!newFileName.trim()}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Rinomina
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Folder Dialog */}
        <Dialog open={isRenameFolderDialogOpen} onOpenChange={setIsRenameFolderDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Rinomina Cartella</DialogTitle>
              <DialogDescription className="text-gray-300">
                Inserisci il nuovo nome per la cartella {folderToRename?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newFolderName2}
                onChange={(e) => setNewFolderName2(e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-200"
                placeholder="Nuovo nome della cartella"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={renameFolder}
                disabled={!newFolderName2.trim()}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Rinomina
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit File Dialog */}
        <Dialog open={isEditFileDialogOpen} onOpenChange={setIsEditFileDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Modifica File</DialogTitle>
              <DialogDescription className="text-gray-300">
                Modifica i dettagli del file {fileToEdit?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editedFileDate" className="text-right text-gray-400">
                  Data
                </label>
                <Input
                  id="editedFileDate"
                  type="date"
                  value={editedFileDate}
                  onChange={(e) => setEditedFileDate(e.target.value)}
                  className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editedFileDescription" className="text-right text-gray-400">
                  Descrizione
                </label>
                <Textarea
                  id="editedFileDescription"
                  value={editedFileDescription}
                  onChange={(e) => setEditedFileDescription(e.target.value)}
                  className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={editFile}
                disabled={isLoading}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Folder Dialog */}
        <Dialog open={isEditFolderDialogOpen} onOpenChange={setIsEditFolderDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Modifica Cartella</DialogTitle>
              <DialogDescription className="text-gray-300">
                Modifica i dettagli della cartella {folderToEdit?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editedFolderDate" className="text-right text-gray-400">
                  Data
                </label>
                <Input
                  id="editedFolderDate"
                  type="date"
                  value={editedFolderDate}
                  onChange={(e) => setEditedFolderDate(e.target.value)}
                  className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editedFolderDescription" className="text-right text-gray-400">
                  Descrizione
                </label>
                <Textarea
                  id="editedFolderDescription"
                  value={editedFolderDescription}
                  onChange={(e) => setEditedFolderDescription(e.target.value)}
                  className="col-span-3 bg-gray-600 border-gray-500 text-gray-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={editFolder}
                disabled={isLoading}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Conferma Eliminazione</DialogTitle>
              <DialogDescription className="text-gray-300">
                Sei sicuro di voler eliminare {itemToDelete?.type === "folder" ? "la cartella" : "il file"} "
                {itemToDelete?.name}"? Questa azione è irreversibile.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  if (itemToDelete?.type === "folder") {
                    deleteFolder(itemToDelete.id, itemToDelete.name)
                  } else {
                    deleteFile(itemToDelete.id, currentPath, itemToDelete.name)
                  }
                  setIsDeleteConfirmOpen(false)
                  setItemToDelete(null)
                }}
                disabled={isLoading}
              >
                Elimina
              </Button>
              <Button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Annulla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hide All Files Confirmation Dialog */}
        <Dialog open={isHideAllFilesDialogOpen} onOpenChange={setIsHideAllFilesDialogOpen}>
          <DialogContent className="bg-gray-700 text-gray-200 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-[#f0f0f0]">Conferma Nascondi Tutti</DialogTitle>
              <DialogDescription className="text-gray-300">
                Sei sicuro di voler{" "}
                {itemToHide?.type === "folder" ? "nascondere tutti i file nella cartella" : "nascondere"} "
                {itemToHide?.name}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={hideAllFiles}
                disabled={isLoading}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Nascondi
              </Button>
              <Button
                onClick={() => setIsHideAllFilesDialogOpen(false)}
                className="bg-gray-200 text-gray-800 hover:bg-white hover:text-black"
              >
                Annulla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

