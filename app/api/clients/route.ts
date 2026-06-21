import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { getSession } from '@/lib/session'
import { validateDocument } from '@/lib/validators'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const page = parseInt(searchParams.get('page') ?? '0')
  const limit = parseInt(searchParams.get('limit') ?? '0')
  const paginated = page > 0 && limit > 0

  const filter: Record<string, unknown> = includeInactive ? {} : { active: true }
  if (q) {
    const qDigits = q.replace(/\D/g, '')
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      ...(qDigits ? [{ document: { $regex: qDigits, $options: 'i' } }] : []),
    ]
  }

  if (!paginated) {
    const clients = await Client.find(filter).sort({ name: 1 })
    return NextResponse.json(clients)
  }

  const total = await Client.countDocuments(filter)
  const clients = await Client.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
  return NextResponse.json({ clients, hasMore: page * limit < total, total })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { name, document, email, phone, notes } = body

  if (!name || !document || !email || !phone)
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })

  if (!validateDocument(document))
    return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 })

  const exists = await Client.findOne({ $or: [{ document: document.replace(/\D/g, '') }, { email }] })
  if (exists) return NextResponse.json({ error: 'CPF/CNPJ ou e-mail já cadastrado.' }, { status: 409 })

  const client = await Client.create({ name, document: document.replace(/\D/g, ''), email, phone, notes })
  return NextResponse.json(client, { status: 201 })
}
