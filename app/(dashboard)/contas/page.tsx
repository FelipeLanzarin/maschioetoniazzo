import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'

import Account from '@/models/Account'
import { verifySession } from '@/lib/dal'
import { AccountFilters } from './AccountFilters'
import { AccountTable } from './AccountTable'
import { Pagination } from './Pagination'
import { startOfToday } from '@/lib/dates'

const PAGE_SIZE = 50

interface SearchParams { clientId?: string; clientName?: string; description?: string; status?: string; startDate?: string; endDate?: string; sortBy?: string; page?: string }

export default async function ContasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await verifySession()
  await connectDB()

  const sp = await searchParams
  const { clientId, description, status, startDate, endDate, sortBy = 'dueDate_asc', page: pageParam } = sp
  const page = Math.max(1, parseInt(pageParam ?? '1'))

  const filter: Record<string, unknown> = {}

  if (status === 'overdue') {
    filter.status = 'open'
    filter.dueDate = { $lt: today }
  } else if (status && status !== 'all') {
    filter.status = status
  } else if (!status) {
    filter.status = 'open'
  }

  if (clientId) filter.clientId = clientId
  if (description) filter.description = { $regex: description, $options: 'i' }
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)
    filter.dueDate = dateFilter
  }

  const [sortField, sortDir] = sortBy.split('_')
  const sortMap: Record<string, string> = { dueDate: 'dueDate', amount: 'amount' }
  const sort: Record<string, number> = { [sortMap[sortField] || 'dueDate']: sortDir === 'desc' ? -1 : 1 }

  const [total, rawAccounts] = await Promise.all([
    Account.countDocuments(filter),
    Account.find(filter)
      .populate('clientId', 'name')
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const today = startOfToday()

  let accounts = (rawAccounts as any[]).map(a => ({
    ...a,
    overdue: a.status === 'open' && new Date(a.dueDate) < today,
    balance: a.amount - a.totalPaid,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Contas a Receber</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} conta{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/contas/nova"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          + Nova Conta
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <AccountFilters />
        </div>

        <AccountTable accounts={accounts.map(a => ({ ...a, _id: a._id.toString() }))} />

        <Pagination page={page} totalPages={totalPages} total={total} />
      </div>
    </div>
  )
}
