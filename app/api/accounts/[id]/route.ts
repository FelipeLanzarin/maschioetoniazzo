import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import { getSession } from '@/lib/session'
import { startOfToday } from '@/lib/dates'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const account = await Account.findById(id).populate('clientId', 'name').lean() as any
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })

  return NextResponse.json({
    ...account,
    overdue: account.status === 'open' && new Date(account.dueDate) < startOfToday(),
    balance: account.amount - account.totalPaid,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const { amount, description, dueDate } = await req.json()

  if (!amount || !description || !dueDate)
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })

  const account = await Account.findById(id)
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })

  account.amount = amount
  account.description = description
  account.dueDate = new Date(dueDate)

  const balance = amount - account.totalPaid
  if (balance <= 0) account.status = 'paid'
  else if (account.status === 'paid') account.status = 'open'

  await account.save()
  return NextResponse.json(account)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const account = await Account.findByIdAndDelete(id)
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
