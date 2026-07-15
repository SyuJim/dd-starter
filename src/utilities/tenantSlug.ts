/** Subdomains that can never be claimed by a tenant. */
export const RESERVED_SLUGS = ['www', 'admin', 'api', 'sites', 'next', 'mail', 'app']

export const slugifyTenantSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const validateTenantSlug = (value: string): string | true => {
  if (!value) return 'Subdomain is required'
  if (value.length < 2) return 'Subdomain must be at least 2 characters'
  if (value.length > 63) return 'Subdomain must be at most 63 characters'
  if (RESERVED_SLUGS.includes(value)) return `"${value}" is a reserved subdomain`
  return true
}
