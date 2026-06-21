'use server'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { createSession, deleteSession } from '@/lib/session'

export type LoginState = { error?: string } | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!name || !password) return { error: 'Preencha todos os campos.' }

  await connectDB()
  const user = await User.findOne({ name })
  if (!user) return { error: 'Usuário ou senha inválidos.' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'Usuário ou senha inválidos.' }

  await createSession(user._id.toString(), user.name)
  redirect('/contas')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
