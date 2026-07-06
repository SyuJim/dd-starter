import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { superAdminOnly } from '@/access/superAdmin'
import { superAdminOrOwnTenantAdmin } from '@/access/tenantAdmins'
import { themeFields } from '@/fields/theme'
import { provisionFromTemplate } from './hooks/provisionFromTemplate'
import { revalidateTenant, revalidateTenantDelete } from './hooks/revalidateTenant'

const RESERVED_SLUGS = ['www', 'admin', 'api', 'sites', 'next', 'mail', 'app']

const normalizeDomain = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: superAdminOnly,
    delete: superAdminOnly,
    read: superAdminOrOwnTenantAdmin,
    update: superAdminOrOwnTenantAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'The subdomain this site is served on, e.g. "acme" → acme.yourdomain.com',
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string'
              ? value
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9-]+/g, '-')
                  .replace(/^-+|-+$/g, '')
              : value,
        ],
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.length === 0) return 'Slug is required'
        if (RESERVED_SLUGS.includes(value)) return `"${value}" is a reserved subdomain`
        return true
      },
    },
    {
      name: 'domains',
      type: 'array',
      admin: {
        description: 'Custom domains pointing at this site (e.g. www.acme.com). DNS must be configured separately.',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
          hooks: {
            beforeValidate: [({ value }) => (typeof value === 'string' ? normalizeDomain(value) : value)],
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Inactive sites return 404 on the frontend.',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'site-templates',
      admin: {
        position: 'sidebar',
        description: 'Site template to clone pages, navigation and theme from. Only applied when the tenant is created.',
        condition: (data) => !data?.id,
      },
    },
    themeFields(),
  ],
  hooks: {
    beforeChange: [
      // Custom domains must be globally unique across tenants.
      async ({ data, originalDoc, req }) => {
        const domains: string[] = (data?.domains ?? [])
          .map((row: { domain?: string }) => row.domain && normalizeDomain(row.domain))
          .filter(Boolean)
        if (domains.length === 0) return data

        const dupes = new Set<string>()
        for (const domain of domains) {
          if (domains.indexOf(domain) !== domains.lastIndexOf(domain)) dupes.add(domain)
        }

        const clash = await req.payload.find({
          collection: 'tenants',
          where: {
            and: [
              { 'domains.domain': { in: domains } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          req,
        })
        if (clash.docs.length > 0) {
          for (const row of clash.docs[0].domains ?? []) {
            if (row.domain && domains.includes(row.domain)) dupes.add(row.domain)
          }
        }

        if (dupes.size > 0) {
          throw new ValidationError({
            errors: [
              {
                path: 'domains',
                message: `Domain(s) already in use: ${[...dupes].join(', ')}`,
              },
            ],
          })
        }
        return data
      },
    ],
    afterChange: [provisionFromTemplate, revalidateTenant],
    afterDelete: [revalidateTenantDelete],
  },
  timestamps: true,
}
