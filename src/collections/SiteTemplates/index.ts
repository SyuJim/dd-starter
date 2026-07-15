import type { CollectionConfig, Field } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isSuperAdmin, superAdminOnly } from '@/access/superAdmin'
import { link } from '@/fields/link'
import { themeFields } from '@/fields/theme'
import { puckLayoutOptions } from '@/lib/puck/layout-options'

const navItemsField = (name: 'header' | 'footer'): Field => ({
  name,
  type: 'group',
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [link({ appearances: false })],
      maxRows: 6,
    },
  ],
})

/**
 * Whole-site starter templates (Wix/Weebly style gallery). Platform-level and
 * shared across tenants — intentionally NOT registered with the multi-tenant
 * plugin. Cloned into a tenant on creation by provisionFromTemplate.
 */
export const SiteTemplates: CollectionConfig = {
  slug: 'site-templates',
  access: {
    read: authenticated,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description'],
    group: 'Platform',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    themeFields(),
    navItemsField('header'),
    navItemsField('footer'),
    {
      name: 'pages',
      type: 'array',
      admin: {
        description: 'Pages created for the tenant when this template is applied.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'pageSegment',
          type: 'text',
          admin: { description: 'URL segment. Defaults to the slug.' },
        },
        { name: 'isHomepage', type: 'checkbox', defaultValue: false },
        {
          name: 'pageLayout',
          type: 'select',
          defaultValue: 'default',
          options: puckLayoutOptions.map(({ value, label }) => ({ value, label: String(label) })),
        },
        {
          name: 'puckData',
          type: 'json',
          admin: { description: 'Puck editor JSON for the page content.' },
        },
      ],
    },
  ],
  timestamps: true,
}
