import { NextRequest, NextResponse } from 'next/server'

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000').toLowerCase()

/**
 * Host-based tenant routing (Next.js proxy, formerly middleware). Requests to
 * a tenant host (subdomain of ROOT_DOMAIN or a custom domain) are rewritten to
 * the internal /sites/[domain] route tree, where the layout resolves the
 * tenant from the database. The proxy itself never touches the DB (edge-safe).
 */
export function proxy(req: NextRequest): NextResponse {
  const host = (req.headers.get('host') ?? '').toLowerCase()
  const { pathname } = req.nextUrl
  const isRootHost = host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`

  // The Payload admin only exists on the root (platform) domain. Tenant
  // hosts redirect to it so no subdomain ever serves the admin UI.
  if (pathname.startsWith('/admin') && !isRootHost) {
    const url = req.nextUrl.clone()
    url.host = ROOT_DOMAIN
    return NextResponse.redirect(url)
  }

  // Admin, Payload API, preview and Next internals always run on their own
  // paths regardless of host. Static files (contain a dot) pass through too,
  // except tenant sitemaps which must reach the tenant route tree.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/_next') ||
    (pathname.includes('.') && !pathname.endsWith('-sitemap.xml'))
  ) {
    return NextResponse.next()
  }

  // Root domain (and www) serves the platform pages untouched.
  if (isRootHost) {
    // Block direct access to the internal /sites tree on the root domain.
    if (pathname.startsWith('/sites/')) {
      return NextResponse.rewrite(new URL('/not-found', req.url))
    }
    return NextResponse.next()
  }

  // Any other host is a tenant site: subdomain or custom domain.
  return NextResponse.rewrite(new URL(`/sites/${host}${pathname}`, req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)'],
}
