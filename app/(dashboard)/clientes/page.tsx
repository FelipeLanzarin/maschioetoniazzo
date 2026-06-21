import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { verifySession } from '@/lib/dal'
import { Badge } from '@/components/ui/Badge'
import { formatDocument } from '@/lib/formatters'
import { ClientSearch } from './ClientSearch'

interface PageProps {
  searchParams: Promise<{ q?: string; inativos?: string }>
}

export default async function ClientesPage({ searchParams }: PageProps) {
  await verifySession()
  await connectDB()

  const { q, inativos } = await searchParams
  const includeInactive = inativos === 'true'

  const filter: Record<string, unknown> = includeInactive ? {} : { active: true }
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { email: { $regex: q, $options: 'i' } },
    { document: { $regex: q.replace(/\D/g, ''), $options: 'i' } },
  ]

  const clients = await Client.find(filter).sort({ name: 1 }).lean()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} encontrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/clientes/novo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          Novo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <ClientSearch defaultQ={q} defaultInativos={includeInactive} />
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Documento</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">E-mail</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Telefone</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client: any) => (
                  <tr key={client._id.toString()} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${client._id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDocument(client.document)}</td>
                    <td className="px-4 py-3 text-slate-600">{client.email}</td>
                    <td className="px-4 py-3 text-slate-600">{client.phone}</td>
                    <td className="px-4 py-3">
                      <Badge label={client.active ? 'Ativo' : 'Inativo'} variant={client.active ? 'green' : 'gray'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
