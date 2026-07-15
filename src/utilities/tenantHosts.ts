import type { Tenant } from '@/payload-types'

export const getRootDomain = (): string =>
  (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000').toLowerCase()

/** All hosts (subdomain + custom domains) a tenant is reachable on. */
export const getTenantHosts = (
  tenant: Pick<Tenant, 'slug' | 'domains'>,
): string[] => {
  const hosts = [`${tenant.slug}.${getRootDomain()}`]
  for (const row of tenant.domains ?? []) {
    if (row.domain) hosts.push(row.domain.toLowerCase())
  }
  return hosts
}

/** Primary public host for a tenant: first custom domain, else the subdomain. */
export const getTenantPrimaryHost = (tenant: Pick<Tenant, 'slug' | 'domains'>): string => {
  const custom = tenant.domains?.find((row) => row.domain)?.domain
  return (custom ?? `${tenant.slug}.${getRootDomain()}`).toLowerCase()
}

export const getTenantURL = (tenant: Pick<Tenant, 'slug' | 'domains'>): string => {
  const protocol = getRootDomain().startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${getTenantPrimaryHost(tenant)}`
}
