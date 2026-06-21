'use client'
import { useState } from 'react'
import { deactivateClient } from '@/app/actions/clients'

export function DeactivateButton({ clientId }: { clientId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDeactivate() {
    setPending(true)
    setError(null)
    const result = await deactivateClient(clientId)
    if (result?.error) {
      setError(result.error)
      setPending(false)
      setConfirm(false)
    }
  }

  if (!confirm) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setConfirm(true)}
          className="text-sm text-slate-600 hover:text-red-600 transition"
        >
          Inativar cliente
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">Confirmar inativação?</span>
      <button
        onClick={handleDeactivate}
        disabled={pending}
        className="text-sm text-red-600 hover:text-red-700 font-medium transition disabled:opacity-50"
      >
        {pending ? 'Aguarde...' : 'Confirmar'}
      </button>
      <button onClick={() => setConfirm(false)} className="text-sm text-slate-500 hover:text-slate-700 transition">
        Cancelar
      </button>
    </div>
  )
}
