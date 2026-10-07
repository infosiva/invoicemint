import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import BackToTop from '@/components/BackToTop'
import FeedbackWidget from '@/components/FeedbackWidget'
import { getSiteFlags } from '@/lib/flags'
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet } from '@/lib/theme-loader'
import { AnimatedBg } from '@/components/AnimatedBg'
import ConsentBanner from '@/components/ConsentBanner'

import { MotionProvider } from "@infosiva/shared-ui/modern";
export const metadata: Metadata = {
  title: 'InvoiceMint — AI Invoice Generator for Freelancers | Get Paid Faster',
  description: 'Create professional invoices in seconds with AI. Lock scope, track milestones, accept Stripe payments. Free to start.',
  keywords: 'AI invoice generator, freelancer invoicing, get paid faster, invoice software, milestone tracking, freelance billing, invoice automation',
  metadataBase: new URL('https://invoicemint.cloud'),
  openGraph: {
    title: 'InvoiceMint — Invoice clients. Get paid on time.',
    description: 'AI drafts your invoice in seconds. Lock scope, track milestones, accept Stripe payments.',
    url: 'https://invoicemint.cloud',
    siteName: 'InvoiceMint',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'InvoiceMint — AI Invoice Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceMint — AI Invoice Generator',
    description: 'Invoice clients. Get paid on time. AI-powered invoicing for freelancers.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://invoicemint.cloud' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'InvoiceMint',
  applicationCategory: 'BusinessApplication',
  description: 'AI invoice generator for freelancers: scope sign-off, milestone tracking, and Stripe payment pages.',
  url: 'https://invoicemint.cloud',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Pro', billingDuration: 'P1M' },
  ],
  featureList: [
    'AI invoice drafting',
    'Scope agreement with client sign-off',
    'Milestone tracking with proof uploads',
    'Stripe payment links',
    'Deal message thread',
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getSiteFlags('invoicemint')
  const theme = await loadSiteTheme('invoicemint')
  const themeCss = buildThemeStyleTag(theme)
  const ga4 = buildGa4Snippet(theme)
  return (
    <html lang="en" data-layout={theme?.layout?.archetype ?? 'tool-first-workbench'}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      </head>
      <body className="antialiased" style={{ background: 'var(--background, #fffbeb)' }}>
        <AnimatedBg theme={theme} fallback="none" />
        <MotionProvider>{children}</MotionProvider>
        {flags.chatbot && <FloatingChatWrapper />}
        <FeedbackWidget siteName="InvoiceMint" accentColor="#a16207" accentColor2="#854d0e" position="left" />
        <Script defer data-site="invoicemint.cloud" src="/t.js" strategy="afterInteractive" />
        <BackToTop accentColor="#a16207" />
        {ga4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${theme?.analytics?.ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: ga4 }} />
          </>
        )}
        <ConsentBanner />
      </body>
    </html>
  )
}
