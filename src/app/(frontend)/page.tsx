import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { Tenant } from '@/payload-types'
import { getSessionUser } from '@/utilities/getSessionUser'
import { isSuperAdmin } from '@/access/superAdmin'
import { getTenantURL } from '@/utilities/tenantHosts'

export const dynamic = 'force-dynamic'

/**
 * Platform landing page, served on the root domain only. Tenant sites are
 * routed by src/proxy.ts to /sites/[domain]. Logged-in users see their sites;
 * visitors get the sign-up CTA.
 */
export default async function PlatformHomePage() {
  const user = await getSessionUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Build your website in minutes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Pick a template, claim your subdomain and start editing with a visual drag-and-drop
            editor.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const membershipTenantIds = (user.tenants ?? [])
    .map((row) => (typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant))
    .filter((id): id is number => typeof id === 'number')

  const superAdmin = isSuperAdmin(user)

  const sites =
    superAdmin || membershipTenantIds.length > 0
      ? (
          await payload.find({
            collection: 'tenants',
            where: superAdmin ? {} : { id: { in: membershipTenantIds } },
            limit: 50,
            depth: 0,
            sort: '-createdAt',
            overrideAccess: true,
          })
        ).docs
      : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {superAdmin ? 'All sites' : 'My sites'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Signed in as {user.email}</p>
          </div>
          <Link
            href="/start"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            + Create site
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don&apos;t have any sites yet.
            </p>
            <Link href="/start" className="text-blue-600 hover:underline font-medium">
              Create your first site →
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sites.map((site: Tenant) => (
              <li
                key={site.id}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{site.name}</span>
                  {site.status === 'inactive' && (
                    <span className="text-xs rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-gray-600 dark:text-gray-300">
                      Inactive
                    </span>
                  )}
                </div>
                <a
                  className="text-sm text-blue-600 hover:underline break-all"
                  href={getTenantURL(site)}
                >
                  {getTenantURL(site).replace(/^https?:\/\//, '')}
                </a>
                <div className="mt-3 flex gap-3 text-sm">
                  <a href={getTenantURL(site)} className="text-gray-700 dark:text-gray-300 hover:underline">
                    Visit
                  </a>
                  <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:underline">
                    Edit content
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'DD Starter — Build your website',
  description: 'Multi-tenant Payload CMS platform',
}
