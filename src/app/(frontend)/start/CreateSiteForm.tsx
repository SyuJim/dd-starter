'use client'

import Link from 'next/link'
import React, { useRef, useState, useTransition } from 'react'

import { checkSlugAvailability, createSite, type SlugAvailability } from './actions'

type TemplateOption = {
  id: number
  name: string
  description: string | null
  thumbnailUrl: string | null
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function CreateSiteForm({ templates }: { templates: TemplateOption[] }) {
  const [name, setName] = useState('')
  // The subdomain follows the name until the user edits it manually.
  const [manualSlug, setManualSlug] = useState<string | null>(null)
  const [availability, setAvailability] = useState<SlugAvailability | null>(null)
  const [checking, setChecking] = useState(false)
  const [templateId, setTemplateId] = useState<number | null>(templates[0]?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slug = manualSlug ?? slugify(name)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

  // Debounced live availability check (duplicate check), driven by input events.
  const scheduleAvailabilityCheck = (nextSlug: string) => {
    setAvailability(null)
    if (checkTimer.current) clearTimeout(checkTimer.current)
    if (!nextSlug) {
      setChecking(false)
      return
    }
    setChecking(true)
    checkTimer.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(nextSlug)
        setAvailability(result)
      } finally {
        setChecking(false)
      }
    }, 400)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createSite({ name, slug, templateId })
      if (result.ok) {
        setCreatedUrl(result.url)
      } else {
        setError(result.error)
      }
    })
  }

  if (createdUrl) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800 p-6">
        <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
          Your site is ready! 🎉
        </h2>
        <p className="text-green-800 dark:text-green-200 mb-4">
          It is live at{' '}
          <a className="underline font-medium" href={createdUrl}>
            {createdUrl}
          </a>
        </p>
        <div className="flex gap-3">
          <a
            href={createdUrl}
            className="inline-flex items-center px-4 py-2 rounded-md bg-green-700 text-white text-sm font-medium hover:bg-green-800"
          >
            Visit site
          </a>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 rounded-md border border-green-700 text-green-800 dark:text-green-200 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900"
          >
            Edit content
          </Link>
        </div>
      </div>
    )
  }

  const slugStatus = !slug
    ? null
    : checking
      ? { text: 'Checking availability…', tone: 'text-gray-500' }
      : availability?.available
        ? { text: `${availability.slug}.${rootDomain} is available ✓`, tone: 'text-green-600' }
        : availability
          ? { text: availability.reason ?? 'Not available', tone: 'text-red-600' }
          : null

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <label htmlFor="site-name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Site name
        </label>
        <input
          id="site-name"
          type="text"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (manualSlug === null) scheduleAvailabilityCheck(slugify(event.target.value))
          }}
          placeholder="My Awesome Site"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="site-slug" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Subdomain
        </label>
        <div className="flex items-center">
          <input
            id="site-slug"
            type="text"
            required
            value={slug}
            onChange={(event) => {
              const next = slugify(event.target.value)
              setManualSlug(next)
              scheduleAvailabilityCheck(next)
            }}
            placeholder="my-site"
            className="w-full rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white"
          />
          <span className="rounded-r-md border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-500 dark:text-gray-300 text-sm whitespace-nowrap">
            .{rootDomain}
          </span>
        </div>
        {slugStatus && <p className={`mt-1 text-sm ${slugStatus.tone}`}>{slugStatus.text}</p>}
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Template
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTemplateId(null)}
            className={`text-left rounded-lg border p-4 transition-colors ${
              templateId === null
                ? 'border-blue-600 ring-2 ring-blue-600/30'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <span className="font-medium text-gray-900 dark:text-white">Blank site</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start from scratch with an empty site.
            </p>
          </button>
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              className={`text-left rounded-lg border p-4 transition-colors ${
                templateId === template.id
                  ? 'border-blue-600 ring-2 ring-blue-600/30'
                  : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {template.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={template.thumbnailUrl}
                  alt=""
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
              {template.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || checking || !name || !slug || availability?.available === false}
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating…' : 'Create site'}
      </button>
    </form>
  )
}
