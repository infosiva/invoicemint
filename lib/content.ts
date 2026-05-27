import { get } from '@vercel/edge-config'

export interface ContentOverrides {
  headline?: string
  subheadline?: string
  cta?: string
  tagline?: string
}

const SITE_ID = 'invoicemint'
const CACHE: { data: ContentOverrides; ts: number } | null = null
const TTL = 60_000

export async function getContentOverrides(): Promise<ContentOverrides> {
  if (CACHE && Date.now() - CACHE.ts < TTL) return CACHE.data
  try {
    const [headline, subheadline, cta, tagline] = await Promise.all([
      get<string>(`content_${SITE_ID}_headline`),
      get<string>(`content_${SITE_ID}_subheadline`),
      get<string>(`content_${SITE_ID}_cta`),
      get<string>(`content_${SITE_ID}_tagline`),
    ])
    const data: ContentOverrides = {}
    if (headline) data.headline = headline
    if (subheadline) data.subheadline = subheadline
    if (cta) data.cta = cta
    if (tagline) data.tagline = tagline
    return data
  } catch {
    return {}
  }
}
