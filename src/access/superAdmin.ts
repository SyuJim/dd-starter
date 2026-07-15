import type { Access, ClientUser, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

/**
 * The existing Better Auth `role` field doubles as the platform role:
 * `admin` = super admin (full access to every tenant), `user` = regular user
 * whose access is scoped by their tenant memberships.
 */
export const isSuperAdmin = (user: User | ClientUser | PayloadRequest['user']): boolean => {
  return user?.role === 'admin'
}

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user)
