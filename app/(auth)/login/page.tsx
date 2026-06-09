'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: '#059669', marginBottom: 12 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Deal<span style={{ color: '#059669' }}>Flow</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: 4 }}>No password. No spam. Just a link.</p>
        </div>

        {sent ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                <path d="M1 7.5L5.5 12 14 3" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', marginBottom: 4 }}>Check your inbox</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Login link sent to <strong style={{ color: '#0f172a' }}>{email}</strong>. Expires in 15 minutes.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', color: '#0f172a', background: '#fff', boxSizing: 'border-box', transition: 'border-color 160ms ease' }}
                  onFocus={e => (e.target.style.borderColor = '#059669')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              {error && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '11px', background: loading ? '#a7f3d0' : '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 160ms ease, transform 100ms ease' }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#047857') }}
                onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#059669') }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {loading ? 'Sending…' : 'Send login link →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: 0 }}>Vendor-client deals, scoped and paid.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
