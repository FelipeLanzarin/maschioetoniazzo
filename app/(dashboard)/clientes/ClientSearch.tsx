'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  defaultQ?: string
  defaultInativos?: boolean
}

export function ClientSearch({ defaultQ = '', defaultInativos = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        defaultValue={defaultQ}
        onChange={(e) => updateParam('q', e.target.value || null)}
        placeholder="Buscar por nome, documento ou e-mail..."
        className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          defaultChecked={defaultInativos}
          onChange={(e) => updateParam('inativos', e.target.checked ? 'true' : null)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Exibir inativos
      </label>
    </div>
  )
}
