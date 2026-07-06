import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { link } from '@/fields/link'
import { revalidateFooter } from '@/Footer/hooks/revalidateFooter'

/**
 * Per-tenant footer navigation. Registered with the multi-tenant plugin as
 * `isGlobal: true` — one doc per tenant. Replaces the former `footer` global.
 */
export const FooterConfigs: CollectionConfig = {
  slug: 'footers',
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    group: 'Site',
  },
  labels: {
    singular: 'Footer',
    plural: 'Footers',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
