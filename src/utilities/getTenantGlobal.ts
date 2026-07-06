import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Footer, Header } from '@/payload-types'

type TenantGlobalSlug = 'headers' | 'footers'

const tagPrefix: Record<TenantGlobalSlug, string> = {
  headers: 'header',
  footers: 'footer',
}

async function findTenantGlobal(slug: TenantGlobalSlug, tenantId: number, depth: number) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: slug,
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

/**
 * Per-tenant replacement for getCachedGlobal: headers/footers are collections
 * with one doc per tenant (multi-tenant plugin `isGlobal`). Tag matches the
 * revalidate hooks: `header_{tenantId}` / `footer_{tenantId}`.
 */
export const getCachedTenantGlobal = <T extends TenantGlobalSlug>(
  slug: T,
  tenantId: number,
  depth = 1,
): (() => Promise<(T extends 'headers' ? Header : Footer) | null>) =>
  unstable_cache(
    async () =>
      (await findTenantGlobal(slug, tenantId, depth)) as (T extends 'headers' ? Header : Footer) | null,
    [slug, String(tenantId)],
    {
      tags: [`${tagPrefix[slug]}_${tenantId}`],
    },
  )
