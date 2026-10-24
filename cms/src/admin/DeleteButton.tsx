'use client'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// A plain red Delete button next to Save, so nobody has to find it in the "..." menu
export const DeleteButton = () => {
  const { id, collectionSlug, title } = useDocumentInfo()
  const { config } = useConfig()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  if (!id || !collectionSlug) return null // not shown while creating something new

  const del = async () => {
    if (!window.confirm(`Delete "${title || 'this item'}"? This cannot be undone.`)) return
    setBusy(true)
    const res = await fetch(`${config.routes.api}/${collectionSlug}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) router.push(`${config.routes.admin}/collections/${collectionSlug}`)
    else {
      setBusy(false)
      window.alert('Could not delete. You may not have permission for this item.')
    }
  }
  return (
    <button type="button" className="sac-delete" onClick={del} disabled={busy}>
      {busy ? 'Deleting...' : 'Delete'}
    </button>
  )
}
