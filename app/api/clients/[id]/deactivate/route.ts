import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import Account from '@/models/Account'
import { getSession } from '@/lib/session'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params

  const openAccounts = await Account.countDocuments({ clientId: id, status: 'open' })
  if (openAccounts > 0)
    return NextResponse.json({ error: 'Cliente possui contas em aberto.' }, { status: 409 })

  const client = await Client.findByIdAndUpdate(id, { active: false }, { new: true })
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  return NextResponse.json(client)
}
