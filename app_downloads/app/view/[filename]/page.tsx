'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import dynamic from 'next/dynamic'

const DynamicPDFViewer = dynamic(() => import('../../../components/PDFViewer'), {
  ssr: false,
})

export default function ViewPdf({ params }: { params: { filename: string } }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPdfUrl() {
      const { data } = await supabase.storage
        .from('autorizzazioni')
        .getPublicUrl(decodeURIComponent(params.filename))
      
      if (data) {
        setUrl(data.publicUrl)
      }
    }

    fetchPdfUrl()
  }, [params.filename])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{decodeURIComponent(params.filename)}</h1>
      {url && <DynamicPDFViewer url={url} />}
    </div>
  )
}

