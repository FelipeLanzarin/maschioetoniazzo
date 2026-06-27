'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatDocument } from '@/lib/formatters'

interface ClientRow {
  _id: string
  name: string
  document: string
  email: string
  phone: string
  active: boolean
}

interface Props {
  clients: ClientRow[]
}

export function ClientTable({ clients }: Props) {
  if (clients.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400 text-sm">Nenhum cliente encontrado.</p>
      </div>
    )
  }

  return (
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
          {clients.map((client) => (
            <tr key={client._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
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
  )
}
