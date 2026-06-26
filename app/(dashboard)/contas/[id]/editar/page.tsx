'use client'
import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { updateAccount, AccountFormState } from '@/app/actions/accounts'
import { CurrencyInput } from '@/components/financial/CurrencyInput'

const inputClass = "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

interface PageProps { params: Promise<{ id: string }> }

export default function EditarContaPage({ params }: PageProps) {
  const { id } = use(params)
  const updateWithId = updateAccount.bind(null, id)
  const [state, action, pending] = useActionState<AccountFormState, FormData>(updateWithId, undefined)

  const [account, setAccount] = useState<any>(null)
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    fetch(`/api/accounts/${id}`)
      .then(r => r.json())
      .then(data => {
        setAccount(data)
        setDescription(data.description)
        setDueDate(new Date(data.dueDate).toISOString().split('T')[0])
        setPaymentMethod(data.paymentMethod ?? '')
      })
  }, [id])

  if (!account) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
        <Link href="/contas" className="hover:text-slate-700 transition">Contas a Receber</Link>
        <span>/</span>
        <Link href={`/contas/${id}`} className="hover:text-slate-700 transition">{account.description}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Editar</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Editar Conta</h2>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cliente
            </label>
            <p className="text-sm text-slate-900 px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
              {account.clientId?.name ?? '—'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              name="description" type="text" required
              value={description} onChange={e => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Valor <span className="text-red-500">*</span>
            </label>
            <CurrencyInput
              name="amount"
              required
              initialCents={Math.round(account.amount * 100)}
              className={inputClass}
            />
            {account.totalPaid > 0 && (
              <p className="text-xs text-slate-500 mt-1">Já pago: R$ {account.totalPaid.toFixed(2)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Vencimento <span className="text-red-500">*</span>
            </label>
            <input
              name="dueDate" type="date" required
              value={dueDate} onChange={e => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Forma de pagamento <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['pix', 'boleto', 'caixa'] as const).map(m => (
                <label key={m} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <input type="radio" name="paymentMethod" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} required className="sr-only" />
                  {m === 'pix' ? 'PIX' : m === 'boleto' ? 'Boleto' : 'Caixa'}
                </label>
              ))}
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3.5 py-2.5">{state.error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit" disabled={pending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
            <Link href={`/contas/${id}`} className="text-sm text-slate-600 hover:text-slate-900 transition">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
