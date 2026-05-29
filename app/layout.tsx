import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import BackToTop from '@/components/BackToTop'

export const metadata: Metadata = {
  title: 'InvoiceMint — AI Invoice Generator & Freelancer CRM | Get Paid Faster',
  description: 'Create professional invoices in 60 seconds with AI. Track deals, chase payments, manage your client pipeline. Free for freelancers.',
  keywords: 'AI invoice generator, freelancer invoicing, get paid faster, invoice software, client pipeline, freelance CRM, invoice automation',
  metadataBase: new URL('https://invoicemint.cloud'),
  openGraph: {
    title: 'InvoiceMint — Scope. Milestone. Pay.',
    description: 'Stop chasing invoices. Stop scope disputes. InvoiceMint gives vendors and clients one shared workspace — from proposal to payment.',
    url: 'https://invoicemint.cloud',
    siteName: 'InvoiceMint',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceMint — Vendor-Client Platform',
    description: 'Proposals. Milestones. Payments. One platform for vendors and clients.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://invoicemint.cloud' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'InvoiceMint',
  applicationCategory: 'BusinessApplication',
  description: 'Vendor-client platform for proposals, scope agreement, milestone tracking, and payments.',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '12', priceCurrency: 'USD', name: 'Pro', billingDuration: 'P1M' },
  ],
  featureList: [
    'AI proposal drafting',
    'Scope agreement with e-signature',
    'Milestone tracking with proof uploads',
    'Change order management',
    'Stripe payment links',
    'WhatsApp notifications',
    'Dispute evidence trail',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}<BackToTop accentColor="#6366f1" /><Script defer data-site="invoicemint.cloud" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" /></body>
    </html>
  )
}
