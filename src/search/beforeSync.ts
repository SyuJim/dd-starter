import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc }) => {
  const { slug, title, meta, tenant } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    // Carry the tenant through so search results stay tenant-isolated.
    tenant: typeof tenant === 'object' && tenant ? tenant.id : tenant,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
  }

  return modifiedDoc
}
