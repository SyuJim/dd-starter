/**
 * Seeds starter site templates for the tenant template gallery.
 *
 * Run with: pnpm payload run scripts/seed-templates.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const starterPuckPage = (heading: string, text: string) => ({
  root: { props: { title: heading } },
  content: [
    {
      type: 'Section',
      props: {
        id: `section-${Math.random().toString(36).slice(2, 10)}`,
        padding: '64px',
      },
    },
    {
      type: 'Heading',
      props: {
        id: `heading-${Math.random().toString(36).slice(2, 10)}`,
        text: heading,
        size: 'xxl',
        align: 'center',
      },
    },
    {
      type: 'Text',
      props: {
        id: `text-${Math.random().toString(36).slice(2, 10)}`,
        text,
        align: 'center',
      },
    },
  ],
  zones: {},
})

async function run() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'site-templates',
    limit: 1,
    where: { name: { equals: 'Business Starter' } },
  })

  if (existing.docs.length > 0) {
    payload.logger.info('Site templates already seeded, skipping.')
    process.exit(0)
  }

  await payload.create({
    collection: 'site-templates',
    data: {
      name: 'Business Starter',
      description: 'A simple business site: home, about and contact pages with a clean light theme.',
      theme: {
        colors: {
          primary: 'oklch(45% 0.18 260deg)',
          primaryForeground: 'oklch(98.5% 0 0deg)',
        },
        fonts: { heading: 'Montserrat', body: 'Inter' },
        radius: '0.625rem',
      },
      header: {
        navItems: [
          { link: { type: 'custom', label: 'About', url: '/about' } },
          { link: { type: 'custom', label: 'Contact', url: '/contact' } },
        ],
      },
      footer: {
        navItems: [{ link: { type: 'custom', label: 'About', url: '/about' } }],
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          isHomepage: true,
          pageLayout: 'landing',
          puckData: starterPuckPage('Welcome to your new site', 'Edit this page in the visual editor to make it your own.'),
        },
        {
          title: 'About',
          slug: 'about',
          pageLayout: 'default',
          puckData: starterPuckPage('About us', 'Tell your visitors who you are and what you do.'),
        },
        {
          title: 'Contact',
          slug: 'contact',
          pageLayout: 'default',
          puckData: starterPuckPage('Contact', 'Add your contact details here.'),
        },
      ],
    },
  })

  await payload.create({
    collection: 'site-templates',
    data: {
      name: 'Portfolio Starter',
      description: 'A minimal one-page portfolio with a dark accent theme.',
      theme: {
        colors: {
          primary: 'oklch(70% 0.15 40deg)',
          primaryForeground: 'oklch(14.5% 0 0deg)',
        },
        fonts: { heading: 'Playfair Display', body: 'Lato' },
        radius: '0px',
      },
      header: { navItems: [] },
      footer: { navItems: [] },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          isHomepage: true,
          pageLayout: 'full-width',
          puckData: starterPuckPage('Your name here', 'A short introduction about your work.'),
        },
      ],
    },
  })

  payload.logger.info('Seeded 2 site templates.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
