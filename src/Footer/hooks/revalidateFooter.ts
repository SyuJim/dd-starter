import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateFooter: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    const tenantId = typeof doc.tenant === 'object' && doc.tenant ? doc.tenant.id : doc.tenant
    payload.logger.info(`Revalidating footer for tenant ${tenantId}`)

    revalidateTag(`footer_${tenantId}`, 'max')
  }

  return doc
}
