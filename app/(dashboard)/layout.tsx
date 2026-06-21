import { verifySession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 flex flex-col fixed inset-y-0 left-0">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-white font-bold text-base leading-tight">Maschioetoniazzo</h1>
          <p className="text-slate-400 text-xs mt-0.5">Gestão Financeira</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/contas"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Contas a Receber
          </Link>
          <Link
            href="/clientes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Clientes
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {session.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-300 text-sm font-medium truncate">{session.userName}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  )
}
