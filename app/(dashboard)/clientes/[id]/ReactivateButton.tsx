'use client'
import { useState } from 'react'
import { reactivateClient } from '@/app/actions/clients'

export function ReactivateButton({ clientId }: { clientId: string }) {
  const [pending, setPending] = useState(false)

  async function handleReactivate() {
    setPending(true)
    await reactivateClient(clientId)
  }

  return (
    <button
      onClick={handleReactivate}
      disabled={pending}
      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition disabled:opacity-50"
    >
      {pending ? 'Aguarde...' : 'Reativar cliente'}
    </button>
  )
}
