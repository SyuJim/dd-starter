'use client'

import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
  mode: 'login' | 'signup'
  redirectTo?: string
}

/** Calls a Better Auth REST endpoint and returns an error message, if any. */
async function callAuthEndpoint(path: string, body: Record<string, string>): Promise<string | null> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.ok) return null
  const data = (await response.json().catch(() => null)) as { message?: string } | null
  return data?.message ?? 'Something went wrong. Please try again.'
}

/** Email/password auth form for the platform (root domain) pages. */
export function AuthForm({ mode, redirectTo }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : mode === 'signup'
        ? '/start'
        : '/'

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const errorMessage =
        mode === 'signup'
          ? await callAuthEndpoint('/api/auth/sign-up/email', { name, email, password })
          : await callAuthEndpoint('/api/auth/sign-in/email', { email, password })

      if (errorMessage) {
        setError(errorMessage)
        return
      }
      window.location.assign(safeRedirect)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <Link className="text-blue-600 hover:underline" href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}>
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link className="text-blue-600 hover:underline" href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}>
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
