import type { Field } from 'payload'

/**
 * Curated Google Fonts offered to tenants. The value is the family name as it
 * appears in the Google Fonts CSS2 API.
 */
export const tenantFontOptions = [
  { label: 'Geist (default)', value: '' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Noto Sans TC', value: 'Noto Sans TC' },
  { label: 'Noto Serif TC', value: 'Noto Serif TC' },
]

const colorField = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'text',
  label,
  admin: {
    description: description ?? 'Any CSS color, e.g. oklch(60% 0.2 250deg) or #3b82f6',
    placeholder: 'oklch(20.5% 0 0deg)',
  },
})

/**
 * Brand/theme settings shared by Tenants (live values) and SiteTemplates
 * (defaults applied on provisioning). Each color maps 1:1 to a CSS custom
 * property from globals.css and is injected at runtime by TenantThemeStyle.
 */
export const themeFields = (): Field => ({
  name: 'theme',
  type: 'group',
  admin: {
    description: 'Brand settings applied to this site. Leave fields empty to use platform defaults.',
  },
  fields: [
    {
      name: 'colors',
      type: 'group',
      fields: [
        colorField('primary', 'Primary'),
        colorField('primaryForeground', 'Primary Foreground'),
        colorField('background', 'Background'),
        colorField('foreground', 'Foreground'),
        colorField('accent', 'Accent'),
        colorField('accentForeground', 'Accent Foreground'),
        colorField('card', 'Card'),
        colorField('cardForeground', 'Card Foreground'),
        colorField('muted', 'Muted'),
        colorField('mutedForeground', 'Muted Foreground'),
        colorField('border', 'Border'),
      ],
    },
    {
      name: 'fonts',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'select',
          options: tenantFontOptions,
          admin: { description: 'Font used for headings' },
        },
        {
          name: 'body',
          type: 'select',
          options: tenantFontOptions,
          admin: { description: 'Font used for body text' },
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Shown in the site header and footer' },
    },
    {
      name: 'radius',
      type: 'text',
      admin: {
        description: 'Corner radius for buttons/cards, e.g. 0.625rem or 0px',
        placeholder: '0.625rem',
      },
    },
  ],
})
