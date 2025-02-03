import PublicFolderViewer from '../../../components/PublicFolderViewer'

export default function AutorizzazioniPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        AUTORIZZAZIONI
      </h1>
      <div className="flex-grow">
        <PublicFolderViewer category="autorizzazioni" />
      </div>
    </div>
  )
}

