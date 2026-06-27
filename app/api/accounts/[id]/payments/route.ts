import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import { authenticate } from '@/lib/apiAuth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await authenticate(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const { paymentDate, amountPaid } = await req.json()

  if (!paymentDate || !amountPaid || amountPaid <= 0)
    return NextResponse.json({ error: 'Dados de pagamento inválidos.' }, { status: 400 })

  const account = await Account.findById(id)
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })
  if (account.status !== 'open')
    return NextResponse.json({ error: 'Conta não está em aberto.' }, { status: 409 })

  const balanceCents = Math.round(account.amount * 100) - Math.round(account.totalPaid * 100)
  const paidCents = Math.round(amountPaid * 100)
  if (paidCents > balanceCents)
    return NextResponse.json({ error: `Valor excede o saldo devedor de R$ ${(balanceCents / 100).toFixed(2)}.` }, { status: 400 })

  account.payments.push({ paymentDate: new Date(paymentDate), amountPaid })
  account.totalPaid = account.payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0)
  if (account.totalPaid >= account.amount) account.status = 'paid'

  await account.save()
  return NextResponse.json(account)
}
