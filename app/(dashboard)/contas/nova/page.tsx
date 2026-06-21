'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createAccount, AccountFormState } from '@/app/actions/accounts'
import { ClientSelect } from './ClientSelect'
import { CurrencyInput } from '@/components/financial/CurrencyInput'

const inputClass = "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

function countMonths(start: string, end: string): number {
  if (!start || !end) return 0
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  const diff = (ey - sy) * 12 + (em - sm) + 1
  return diff > 0 ? diff : 0
}

export default function NovaContaPage() {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(createAccount, undefined)
  const [cycle, setCycle] = useState<'one-time' | 'monthly'>('one-time')
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')

  const monthCount = countMonths(startMonth, endMonth)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
        <Link href="/contas" className="hover:text-slate-700 transition">Contas a Receber</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Nova Conta</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Dados da Conta</h2>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <ClientSelect name="clientId" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input name="description" type="text" required placeholder="Ex: Consultoria Junho/2026" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Valor <span className="text-red-500">*</span>
            </label>
            <CurrencyInput name="amount" required className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de cobrança <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['one-time', 'monthly'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                    cycle === c
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {c === 'one-time' ? 'Avulsa' : 'Recorrente mensal'}
                </button>
              ))}
            </div>
            <input type="hidden" name="cycle" value={cycle} />
          </div>

          {cycle === 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vencimento <span className="text-red-500">*</span>
              </label>
              <input name="dueDate" type="date" required className={inputClass} />
            </div>
          )}

          {cycle === 'monthly' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Configuração mensal</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Dia do venc. <span className="text-red-500">*</span></label>
                  <input name="dueDay" type="number" required min="1" max="31" placeholder="10" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mês inicial <span className="text-red-500">*</span></label>
                  <input
                    name="startMonth" type="month" required
                    value={startMonth} onChange={e => setStartMonth(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mês final <span className="text-red-500">*</span></label>
                  <input
                    name="endMonth" type="month" required
                    value={endMonth} onChange={e => setEndMonth(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              {monthCount > 0 && (
                <p className="text-sm text-indigo-600 font-medium">
                  {monthCount} conta{monthCount !== 1 ? 's' : ''} ser{monthCount !== 1 ? 'ão' : 'á'} gerada{monthCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3.5 py-2.5">{state.error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
            <Link href="/contas" className="text-sm text-slate-600 hover:text-slate-900 transition">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
