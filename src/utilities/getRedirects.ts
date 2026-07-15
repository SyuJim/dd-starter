import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function getRedirects(depth = 1, tenantId?: number) {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    depth,
    limit: 0,
    pagination: false,
    ...(tenantId ? { where: { tenant: { equals: tenantId } } } : {}),
  })

  return redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Redirects are cached per tenant so one tenant's rules never apply to another.
 */
export const getCachedRedirects = (tenantId?: number) =>
  unstable_cache(async () => getRedirects(1, tenantId), ['redirects', String(tenantId ?? 'all')], {
    tags: ['redirects'],
  })
