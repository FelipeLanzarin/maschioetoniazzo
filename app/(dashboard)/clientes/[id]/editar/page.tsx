'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { updateClient, ClientFormState } from '@/app/actions/clients'
import { DocumentInput } from '@/components/financial/DocumentInput'
import { useEffect, useState } from 'react'
import { formatDocument } from '@/lib/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditarClientePage({ params }: PageProps) {
  const { id } = use(params)
  const [client, setClient] = useState<any>(null)

  const updateClientWithId = updateClient.bind(null, id)
  const [state, action, pending] = useActionState<ClientFormState, FormData>(updateClientWithId, undefined)

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(setClient)
  }, [id])

  if (!client) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
        <Link href="/clientes" className="hover:text-slate-700 transition">Clientes</Link>
        <span>/</span>
        <Link href={`/clientes/${id}`} className="hover:text-slate-700 transition">{client.name}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Editar</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Editar Cliente</h2>

        <form action={action} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome completo / Razão social <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={client.name}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CPF / CNPJ <span className="text-red-500">*</span>
              </label>
              <DocumentInput
                name="document"
                required
                defaultValue={formatDocument(client.document)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                defaultValue={client.email}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={client.phone}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Observação</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={client.notes}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>

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
            <Link href={`/clientes/${id}`} className="text-sm text-slate-600 hover:text-slate-900 transition">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
