'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ClientFilterSelect } from './ClientFilterSelect'

export function AccountFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [startDate, setStartDate] = useState(params.get('startDate') ?? '')
  const [endDate, setEndDate] = useState(params.get('endDate') ?? '')

  const update = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    sp.delete('page')
    router.replace(`/contas?${sp.toString()}`)
  }, [params, router])

  function updateDate(key: 'startDate' | 'endDate', value: string) {
    if (key === 'startDate') setStartDate(value)
    else setEndDate(value)
    update(key, value)
  }

  function clearDate(key: 'startDate' | 'endDate') {
    if (key === 'startDate') setStartDate('')
    else setEndDate('')
    update(key, '')
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <ClientFilterSelect />

      <input
        type="text"
        placeholder="Descrição..."
        defaultValue={params.get('description') ?? ''}
        onChange={e => update('description', e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition w-44"
      />

      <select
        defaultValue={params.get('status') ?? ''}
        onChange={e => update('status', e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      >
        <option value="">Em aberto</option>
        <option value="overdue">Vencidas</option>
        <option value="paid">Pagas</option>
        <option value="cancelled">Canceladas</option>
        <option value="all">Todas</option>
      </select>

      <div className="relative">
        <input
          type="date"
          title="Vencimento de"
          value={startDate}
          onChange={e => updateDate('startDate', e.target.value)}
          className="rounded-lg border border-slate-300 pl-3 pr-7 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {startDate && (
          <button
            type="button"
            onClick={() => clearDate('startDate')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base leading-none"
          >×</button>
        )}
      </div>

      <div className="relative">
        <input
          type="date"
          title="Vencimento até"
          value={endDate}
          onChange={e => updateDate('endDate', e.target.value)}
          className="rounded-lg border border-slate-300 pl-3 pr-7 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {endDate && (
          <button
            type="button"
            onClick={() => clearDate('endDate')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base leading-none"
          >×</button>
        )}
      </div>

      <select
        defaultValue={params.get('sortBy') ?? ''}
        onChange={e => update('sortBy', e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      >
        <option value="dueDate_asc">Vencimento ↑</option>
        <option value="dueDate_desc">Vencimento ↓</option>
        <option value="amount_desc">Valor ↓</option>
        <option value="amount_asc">Valor ↑</option>
      </select>
    </div>
  )
}
