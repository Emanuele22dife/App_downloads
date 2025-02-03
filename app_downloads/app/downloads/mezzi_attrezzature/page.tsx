import PublicFolderViewer from '../../../components/PublicFolderViewer'

export default function MezziAttrezzaturePage() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        MEZZI E ATTREZZATURE
      </h1>
      <div className="flex-grow">
        <PublicFolderViewer category="mezzi_attrezzature" />
      </div>
    </div>
  )
}

