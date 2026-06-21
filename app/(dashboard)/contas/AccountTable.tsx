'use client'
import { useRouter } from 'next/navigation'
import { AccountStatusBadge } from '@/components/financial/AccountStatusBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

interface Account {
  _id: string
  clientId?: { name: string }
  description: string
  dueDate: string
  amount: number
  totalPaid: number
  balance: number
  status: 'open' | 'paid' | 'cancelled'
  overdue: boolean
}

export function AccountTable({ accounts }: { accounts: Account[] }) {
  const router = useRouter()

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Nenhuma conta encontrada.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-100">
            <th className="text-left px-4 py-3">Cliente</th>
            <th className="text-left px-4 py-3">Descrição</th>
            <th className="text-left px-4 py-3">Vencimento</th>
            <th className="text-right px-4 py-3">Valor</th>
            <th className="text-right px-4 py-3">Pago</th>
            <th className="text-right px-4 py-3">Saldo</th>
            <th className="text-left px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {accounts.map((account) => (
            <tr
              key={account._id}
              onClick={() => router.push(`/contas/${account._id}`)}
              className={`hover:bg-slate-50 transition cursor-pointer ${account.overdue ? 'bg-red-50/40' : ''}`}
            >
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {account.clientId?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                {account.description}
              </td>
              <td className={`px-4 py-3 text-sm ${account.overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                {formatDate(account.dueDate)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                {formatCurrency(account.amount)}
              </td>
              <td className="px-4 py-3 text-sm text-green-700 text-right">
                {formatCurrency(account.totalPaid)}
              </td>
              <td className={`px-4 py-3 text-sm text-right font-medium ${account.balance > 0 ? 'text-slate-900' : 'text-green-700'}`}>
                {formatCurrency(account.balance)}
              </td>
              <td className="px-4 py-3">
                <AccountStatusBadge status={account.status} overdue={account.overdue} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
