import type { CollectionConfig } from 'payload'
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth'

import { isSuperAdmin } from '@/access/superAdmin'
import { isTenantMember } from '@/access/tenantAdmins'
import type { User } from '@/payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (isSuperAdmin(req.user)) return true
      return { id: { equals: req.user.id } }
    },
    // Tenant members need panel access; the multi-tenant plugin scopes what
    // they can see inside it.
    admin: ({ req }) => isSuperAdmin(req.user) || isTenantMember(req.user as User | null),
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (isSuperAdmin(req.user)) return true
      return { id: { equals: req.user.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false },
    { name: 'name', type: 'text' },
    { name: 'image', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      options: [
        { label: 'User', value: 'user' },
        { label: 'Super Admin', value: 'admin' },
      ],
    },
    // The multi-tenant plugin appends the `tenants` array field (with
    // per-tenant roles via tenantsArrayField.rowFields in src/plugins/index.ts).
  ],
  timestamps: true,
}
