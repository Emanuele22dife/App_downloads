import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const folderName = formData.get('folder') as string

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const { data, error } = await supabase.storage
    .from('autorizzazioni')
    .upload(`${folderName}/${file.name}`, file)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, path: data.path })
}

