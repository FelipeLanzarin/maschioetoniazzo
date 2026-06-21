import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import { verifySession } from '@/lib/dal'
import { AccountStatusBadge } from '@/components/financial/AccountStatusBadge'
import { PaymentSection } from './PaymentSection'
import { AccountActions } from './AccountActions'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { startOfToday } from '@/lib/dates'

interface PageProps { params: Promise<{ id: string }> }

export default async function ContaDetailPage({ params }: PageProps) {
  await verifySession()
  await connectDB()

  const { id } = await params
  const account = await Account.findById(id).populate('clientId', 'name').lean() as any
  if (!account) notFound()

  const overdue = account.status === 'open' && new Date(account.dueDate) < startOfToday()
  const balance = account.amount - account.totalPaid

  const clientId = account.clientId?._id?.toString() ?? account.clientId?.toString()
  const clientName = account.clientId?.name ?? '—'

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href="/contas" className="hover:text-slate-700 transition">Contas a Receber</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{account.description}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{account.description}</h1>
            <Link href={`/clientes/${clientId}`} className="text-sm text-indigo-600 hover:text-indigo-700 transition">
              {clientName}
            </Link>
          </div>
          <AccountStatusBadge status={account.status} overdue={overdue} />
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Valor</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(account.amount)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Pago</p>
            <p className="text-lg font-semibold text-green-700">{formatCurrency(account.totalPaid)}</p>
          </div>
          <div className={`rounded-lg p-4 ${balance > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
            <p className="text-xs text-slate-500 font-medium mb-1">Saldo</p>
            <p className={`text-lg font-semibold ${balance > 0 ? 'text-amber-700' : 'text-green-700'}`}>{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Vencimento</p>
            <p className={`font-medium ${overdue ? 'text-red-600' : 'text-slate-900'}`}>{formatDate(account.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Ciclo</p>
            <p className="font-medium text-slate-900">{account.cycle === 'monthly' ? 'Mensal' : 'Avulsa'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Criada em</p>
            <p className="font-medium text-slate-900">{formatDate(account.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
          {account.status === 'open' && (
            <Link
              href={`/contas/${id}/editar`}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Editar
            </Link>
          )}
          <AccountActions accountId={id} status={account.status} />
        </div>
      </div>

      {/* Payments */}
      <PaymentSection
        accountId={id}
        status={account.status}
        balance={balance}
        payments={account.payments.map((p: any) => ({
          _id: p._id.toString(),
          paymentDate: p.paymentDate,
          amountPaid: p.amountPaid,
        }))}
      />
    </div>
  )
}
