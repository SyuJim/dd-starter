import type { CollectionAfterChangeHook } from 'payload'

import type { Tenant } from '@/payload-types'

/**
 * When a tenant is created, clone the chosen site template (pages, header,
 * footer, theme) into it. Runs with `req` so everything shares the create
 * transaction. Always ensures the tenant has header/footer docs — the
 * multi-tenant plugin treats those collections as per-tenant globals, so the
 * admin edit view expects exactly one doc per tenant.
 */
export const provisionFromTemplate: CollectionAfterChangeHook<Tenant> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' || req.context?.skipProvisioning) return doc

  const { payload } = req

  let template = null
  if (doc.template) {
    const templateId = typeof doc.template === 'object' ? doc.template.id : doc.template
    try {
      template = await payload.findByID({ collection: 'site-templates', id: templateId, req })
    } catch (error) {
      payload.logger.error({ err: error }, `Site template ${templateId} not found for tenant ${doc.slug}`)
    }
  }

  for (const page of template?.pages ?? []) {
    try {
      await payload.create({
        collection: 'pages',
        req,
        context: { skipIsHomepageHook: true, disableRevalidate: true },
        data: {
          title: page.title,
          slug: page.slug,
          pageSegment: page.pageSegment ?? page.slug,
          isHomepage: page.isHomepage ?? false,
          pageLayout: page.pageLayout ?? 'default',
          puckData: page.puckData ?? { content: [], root: {}, zones: {} },
          editorVersion: 'puck',
          tenant: doc.id,
          _status: 'published',
        },
      })
    } catch (error) {
      payload.logger.error({ err: error }, `Failed to provision page "${page.slug}" for tenant ${doc.slug}`)
    }
  }

  // Strip array-row ids so each tenant gets fresh rows — copying the
  // template's row ids verbatim would collide on the second tenant that
  // uses the same template (nav item ids are primary keys).
  const cloneNavItems = <T extends { id?: string | null }>(navItems: T[] | null | undefined) =>
    (navItems ?? []).map(({ id: _id, ...rest }) => rest)

  await payload.create({
    collection: 'headers',
    req,
    data: { tenant: doc.id, navItems: cloneNavItems(template?.header?.navItems) },
  })
  await payload.create({
    collection: 'footers',
    req,
    data: { tenant: doc.id, navItems: cloneNavItems(template?.footer?.navItems) },
  })

  if (template?.theme && !doc.theme?.colors?.primary && !doc.theme?.logo) {
    await payload.update({
      collection: 'tenants',
      id: doc.id,
      req,
      context: { skipProvisioning: true },
      data: { theme: template.theme },
    })
  }

  return doc
}
