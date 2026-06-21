'use client'
import { useState } from 'react'
import { cancelAccount, deleteAccount } from '@/app/actions/accounts'

interface Props { accountId: string; status: string }

export function AccountActions({ accountId, status }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState<'cancel' | 'delete' | null>(null)

  async function handleCancel() {
    setPending('cancel')
    await cancelAccount(accountId)
    setPending(null)
    setConfirmCancel(false)
  }

  async function handleDelete() {
    setPending('delete')
    await deleteAccount(accountId)
  }

  return (
    <div className="flex items-center gap-3">
      {status === 'open' && !confirmCancel && (
        <button
          onClick={() => setConfirmCancel(true)}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
        >
          Cancelar conta
        </button>
      )}

      {confirmCancel && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Confirmar cancelamento?</span>
          <button
            onClick={handleCancel}
            disabled={pending === 'cancel'}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
          >
            {pending === 'cancel' ? 'Cancelando...' : 'Sim'}
          </button>
          <button onClick={() => setConfirmCancel(false)} className="text-sm text-slate-500 hover:text-slate-700 transition">
            Não
          </button>
        </div>
      )}

      {!confirmDelete && (
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition"
        >
          Excluir
        </button>
      )}

      {confirmDelete && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Confirmar exclusão?</span>
          <button
            onClick={handleDelete}
            disabled={pending === 'delete'}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition"
          >
            {pending === 'delete' ? 'Excluindo...' : 'Sim'}
          </button>
          <button onClick={() => setConfirmDelete(false)} className="text-sm text-slate-500 hover:text-slate-700 transition">
            Não
          </button>
        </div>
      )}
    </div>
  )
}
