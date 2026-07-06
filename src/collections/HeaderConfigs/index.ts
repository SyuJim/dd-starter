import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { link } from '@/fields/link'
import { revalidateHeader } from '@/Header/hooks/revalidateHeader'

/**
 * Per-tenant header navigation. Registered with the multi-tenant plugin as
 * `isGlobal: true`, so each tenant gets exactly one doc and the admin shows it
 * as a global-style edit view. Replaces the former `header` Payload global.
 */
export const HeaderConfigs: CollectionConfig = {
  slug: 'headers',
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
    singular: 'Header',
    plural: 'Headers',
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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
