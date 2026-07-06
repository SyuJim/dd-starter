import { PayloadRequest, CollectionSlug } from 'payload'

import type { Tenant } from '@/payload-types'
import { getTenantURL } from './tenantHosts'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  /** The document's tenant (id or populated doc). Preview opens on the tenant's host. */
  tenant?: number | Tenant | null
}

export const generatePreviewPath = async ({ collection, slug, req, tenant }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  // Resolve the tenant so the preview URL points at the tenant's host — the
  // frontend can only render tenant content on a tenant domain.
  let tenantDoc: Tenant | null = null
  if (tenant && typeof tenant === 'object') {
    tenantDoc = tenant
  } else if (tenant) {
    try {
      tenantDoc = await req.payload.findByID({
        collection: 'tenants',
        id: tenant,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      tenantDoc = null
    }
  }

  const base = tenantDoc ? getTenantURL(tenantDoc) : ''

  return `${base}/next/preview?${encodedParams.toString()}`
}
