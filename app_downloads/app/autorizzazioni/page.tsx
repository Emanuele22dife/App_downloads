import PublicFolderViewer from "../../components/PublicFolderViewer"

export default function AutorizzazioniPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex-grow">
        <PublicFolderViewer category="autorizzazioni" />
      </div>
    </div>
  )
}

