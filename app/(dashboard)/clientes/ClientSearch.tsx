'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

interface Props {
  defaultQ?: string
  defaultInativos?: boolean
}

export function ClientSearch({ defaultQ = '', defaultInativos = false }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function handleText(value: string) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const sp = new URLSearchParams(window.location.search)
      if (value) sp.set('q', value)
      else sp.delete('q')
      sp.delete('page')
      router.replace(`/clientes?${sp.toString()}`)
    }, 300)
  }

  function handleCheckbox(checked: boolean) {
    const sp = new URLSearchParams(params.toString())
    if (checked) sp.set('inativos', 'true')
    else sp.delete('inativos')
    sp.delete('page')
    router.replace(`/clientes?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Buscar por nome, documento ou e-mail..."
        defaultValue={params.get('q') ?? ''}
        onChange={e => handleText(e.target.value)}
        className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          defaultChecked={params.get('inativos') === 'true'}
          onChange={e => handleCheckbox(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Exibir inativos
      </label>
    </div>
  )
}
