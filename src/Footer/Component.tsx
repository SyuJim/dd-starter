import { getCachedTenantGlobal } from '@/utilities/getTenantGlobal'
import Link from 'next/link'
import React from 'react'

import type { Media, Tenant } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer({ tenant }: { tenant: Tenant }) {
  const footerData = await getCachedTenantGlobal('footers', tenant.id, 1)()

  const navItems = footerData?.navItems || []
  const logo = typeof tenant.theme?.logo === 'object' ? (tenant.theme?.logo as Media | null) : null

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          {logo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.url} alt={logo.alt || 'Logo'} className="max-h-10 w-auto" />
          ) : (
            <Logo />
          )}
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
