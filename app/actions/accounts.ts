'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Account from '@/models/Account'

export type AccountFormState = { error?: string } | undefined

export async function createAccount(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  await connectDB()
  const clientId = formData.get('clientId') as string
  const description = formData.get('description') as string
  const amount = Number(formData.get('amount'))
  const cycle = formData.get('cycle') as string
  const dueDate = formData.get('dueDate') as string
  const dueDay = Number(formData.get('dueDay'))
  const startMonth = formData.get('startMonth') as string
  const endMonth = formData.get('endMonth') as string

  if (!clientId || !description || !amount || !cycle)
    return { error: 'Preencha todos os campos obrigatórios.' }

  if (cycle === 'one-time') {
    if (!dueDate) return { error: 'Informe a data de vencimento.' }
    await Account.create({ clientId, amount, description, cycle, dueDate: new Date(dueDate), status: 'open', totalPaid: 0, payments: [] })
    revalidatePath('/contas')
    redirect('/contas')
  }

  if (cycle === 'monthly') {
    if (!dueDay || !startMonth || !endMonth) return { error: 'Preencha as configurações do ciclo mensal.' }
    const [sy, sm] = startMonth.split('-').map(Number)
    const [ey, em] = endMonth.split('-').map(Number)
    if (ey < sy || (ey === sy && em < sm)) return { error: 'Mês final deve ser igual ou posterior ao inicial.' }
    const accounts = []
    let y = sy, m = sm
    while (y < ey || (y === ey && m <= em)) {
      const lastDay = new Date(y, m, 0).getDate()
      const day = Math.min(dueDay, lastDay)
      accounts.push({ clientId, amount, description, cycle, cycleConfig: { dueDay, startMonth, endMonth }, dueDate: new Date(y, m - 1, day), status: 'open', totalPaid: 0, payments: [] })
      m++
      if (m > 12) { m = 1; y++ }
    }
    await Account.insertMany(accounts)
    revalidatePath('/contas')
    redirect('/contas')
  }

  return { error: 'Ciclo inválido.' }
}

export async function updateAccount(id: string, _prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  await connectDB()
  const description = formData.get('description') as string
  const amount = Number(formData.get('amount'))
  const dueDate = formData.get('dueDate') as string

  if (!description || !amount || !dueDate)
    return { error: 'Preencha todos os campos obrigatórios.' }

  const account = await Account.findById(id)
  if (!account) return { error: 'Conta não encontrada.' }

  account.amount = amount
  account.description = description
  account.dueDate = new Date(dueDate)
  const balance = amount - account.totalPaid
  if (balance <= 0) account.status = 'paid'
  else if (account.status === 'paid') account.status = 'open'
  await account.save()

  revalidatePath(`/contas/${id}`)
  revalidatePath('/contas')
  redirect(`/contas/${id}`)
}

export async function cancelAccount(id: string): Promise<void> {
  await connectDB()
  await Account.findByIdAndUpdate(id, { status: 'cancelled' })
  revalidatePath(`/contas/${id}`)
  revalidatePath('/contas')
}

export async function deleteAccount(id: string): Promise<void> {
  await connectDB()
  await Account.findByIdAndDelete(id)
  revalidatePath('/contas')
  redirect('/contas')
}
