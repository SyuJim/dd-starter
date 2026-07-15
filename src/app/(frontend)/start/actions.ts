'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getSessionUser } from '@/utilities/getSessionUser'
import { getTenantURL } from '@/utilities/tenantHosts'
import { slugifyTenantSlug, validateTenantSlug } from '@/utilities/tenantSlug'

export type SlugAvailability = {
  slug: string
  available: boolean
  reason?: string
}

/** Live subdomain availability check for the create-site form. */
export async function checkSlugAvailability(raw: string): Promise<SlugAvailability> {
  const slug = slugifyTenantSlug(raw ?? '')

  const valid = validateTenantSlug(slug)
  if (valid !== true) {
    return { slug, available: false, reason: valid }
  }

  const payload = await getPayload({ config: configPromise })
  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    return { slug, available: false, reason: 'This subdomain is already taken' }
  }

  return { slug, available: true }
}

export type CreateSiteResult =
  | { ok: true; url: string; slug: string }
  | { ok: false; error: string }

/**
 * Creates a site (tenant) for the logged-in user and makes them its
 * tenant-admin. This is the only self-serve path for tenant creation — the
 * Tenants collection itself is restricted to platform super admins.
 */
export async function createSite(input: {
  name: string
  slug: string
  templateId?: number | null
}): Promise<CreateSiteResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: 'You must be logged in to create a site.' }
  }

  const name = (input.name ?? '').trim()
  if (!name) {
    return { ok: false, error: 'Please give your site a name.' }
  }

  const availability = await checkSlugAvailability(input.slug)
  if (!availability.available) {
    return { ok: false, error: availability.reason ?? 'This subdomain is not available.' }
  }

  const payload = await getPayload({ config: configPromise })

  let tenant
  try {
    tenant = await payload.create({
      collection: 'tenants',
      overrideAccess: true,
      data: {
        name,
        slug: availability.slug,
        status: 'active',
        ...(input.templateId ? { template: input.templateId } : {}),
      },
    })
  } catch (error) {
    payload.logger.error({ err: error }, `Failed to create tenant "${availability.slug}"`)
    // Unique-constraint race: someone claimed the slug between check and create.
    return { ok: false, error: 'Could not create the site — the subdomain may have just been taken.' }
  }

  try {
    const memberships = (user.tenants ?? []).map((row) => ({
      tenant: typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant,
      roles: row.roles,
    }))

    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        tenants: [...memberships, { tenant: tenant.id, roles: ['tenant-admin'] }],
      },
    })
  } catch (error) {
    payload.logger.error({ err: error }, `Failed to assign tenant-admin for tenant ${tenant.id}`)
  }

  return { ok: true, url: getTenantURL(tenant), slug: tenant.slug }
}
