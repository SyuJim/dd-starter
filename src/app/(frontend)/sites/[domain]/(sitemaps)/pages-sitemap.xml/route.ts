import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { getTenantByHost } from '@/utilities/getTenant'
import { getTenantURL } from '@/utilities/tenantHosts'

const getPagesSitemap = (domain: string) =>
  unstable_cache(
    async () => {
      const tenant = await getTenantByHost(domain)
      if (!tenant) return []

      const payload = await getPayload({ config })
      const SITE_URL = getTenantURL(tenant)

      const results = await payload.find({
        collection: 'pages',
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
          isHomepage: true,
        },
      })

      const dateFallback = new Date().toISOString()

      const defaultSitemap = [
        {
          loc: `${SITE_URL}/search`,
          lastmod: dateFallback,
        },
        {
          loc: `${SITE_URL}/posts`,
          lastmod: dateFallback,
        },
      ]

      const sitemap = results.docs
        ? results.docs
            .filter((page) => Boolean(page?.slug))
            .map((page) => {
              return {
                loc:
                  page?.isHomepage || page?.slug === 'home'
                    ? `${SITE_URL}/`
                    : `${SITE_URL}/${page?.slug}`,
                lastmod: page.updatedAt || dateFallback,
              }
            })
        : []

      return [...defaultSitemap, ...sitemap]
    },
    ['pages-sitemap', domain],
    {
      tags: [`pages-sitemap_${domain}`],
    },
  )

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params
  const sitemap = await getPagesSitemap(decodeURIComponent(domain))()

  return getServerSideSitemap(sitemap)
}
