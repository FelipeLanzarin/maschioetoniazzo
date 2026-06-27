import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import { authenticate } from '@/lib/apiAuth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  if (!await authenticate(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id, paymentId } = await params
  const account = await Account.findById(id)
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })

  account.payments = account.payments.filter((p: any) => p._id.toString() !== paymentId)
  account.totalPaid = account.payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0)
  if (account.totalPaid < account.amount && account.status === 'paid') account.status = 'open'

  await account.save()
  return NextResponse.json(account)
}
