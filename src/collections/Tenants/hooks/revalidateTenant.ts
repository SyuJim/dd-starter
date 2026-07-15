import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { Tenant } from '@/payload-types'
import { getTenantHosts } from '@/utilities/tenantHosts'

/**
 * Invalidates the host→tenant lookup cache for every host the tenant was or is
 * reachable on, so domain/slug/status/theme changes take effect immediately.
 */
export const revalidateTenant: CollectionAfterChangeHook<Tenant> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const hosts = new Set<string>(getTenantHosts(doc))
  if (previousDoc?.slug) {
    for (const host of getTenantHosts(previousDoc)) hosts.add(host)
  }

  for (const host of hosts) {
    payload.logger.info(`Revalidating tenant host: ${host}`)
    revalidateTag(`tenant_host_${host}`, 'max')
  }

  return doc
}

export const revalidateTenantDelete: CollectionAfterDeleteHook<Tenant> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  for (const host of getTenantHosts(doc)) {
    payload.logger.info(`Revalidating tenant host: ${host}`)
    revalidateTag(`tenant_host_${host}`, 'max')
  }

  return doc
}
