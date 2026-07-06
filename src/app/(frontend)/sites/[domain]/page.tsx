import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { generateMeta } from '@/utilities/generateMeta'
import { getTenantByHost } from '@/utilities/getTenant'
import PageClient from './[slug]/page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HybridPageRenderer, type HybridPageData } from '@delmaredigital/payload-puck/render'
import { puckServerConfig } from '@/puck/config.server'
import { puckRenderLayouts } from '@/lib/puck/render-layouts'

type Args = {
  params: Promise<{ domain: string }>
}

export default async function TenantHomePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { domain } = await paramsPromise
  const decodedDomain = decodeURIComponent(domain)

  const tenant = await getTenantByHost(decodedDomain)
  const page = await queryHomepage(decodedDomain)

  if (!page) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Coming soon</h1>
        <p className="text-muted-foreground">
          This site does not have a homepage yet. Create a page and mark it as the homepage in the
          admin panel.
        </p>
      </div>
    )
  }

  return (
    <article>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound tenantId={tenant?.id} url="/" />

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
  const { domain } = await paramsPromise
  const page = await queryHomepage(decodeURIComponent(domain))

  if (!page) {
    return { title: 'Coming soon' }
  }

  return generateMeta({ doc: page })
}

const queryHomepage = cache(async (domain: string) => {
  const { isEnabled: draft } = await draftMode()
  const tenant = await getTenantByHost(domain)
  if (!tenant) notFound()

  const payload = await getPayload({ config: configPromise })

  // First try to find a page marked as homepage
  const homepageResult = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      and: [{ isHomepage: { equals: true } }, { tenant: { equals: tenant.id } }],
    },
  })

  if (homepageResult.docs?.[0]) {
    return homepageResult.docs[0] as RequiredDataFromCollectionSlug<'pages'>
  }

  // Fallback: look for a page with slug 'home'
  const homeSlugResult = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      and: [{ slug: { equals: 'home' } }, { tenant: { equals: tenant.id } }],
    },
  })

  return (homeSlugResult.docs?.[0] as RequiredDataFromCollectionSlug<'pages'>) || null
})
