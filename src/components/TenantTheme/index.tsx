import React from 'react'

import type { Tenant } from '@/payload-types'

type ThemeColors = NonNullable<NonNullable<Tenant['theme']>['colors']>

/** Maps theme color fields to the CSS custom properties in globals.css. */
const colorVarMap: Record<keyof ThemeColors, string> = {
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  background: '--background',
  foreground: '--foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  border: '--border',
}

// Value must be a plain CSS color/length — no braces, semicolons or url().
const isSafeCSSValue = (value: string): boolean =>
  /^[\w\s.,%#()/-]+$/.test(value) && !/url\s*\(/i.test(value)

/**
 * Injects the tenant's brand settings as CSS custom property overrides.
 * globals.css maps Tailwind tokens through these vars (@theme inline), so
 * overriding them at runtime restyles the whole site without a CSS rebuild.
 */
export function TenantThemeStyle({ theme }: { theme: Tenant['theme'] }) {
  const vars: string[] = []

  for (const [key, cssVar] of Object.entries(colorVarMap)) {
    const value = theme?.colors?.[key as keyof ThemeColors]
    if (value && isSafeCSSValue(value)) vars.push(`${cssVar}: ${value};`)
  }

  if (theme?.radius && isSafeCSSValue(theme.radius)) vars.push(`--radius: ${theme.radius};`)
  if (theme?.fonts?.body && isSafeCSSValue(theme.fonts.body)) {
    vars.push(`--font-sans: '${theme.fonts.body}', sans-serif;`)
  }

  const headingFont =
    theme?.fonts?.heading && isSafeCSSValue(theme.fonts.heading) ? theme.fonts.heading : null

  if (vars.length === 0 && !headingFont) return null

  const css = [
    vars.length > 0 ? `:root{${vars.join('')}}` : '',
    headingFont
      ? `h1,h2,h3,h4,h5,h6{font-family:'${headingFont}',var(--font-sans),sans-serif;}`
      : '',
  ].join('')

  return <style id="tenant-theme" dangerouslySetInnerHTML={{ __html: css }} />
}

/** Google Fonts stylesheet link for the tenant's chosen fonts, if any. */
export function TenantFontLinks({ theme }: { theme: Tenant['theme'] }) {
  const families = [...new Set([theme?.fonts?.heading, theme?.fonts?.body].filter(Boolean))] as string[]
  if (families.length === 0) return null

  const familyParams = families
    .map((family) => `family=${encodeURIComponent(family)}:wght@400;500;600;700`)
    .join('&')

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${familyParams}&display=swap`} />
    </>
  )
}
