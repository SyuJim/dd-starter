'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data?: Header
  logo?: Media | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, logo }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing sync with HeaderTheme provider
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  if (!data) {
    return null
  }

  return (
    <header className={`container relative z-20 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          {logo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.url} alt={logo.alt || 'Logo'} className="max-h-10 w-auto" />
          ) : (
            <Logo loading="eager" priority="high" className="invert dark:invert-0" />
          )}
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
