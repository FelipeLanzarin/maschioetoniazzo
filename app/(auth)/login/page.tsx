'use client'
import { useActionState } from 'react'
import { login, LoginState } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Maschioetoniazzo
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sistema de Gestão Financeira</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Usuário
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Nome de usuário"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3.5 py-2.5">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {pending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
