import type { CollectionBeforeChangeHook, Config, Plugin } from 'payload'
import { HomepageConflictError } from '@delmaredigital/payload-puck/plugin'

/**
 * Patches applied AFTER multiTenantPlugin for behavior neither the Puck plugin
 * nor the multi-tenant plugin can express on its own:
 *
 * 1. The Puck-generated `pages.slug` field is unique at the DB level, which
 *    would prevent two tenants from both having `/about`. We relax it to a
 *    compound (tenant, slug) unique index.
 * 2. The Puck plugin's isHomepage uniqueness hook queries across ALL tenants.
 *    We prepend a tenant-scoped version and set `context.skipIsHomepageHook`
 *    so the original hook (which honors that flag) becomes a no-op.
 */
export const tenantScopingFixesPlugin = (): Plugin => (config: Config): Config => {
  const pages = config.collections?.find((collection) => collection.slug === 'pages')

  if (pages) {
    pages.fields = pages.fields.map((field) => {
      if ('name' in field && field.name === 'slug' && field.type === 'text') {
        return { ...field, unique: false, index: true }
      }
      return field
    })

    pages.indexes = [...(pages.indexes ?? []), { fields: ['tenant', 'slug'], unique: true }]

    pages.hooks = {
      ...pages.hooks,
      beforeChange: [tenantScopedHomepageHook, ...(pages.hooks?.beforeChange ?? [])],
    }
  }

  return config
}

/**
 * Same contract as the Puck plugin's createIsHomepageUniqueHook (including the
 * HomepageConflictError shape its admin UI handles for homepage swaps), but
 * the lookup is constrained to the document's tenant.
 */
const tenantScopedHomepageHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  collection,
  context,
}) => {
  if (context?.skipIsHomepageHook) return data

  // Set on BOTH objects: local API calls that receive `req` (like the find
  // below) replace req.context with a copy, and later hooks read the copy.
  const suppressPuckHook = () => {
    context.skipIsHomepageHook = true
    if (req.context) req.context.skipIsHomepageHook = true
  }

  const isSettingHomepage = data?.isHomepage === true
  const wasHomepage = originalDoc?.isHomepage === true
  if (!isSettingHomepage || wasHomepage) {
    // Nothing to check — also stop the Puck hook's cross-tenant check.
    suppressPuckHook()
    return data
  }

  const tenant = data?.tenant ?? originalDoc?.tenant
  const tenantId = typeof tenant === 'object' && tenant ? tenant.id : tenant

  const existingHomepage = await req.payload.find({
    collection: collection.slug,
    where: {
      and: [
        { isHomepage: { equals: true } },
        ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    req,
  })

  if (existingHomepage.docs.length > 0) {
    const existing = existingHomepage.docs[0] as { id: unknown; title?: string; slug?: string }
    throw new HomepageConflictError({
      id: String(existing.id),
      title: existing.title || 'Untitled',
      slug: existing.slug || '',
    })
  }

  // Passed the tenant-scoped check — suppress the Puck plugin's global check.
  suppressPuckHook()
  return data
}
