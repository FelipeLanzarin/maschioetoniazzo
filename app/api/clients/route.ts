import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { authenticate } from '@/lib/apiAuth'
import { validateDocument } from '@/lib/validators'

export async function GET(req: NextRequest) {
  if (!await authenticate(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  if (!await authenticate(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { name, document, email, phone, notes } = body

  if (!name || !document)
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })

  if (!validateDocument(document))
    return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 })

  const orConditions: object[] = [{ document: document.replace(/\D/g, '') }]
  if (email) orConditions.push({ email })
  const exists = await Client.findOne({ $or: orConditions })
  if (exists) return NextResponse.json({ error: 'CPF/CNPJ ou e-mail já cadastrado.' }, { status: 409 })

  const client = await Client.create({ name, document: document.replace(/\D/g, ''), email, phone, notes })
  return NextResponse.json(client, { status: 201 })
}
