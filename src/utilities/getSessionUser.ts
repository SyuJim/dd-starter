import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'

/**
 * Resolves the currently logged-in user (Better Auth session) on the server.
 * Returns null when the request carries no valid session.
 */
export const getSessionUser = async (): Promise<User | null> => {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })

  try {
    const { user } = await payload.auth({ headers })
    return (user as User) ?? null
  } catch {
    return null
  }
}
