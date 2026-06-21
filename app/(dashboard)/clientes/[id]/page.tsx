import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { verifySession } from '@/lib/dal'
import { Badge } from '@/components/ui/Badge'
import { formatDocument, formatPhone } from '@/lib/formatters'
import { DeactivateButton } from './DeactivateButton'
import { ReactivateButton } from './ReactivateButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetailPage({ params }: PageProps) {
  await verifySession()
  await connectDB()

  const { id } = await params
  const client = await Client.findById(id).lean() as any
  if (!client) notFound()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
        <Link href="/clientes" className="hover:text-slate-700 transition">Clientes</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{client.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{client.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{formatDocument(client.document)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={client.active ? 'Ativo' : 'Inativo'} variant={client.active ? 'green' : 'gray'} />
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">E-mail</dt>
            <dd className="mt-1 text-sm text-slate-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Telefone</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatPhone(client.phone)}</dd>
          </div>
          {client.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Observação</dt>
              <dd className="mt-1 text-sm text-slate-900">{client.notes}</dd>
            </div>
          )}
        </dl>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
          <Link
            href={`/clientes/${id}/editar`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Editar
          </Link>
          {client.active ? <DeactivateButton clientId={id} /> : <ReactivateButton clientId={id} />}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Contas</h3>
        <p className="text-slate-400 text-sm">Em desenvolvimento.</p>
      </div>
    </div>
  )
}
