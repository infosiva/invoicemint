import Link from 'next/link'

export const metadata = { title: 'Terms of Service — InvoiceMint' }

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-slate-700">
      <Link href="/" className="mb-8 inline-block text-[13px] font-semibold" style={{ color: 'var(--accent, #059669)' }}>
        ← Back to InvoiceMint
      </Link>
      <h1 className="mb-4 text-[28px] font-black text-slate-900">Terms of Service</h1>
      <p className="mb-4 text-[13px] text-slate-400">Last updated: June 2026</p>
      <p className="mb-4 text-[14px]">By using InvoiceMint you agree to these terms. InvoiceMint provides AI-powered invoice generation, scope management, and payment facilitation tools for freelancers and their clients.</p>
      <h2 className="mb-2 mt-6 text-[16px] font-black text-slate-900">Use of Service</h2>
      <p className="mb-4 text-[14px]">You may use InvoiceMint for lawful business invoicing purposes. You are responsible for the accuracy of information you provide and for compliance with tax regulations in your jurisdiction.</p>
      <h2 className="mb-2 mt-6 text-[16px] font-black text-slate-900">Payments</h2>
      <p className="mb-4 text-[14px]">Payment processing is handled by Stripe. InvoiceMint does not store card data. Pro subscriptions are billed monthly and can be cancelled anytime.</p>
      <h2 className="mb-2 mt-6 text-[16px] font-black text-slate-900">Limitation of Liability</h2>
      <p className="mb-4 text-[14px]">InvoiceMint is provided as-is. We are not liable for payment disputes between vendors and clients. Use the dispute evidence trail feature to protect yourself.</p>
      <h2 className="mb-2 mt-6 text-[16px] font-black text-slate-900">Contact</h2>
      <p className="text-[14px]">Questions? Email us at hello@invoicemint.cloud</p>
    </div>
  )
}
