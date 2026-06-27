import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { verifySession } from '@/lib/dal'
import { ClientSearch } from './ClientSearch'
import { ClientTable } from './ClientTable'
import { ClientPagination } from './ClientPagination'
import Link from 'next/link'

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{ q?: string; inativos?: string; page?: string }>
}

export default async function ClientesPage({ searchParams }: PageProps) {
  await verifySession()
  await connectDB()

  const { q, inativos, page: pageParam } = await searchParams
  const includeInactive = inativos === 'true'
  const page = Math.max(1, parseInt(pageParam ?? '1'))

  const filter: Record<string, unknown> = includeInactive ? {} : { active: true }
  if (q) {
    const docQ = q.replace(/\D/g, '')
    const $or: object[] = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ]
    if (docQ) $or.push({ document: { $regex: docQ, $options: 'i' } })
    filter.$or = $or
  }

  const [total, rawClients] = await Promise.all([
    Client.countDocuments(filter),
    Client.find(filter).sort({ name: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
  ])

  const clients = (rawClients as any[]).map(c => ({
    _id: String(c._id),
    name: String(c.name),
    document: String(c.document),
    email: String(c.email ?? ''),
    phone: String(c.phone ?? ''),
    active: Boolean(c.active),
  }))

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{total} cliente{total !== 1 ? 's' : ''}</p>
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

        <ClientTable clients={clients} />

        <ClientPagination page={page} totalPages={totalPages} total={total} />
      </div>
    </div>
  )
}
