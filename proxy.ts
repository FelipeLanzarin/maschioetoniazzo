import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const publicRoutes = ['/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = await decrypt(token)

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/contas', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
