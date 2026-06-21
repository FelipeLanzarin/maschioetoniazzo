'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createClient, ClientFormState } from '@/app/actions/clients'
import { DocumentInput } from '@/components/financial/DocumentInput'

const inputClass = "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

export default function NovoClientePage() {
  const [state, action, pending] = useActionState<ClientFormState, FormData>(createClient, undefined)

  const [fields, setFields] = useState({ name: '', email: '', phone: '', notes: '' })

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
        <Link href="/clientes" className="hover:text-slate-700 transition">Clientes</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Novo Cliente</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Dados do Cliente</h2>

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
                value={fields.name}
                onChange={update}
                className={inputClass}
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                CPF / CNPJ <span className="text-red-500">*</span>
              </label>
              <DocumentInput
                name="document"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                value={fields.email}
                onChange={update}
                className={inputClass}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                required
                value={fields.phone}
                onChange={update}
                className={inputClass}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Observação
              </label>
              <textarea
                name="notes"
                rows={3}
                value={fields.notes}
                onChange={update}
                className={`${inputClass} resize-none`}
                placeholder="Observações sobre o cliente (opcional)"
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
            <Link href="/clientes" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
