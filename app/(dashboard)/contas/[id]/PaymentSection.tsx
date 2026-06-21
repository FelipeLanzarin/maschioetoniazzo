'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { CurrencyInput } from '@/components/financial/CurrencyInput'

interface Payment { _id: string; paymentDate: string; amountPaid: number }

interface Props {
  accountId: string
  status: string
  balance: number
  payments: Payment[]
}

export function PaymentSection({ accountId, status, balance, payments }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [error, setError] = useState('')
  const [amountKey, setAmountKey] = useState(0)
  const [initialCents, setInitialCents] = useState(0)
  const [pending, setPending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const amountPaid = Number(formData.get('amountPaid'))
    const res = await fetch(`/api/accounts/${accountId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentDate: date, amountPaid }),
    })
    const data = await res.json()
    setPending(false)
    if (!res.ok) { setError(data.error); return }
    setShowForm(false)
    setInitialCents(0)
    setAmountKey(k => k + 1)
    router.refresh()
  }

  async function handleDelete(paymentId: string) {
    setDeletingId(paymentId)
    await fetch(`/api/accounts/${accountId}/payments/${paymentId}`, { method: 'DELETE' })
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Pagamentos</h3>
        {status === 'open' && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition"
          >
            + Registrar pagamento
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handlePayment} className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
            <input
              type="date" required
              value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toLocaleDateString('en-CA')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-medium text-slate-600">Valor</label>
              <button
                type="button"
                onClick={() => { setInitialCents(Math.round(balance * 100)); setAmountKey(k => k + 1) }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition"
              >
                Preencher saldo ({formatCurrency(balance)})
              </button>
            </div>
            <CurrencyInput
              key={amountKey}
              name="amountPaid"
              required
              initialCents={initialCents}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition w-40"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit" disabled={pending}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button" onClick={() => { setShowForm(false); setError('') }}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 transition"
            >
              Cancelar
            </button>
          </div>
          {error && <p className="w-full text-xs text-red-600">{error}</p>}
        </form>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Nenhum pagamento registrado.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <th className="text-left px-6 py-3">Data</th>
              <th className="text-right px-6 py-3">Valor pago</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-3 text-sm text-slate-700">{formatDate(p.paymentDate)}</td>
                <td className="px-6 py-3 text-sm text-green-700 font-medium text-right">{formatCurrency(p.amountPaid)}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleDelete(p._id)}
                    disabled={deletingId === p._id}
                    className="text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    {deletingId === p._id ? '...' : 'Excluir'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
