import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import '@/models/Client'
import { getSession } from '@/lib/session'
import { startOfToday } from '@/lib/dates'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const client = searchParams.get('client')
  const clientId = searchParams.get('clientId')
  const description = searchParams.get('description')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const sortBy = searchParams.get('sortBy') || 'dueDate_asc'

  const filter: Record<string, unknown> = {}

  if (status === 'overdue') {
    filter.status = 'open'
    filter.dueDate = { $lt: startOfToday() }
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
  const sort: Record<string, 1 | -1> = { [sortMap[sortField] || 'dueDate']: sortDir === 'desc' ? -1 : 1 }

  const accounts = await Account.find(filter)
    .populate('clientId', 'name')
    .sort(sort)
    .lean()

  const today = startOfToday()
  const result = accounts.map((a: any) => ({
    ...a,
    overdue: a.status === 'open' && new Date(a.dueDate) < today,
    balance: a.amount - a.totalPaid,
  }))

  if (client) {
    return NextResponse.json(result.filter((a: any) =>
      a.clientId?.name?.toLowerCase().includes(client.toLowerCase())
    ))
  }

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { clientId, amount, description, cycle, dueDate, cycleConfig } = body

  if (!clientId || !amount || !description || !cycle)
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })

  if (cycle === 'one-time') {
    if (!dueDate) return NextResponse.json({ error: 'Data de vencimento obrigatória.' }, { status: 400 })
    const account = await Account.create({ clientId, amount, description, cycle, dueDate: new Date(dueDate), status: 'open', totalPaid: 0, payments: [] })
    return NextResponse.json(account, { status: 201 })
  }

  if (cycle === 'monthly') {
    const { dueDay, startMonth, endMonth } = cycleConfig || {}
    if (!dueDay || !startMonth || !endMonth)
      return NextResponse.json({ error: 'Configuração do ciclo mensal incompleta.' }, { status: 400 })

    const [sy, sm] = startMonth.split('-').map(Number)
    const [ey, em] = endMonth.split('-').map(Number)
    const accounts = []

    let y = sy, m = sm
    while (y < ey || (y === ey && m <= em)) {
      const lastDay = new Date(y, m, 0).getDate()
      const day = Math.min(dueDay, lastDay)
      accounts.push({ clientId, amount, description, cycle, cycleConfig, dueDate: new Date(y, m - 1, day), status: 'open', totalPaid: 0, payments: [] })
      m++
      if (m > 12) { m = 1; y++ }
    }

    const created = await Account.insertMany(accounts)
    return NextResponse.json(created, { status: 201 })
  }

  return NextResponse.json({ error: 'Ciclo inválido.' }, { status: 400 })
}
