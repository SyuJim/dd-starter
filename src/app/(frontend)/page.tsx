import type { Metadata } from 'next'

import Link from 'next/link'
import React from 'react'

/**
 * Platform landing page, served on the root domain only. Tenant sites are
 * routed by src/middleware.ts to /sites/[domain].
 */
export default function PlatformHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to DD Starter
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your multi-tenant Payload CMS platform is ready. Create a tenant in the admin panel and
          visit it on its subdomain.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Go to Admin Panel
        </Link>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          Each tenant site is served on its own subdomain or custom domain.
        </p>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Welcome | DD Starter',
  description: 'Multi-tenant Payload CMS platform',
}
