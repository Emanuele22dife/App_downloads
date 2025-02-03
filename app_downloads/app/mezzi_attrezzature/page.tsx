import PublicFolderViewer from "../../components/PublicFolderViewer"

export default function MezziAttrezzaturePage() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex-grow">
        <PublicFolderViewer category="mezzi_attrezzature" />
      </div>
    </div>
  )
}

