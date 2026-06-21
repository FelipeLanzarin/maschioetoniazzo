'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Client { _id: string; name: string; document: string }

interface Props {
  defaultValue?: string
  name?: string
  required?: boolean
}

const PAGE_SIZE = 20

function formatDoc(doc: string): string {
  const d = doc.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return doc
}

export function ClientSelect({ defaultValue = '', name = 'clientId', required }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentSearch = useRef('')
  const currentPage = useRef(1)

  const fetchClients = useCallback(async (q: string, p: number, reset: boolean) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
    if (q) params.set('q', q)
    const res = await fetch(`/api/clients?${params}`)
    const data = await res.json()
    setClients(prev => reset ? data.clients : [...prev, ...data.clients])
    setHasMore(data.hasMore)
    setLoading(false)
  }, [])

  function openModal() {
    setOpen(true)
    setSearch('')
    setClients([])
    setPage(1)
    setHasMore(true)
    currentSearch.current = ''
    currentPage.current = 1
    fetchClients('', 1, true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function handleSearch(q: string) {
    setSearch(q)
    currentSearch.current = q
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setClients([])
      setPage(1)
      currentPage.current = 1
      setHasMore(true)
      fetchClients(q, 1, true)
    }, 300)
  }

  function handleSelect(client: Client) {
    setSelected(client)
    setOpen(false)
  }

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!open) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        setHasMore(prev => {
          if (!prev) return prev
          const nextPage = currentPage.current + 1
          currentPage.current = nextPage
          setPage(nextPage)
          fetchClients(currentSearch.current, nextPage, false)
          return prev
        })
      }
    }, { threshold: 0.1 })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [open, loading, fetchClients])

  // Load default client name on edit
  useEffect(() => {
    if (defaultValue && !selected) {
      fetch(`/api/clients/${defaultValue}`)
        .then(r => r.json())
        .then(data => { if (data?._id) setSelected(data) })
    }
  }, [defaultValue])

  return (
    <>
      <input type="hidden" name={name} value={selected?._id ?? ''} />

      <button
        type="button"
        onClick={openModal}
        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition flex items-center justify-between gap-2"
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.name : 'Selecionar cliente...'}
        </span>
        {selected && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); setSelected(null) }}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >×</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col h-[70vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Selecionar Cliente</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >×</button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar por nome ou documento..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {clients.length === 0 && !loading && (
                <p className="text-center text-slate-400 text-sm py-10">Nenhum cliente encontrado.</p>
              )}

              {clients.map(client => (
                <button
                  key={client._id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 transition border-b border-slate-50 last:border-0"
                >
                  <p className="text-sm font-medium text-slate-900">{client.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDoc(client.document)}</p>
                </button>
              ))}

              {/* Sentinel + spinner */}
              <div ref={sentinelRef} className="h-10 flex items-center justify-center">
                {loading && (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
