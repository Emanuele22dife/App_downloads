'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BucketPoliciesViewer() {
  const [policies, setPolicies] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase.rpc('get_policies', { bucket_name: 'autorizzazioni' })
      if (error) throw error
      setPolicies(data)
    } catch (err: any) {
      console.error('Error fetching policies:', err)
      setError(`Errore nel recupero delle policies: ${err.message}`)
    }
  }

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-[#20a136]">Policies del Bucket</h3>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul className="list-disc pl-5">
          {policies.map((policy, index) => (
            <li key={index} className="mb-2">
              <strong>{policy.name}:</strong> {policy.definition}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

