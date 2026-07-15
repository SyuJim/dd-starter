import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import React from 'react'

import { getSessionUser } from '@/utilities/getSessionUser'
import { AuthForm } from '@/components/AuthForm'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignupPage({ searchParams }: Args) {
  const { redirect: redirectTo } = await searchParams
  const user = await getSessionUser()
  if (user) {
    redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/start')
  }

  return <AuthForm mode="signup" redirectTo={redirectTo} />
}

export const metadata: Metadata = {
  title: 'Sign up',
}
