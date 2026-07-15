import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHeader: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    const tenantId = typeof doc.tenant === 'object' && doc.tenant ? doc.tenant.id : doc.tenant
    payload.logger.info(`Revalidating header for tenant ${tenantId}`)

    revalidateTag(`header_${tenantId}`, 'max')
  }

  return doc
}
