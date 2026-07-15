import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Tenant } from '@/payload-types'
import { getRootDomain } from './tenantHosts'

/**
 * Resolves the tenant serving a given host. Subdomains of ROOT_DOMAIN match on
 * the tenant slug; any other host matches on custom domains. Cached per host
 * and invalidated by the Tenants afterChange hook (tag `tenant_host_{host}`).
 */
export const getTenantByHost = (host: string): Promise<Tenant | null> => {
  const normalizedHost = host.toLowerCase()

  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const root = getRootDomain()

      const hostWhere: Where = normalizedHost.endsWith(`.${root}`)
        ? { slug: { equals: normalizedHost.slice(0, -(root.length + 1)) } }
        : { 'domains.domain': { equals: normalizedHost } }

      const result = await payload.find({
        collection: 'tenants',
        where: {
          and: [hostWhere, { status: { equals: 'active' } }],
        },
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })

      return result.docs[0] ?? null
    },
    ['tenant-by-host', normalizedHost],
    { tags: [`tenant_host_${normalizedHost}`] },
  )()
}
