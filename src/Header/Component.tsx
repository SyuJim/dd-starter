import { HeaderClient } from './Component.client'
import { getCachedTenantGlobal } from '@/utilities/getTenantGlobal'
import React from 'react'

import type { Media, Tenant } from '@/payload-types'

export async function Header({ tenant }: { tenant: Tenant }) {
  const headerData = await getCachedTenantGlobal('headers', tenant.id, 1)()

  const logo = typeof tenant.theme?.logo === 'object' ? (tenant.theme?.logo as Media | null) : null

  return <HeaderClient data={headerData ?? undefined} logo={logo} />
}
