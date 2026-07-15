import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { getSessionUser } from '@/utilities/getSessionUser'
import { CreateSiteForm } from './CreateSiteForm'

export const dynamic = 'force-dynamic'

/**
 * Wix-style "create your site" flow: name + subdomain (live availability
 * check) + template gallery. Requires a logged-in user; the server action
 * assigns them as tenant-admin of the new site.
 */
export default async function StartPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login?redirect=/start')
  }

  const payload = await getPayload({ config: configPromise })
  const templates = await payload.find({
    collection: 'site-templates',
    limit: 24,
    depth: 1,
    overrideAccess: true,
    select: {
      name: true,
      description: true,
      thumbnail: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create your site
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Pick a name, claim your subdomain and choose a template to start from.
        </p>
        <CreateSiteForm
          templates={templates.docs.map((template) => ({
            id: template.id,
            name: template.name,
            description: template.description ?? null,
            thumbnailUrl:
              typeof template.thumbnail === 'object' && template.thumbnail
                ? (template.thumbnail.url ?? null)
                : null,
          }))}
        />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Create your site',
}
