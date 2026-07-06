import type { Access } from 'payload'

import type { User } from '@/payload-types'
import { isSuperAdmin } from './superAdmin'

type TenantRole = 'tenant-admin' | 'tenant-editor'

/** IDs of tenants where the user holds the given role (defaults to any role). */
export const getUserTenantIDs = (
  user: User | null | undefined,
  role?: TenantRole,
): (number | string)[] => {
  if (!user?.tenants) return []
  return user.tenants
    .filter((row) => (role ? row.roles?.includes(role) : true))
    .map((row) => (typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant))
    .filter((id): id is number => id !== null && id !== undefined)
}

/**
 * Grants access to super admins, or scopes the query to documents whose
 * `tenant` the user administers (per-tenant `tenant-admin` role).
 */
export const superAdminOrTenantAdmin: Access = ({ req }) => {
  const user = req.user as User | null
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const adminTenantIDs = getUserTenantIDs(user, 'tenant-admin')
  if (adminTenantIDs.length === 0) return false

  return {
    tenant: {
      in: adminTenantIDs,
    },
  }
}

/**
 * Same as `superAdminOrTenantAdmin` but for the Tenants collection itself,
 * where the constraint is on `id` rather than a `tenant` field.
 */
export const superAdminOrOwnTenantAdmin: Access = ({ req }) => {
  const user = req.user as User | null
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const adminTenantIDs = getUserTenantIDs(user, 'tenant-admin')
  if (adminTenantIDs.length === 0) return false

  return {
    id: {
      in: adminTenantIDs,
    },
  }
}

/** True when the user belongs to at least one tenant (any role). */
export const isTenantMember = (user: User | null): boolean => {
  return Boolean(user?.tenants?.length)
}
