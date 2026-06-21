import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'
import { getSession } from '@/lib/session'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const account = await Account.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
  if (!account) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })
  return NextResponse.json(account)
}
