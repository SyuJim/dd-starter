import React from 'react'
import { notFound } from 'next/navigation'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { TenantFontLinks, TenantThemeStyle } from '@/components/TenantTheme'
import { getTenantByHost } from '@/utilities/getTenant'

type Args = {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

/**
 * Layout for tenant sites. Only reachable via the middleware rewrite
 * host → /sites/[domain]; resolves the tenant once and wraps the page in the
 * tenant's chrome (theme vars, fonts, header, footer).
 */
export default async function TenantLayout({ children, params: paramsPromise }: Args) {
  const { domain } = await paramsPromise
  const tenant = await getTenantByHost(decodeURIComponent(domain))

  if (!tenant) {
    notFound()
  }

  return (
    <>
      <TenantFontLinks theme={tenant.theme} />
      <TenantThemeStyle theme={tenant.theme} />
      <Header tenant={tenant} />
      {children}
      <Footer tenant={tenant} />
    </>
  )
}
