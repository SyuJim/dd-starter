import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { getTenantByHost } from '@/utilities/getTenant'
import { getTenantURL } from '@/utilities/tenantHosts'

const getPostsSitemap = (domain: string) =>
  unstable_cache(
    async () => {
      const tenant = await getTenantByHost(domain)
      if (!tenant) return []

      const payload = await getPayload({ config })
      const SITE_URL = getTenantURL(tenant)

      const results = await payload.find({
        collection: 'posts',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        where: {
          and: [{ _status: { equals: 'published' } }, { tenant: { equals: tenant.id } }],
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      const dateFallback = new Date().toISOString()

      const sitemap = results.docs
        ? results.docs
            .filter((post) => Boolean(post?.slug))
            .map((post) => ({
              loc: `${SITE_URL}/posts/${post?.slug}`,
              lastmod: post.updatedAt || dateFallback,
            }))
        : []

      return sitemap
    },
    ['posts-sitemap', domain],
    {
      tags: [`posts-sitemap_${domain}`],
    },
  )

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params
  const sitemap = await getPostsSitemap(decodeURIComponent(domain))()

  return getServerSideSitemap(sitemap)
}
