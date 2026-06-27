'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  page: number
  totalPages: number
  total: number
}

export function ClientPagination({ page, totalPages, total }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const sp = new URLSearchParams(params.toString())
    sp.set('page', String(p))
    router.replace(`/clientes?${sp.toString()}`)
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase = 'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition'

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Página {page} de {totalPages} · {total} cliente{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className={`${btnBase} text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
        >‹</button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`ellipsis-${i}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
            : <button
                key={p}
                onClick={() => goTo(p as number)}
                className={`${btnBase} ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >{p}</button>
        )}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
        >›</button>
      </div>
    </div>
  )
}
