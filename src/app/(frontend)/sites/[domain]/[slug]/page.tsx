import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { generateMeta } from '@/utilities/generateMeta'
import { getTenantByHost } from '@/utilities/getTenant'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HybridPageRenderer, type HybridPageData } from '@delmaredigital/payload-puck/render'
import { puckServerConfig } from '@/puck/config.server'
import { puckRenderLayouts } from '@/lib/puck/render-layouts'

// Tenant pages are rendered dynamically: the set of tenants (and their custom
// domains) is unbounded, so per-tenant SSG is deferred to a later iteration.
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    domain: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { domain, slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const decodedDomain = decodeURIComponent(domain)
  const url = '/' + decodedSlug
  const tenant = await getTenantByHost(decodedDomain)
  const page = await queryPageBySlug({
    domain: decodedDomain,
    slug: decodedSlug,
  })

  if (!page) {
    return <PayloadRedirects tenantId={tenant?.id} url={url} />
  }

  return (
    <article>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound tenantId={tenant?.id} url={url} />

      {draft && <LivePreviewListener />}

      <HybridPageRenderer
        page={page as unknown as HybridPageData}
        config={puckServerConfig}
        layouts={puckRenderLayouts}
        legacyRenderer={() => (
          <div className="container py-16">
            <p>This page uses a legacy format. Please edit it in the Puck editor to update.</p>
          </div>
        )}
      />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { domain, slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    domain: decodeURIComponent(domain),
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ domain, slug }: { domain: string; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const tenant = await getTenantByHost(domain)
  if (!tenant) notFound()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }],
    },
  })

  return result.docs?.[0] || null
})
