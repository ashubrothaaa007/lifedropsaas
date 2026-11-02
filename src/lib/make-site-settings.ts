export type MakeSiteSettings = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

export const makeSiteSettings: MakeSiteSettings = {
  title: 'LifeDrop — Blood Donation Platform',
  description: 'Connecting voluntary blood donors with hospitals and patients in critical clinical need.',
  language: 'en',
  robots: {
    index: true,
  },
}

export function sanitizeHtmlAttribute(value: string | undefined): string {
  return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
}
