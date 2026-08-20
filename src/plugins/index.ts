import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { pageTreePlugin } from '@delmaredigital/payload-page-tree'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'
import { puckLayoutOptions } from '@/lib/puck/layout-options'
import {
  betterAuthCollections,
  createBetterAuthPlugin,
  payloadAdapter,
} from '@delmaredigital/payload-better-auth'
import { betterAuthOptions } from '@/lib/auth/config'
import { betterAuth } from 'better-auth'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | DD Starter` : 'DD Starter'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // Better Auth - collections must come before createBetterAuthPlugin
  betterAuthCollections({
    betterAuthOptions,
    skipCollections: ['user'], // We define Users ourselves
  }),
  // Initialize Better Auth with auto-injected endpoints and admin components
  createBetterAuthPlugin({
    createAuth: (payload) =>
      betterAuth({
        ...betterAuthOptions,
        database: payloadAdapter({
          payloadClient: payload,
          adapterConfig: {
            enableDebugLogs: false,
          },
        }),
        // For Payload's default SERIAL IDs:
        advanced: {
          database: {
            generateId: 'serial',
          },
        },
        secret: process.env.BETTER_AUTH_SECRET,
        // Better Auth only reads BETTER_AUTH_URL from the environment on its
        // own — not BETTER_AUTH_BASE_URL. Without a baseURL it derives the
        // origin from each incoming request, which makes cookies, callbacks
        // and redirects unstable across deploys. Set it explicitly.
        baseURL:
          process.env.BETTER_AUTH_URL ||
          process.env.BETTER_AUTH_BASE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          getServerSideURL(),
        trustedOrigins: [
          'http://localhost:3000',
          'https://localhost:3000',
          process.env.NEXT_PUBLIC_APP_URL,
          // Vercel preview/production deployments get a generated hostname that
          // is not in NEXT_PUBLIC_APP_URL; without these, sign-in on a preview
          // URL is rejected as an untrusted origin.
          process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
          process.env.VERCEL_PROJECT_PRODUCTION_URL &&
            `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
        ].filter(Boolean) as string[],
      }),
    admin: {
      betterAuthOptions, // Required for management UI auto-detection
      // payload-better-auth 0.9+: the default login view no longer imports the
      // optional passkey peer. Point at the passkey-enabled wrapper to keep
      // passkey sign-in on the admin login.
      loginViewComponent:
        '@delmaredigital/payload-better-auth/components/login-passkey#LoginViewWrapperWithPasskey',
      login: {
        enablePasskey: true, // Enable passkey sign-in option
        afterLoginPath: '/admin/page-tree', // Redirect to page tree after login
      },
      apiKey: {
        requiredRole: 'admin',
      },
    },
  }),
  // Puck - visual page editor (must run BEFORE page-tree so Pages collection exists)
  createPuckPlugin({
    pagesCollection: 'pages',
    layouts: puckLayoutOptions,
    editorStylesheet: 'src/app/(frontend)/globals.css',
    editorStylesheetCompiled: '/puck-editor-styles.css', // Pre-compiled by withPuckCSS at build time
  }),
  // Page Tree - hierarchical URL management (runs after Puck creates Pages)
  pageTreePlugin({
    collections: ['pages', 'posts'],
    folderSlug: 'payload-folders',
    segmentFieldName: 'pathSegment',
    pageSegmentFieldName: 'pageSegment',
  }),
  // Redirects
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  // SEO
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  // Search
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
