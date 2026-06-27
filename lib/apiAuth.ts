import { NextRequest } from 'next/server'
import { getSession } from './session'

export async function authenticate(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    if (key && key === process.env.API_KEY) return true
  }

  const session = await getSession()
  return !!session?.userId
}
