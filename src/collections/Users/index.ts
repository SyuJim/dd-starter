import type { CollectionConfig } from 'payload'
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    admin: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
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
    // Payload defaults to 7200s (2h) and the admin UI arms a client-side
    // force-logout timer from it. Better Auth owns the real session here, so
    // keep this aligned with session.expiresIn in src/lib/auth/config.ts
    // instead of letting Payload expire the admin out from under Better Auth.
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
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
        update: ({ req }) => req.user?.role === 'admin',
      },
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
  timestamps: true,
}
