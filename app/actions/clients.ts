'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import Account from '@/models/Account'
import { validateDocument } from '@/lib/validators'

export type ClientFormState = { error?: string } | undefined

export async function createClient(state: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const notes = formData.get('notes') as string

  if (!name || !document) return { error: 'Preencha todos os campos obrigatórios.' }
  if (!validateDocument(document)) return { error: 'CPF ou CNPJ inválido.' }

  await connectDB()
  const orConditions: object[] = [{ document: document.replace(/\D/g, '') }]
  if (email) orConditions.push({ email })
  const exists = await Client.findOne({ $or: orConditions })
  if (exists) return { error: 'CPF/CNPJ ou e-mail já cadastrado.' }

  await Client.create({ name, document: document.replace(/\D/g, ''), email, phone, notes })
  redirect('/clientes')
}

export async function updateClient(id: string, state: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const notes = formData.get('notes') as string

  if (!name || !document) return { error: 'Preencha todos os campos obrigatórios.' }
  if (!validateDocument(document)) return { error: 'CPF ou CNPJ inválido.' }

  await connectDB()
  const orConditions: object[] = [{ document: document.replace(/\D/g, '') }]
  if (email) orConditions.push({ email })
  const conflict = await Client.findOne({ _id: { $ne: id }, $or: orConditions })
  if (conflict) return { error: 'CPF/CNPJ ou e-mail já cadastrado.' }

  await Client.findByIdAndUpdate(id, { name, document: document.replace(/\D/g, ''), email, phone, notes })
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}

export async function deactivateClient(id: string): Promise<ClientFormState> {
  await connectDB()
  const openAccounts = await Account.countDocuments({ clientId: id, status: 'open' })
  if (openAccounts > 0) return { error: 'Cliente possui contas em aberto e não pode ser inativado.' }
  await Client.findByIdAndUpdate(id, { active: false })
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
  return undefined
}

export async function reactivateClient(id: string): Promise<void> {
  await connectDB()
  await Client.findByIdAndUpdate(id, { active: true })
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
}
