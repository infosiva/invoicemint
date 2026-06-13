import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import BackToTop from '@/components/BackToTop'

export const metadata: Metadata = {
  title: 'InvoiceMint — AI Invoice Generator for Freelancers | Get Paid Faster',
  description: 'Create professional invoices in seconds with AI. Lock scope, track milestones, accept Stripe payments. No disputes. Free for freelancers.',
  keywords: 'AI invoice generator, freelancer invoicing, get paid faster, invoice software, milestone tracking, freelance billing, invoice automation',
  metadataBase: new URL('https://invoicemint.cloud'),
  openGraph: {
    title: 'InvoiceMint — Invoice clients. Get paid on time.',
    description: 'AI drafts your invoice in seconds. Lock scope, track milestones, accept Stripe payments — no disputes.',
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
  description: 'AI invoice generator for freelancers — scope locking, milestone tracking, and Stripe payments.',
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
    'WhatsApp notifications',
    'Dispute evidence trail',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}<BackToTop accentColor="#6366f1" /><Script defer data-site="invoicemint.cloud" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" /></body>
    </html>
  )
}
