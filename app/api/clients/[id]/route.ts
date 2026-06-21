import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import { getSession } from '@/lib/session'
import { validateDocument } from '@/lib/validators'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const client = await Client.findById(id)
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const body = await req.json()
  const { name, document, email, phone, notes } = body

  if (!name || !document || !email || !phone)
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })

  if (!validateDocument(document))
    return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 })

  const conflict = await Client.findOne({
    _id: { $ne: id },
    $or: [{ document: document.replace(/\D/g, '') }, { email }],
  })
  if (conflict) return NextResponse.json({ error: 'CPF/CNPJ ou e-mail já cadastrado.' }, { status: 409 })

  const client = await Client.findByIdAndUpdate(
    id,
    { name, document: document.replace(/\D/g, ''), email, phone, notes },
    { new: true }
  )
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  return NextResponse.json(client)
}
