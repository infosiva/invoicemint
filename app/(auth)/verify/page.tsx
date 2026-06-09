'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setError('No token provided'); return }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async res => {
      if (res.ok) {
        router.replace('/dashboard')
      } else {
        const data = await res.json()
        setStatus('error')
        setError(data.error || 'Link expired or already used')
      }
    })
  }, [params, router])

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 24 }}>
          Deal<span style={{ color: '#059669' }}>Flow</span>
        </div>

        {status === 'verifying' ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Verifying your link…</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', marginBottom: 4 }}>Link expired</p>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: 16 }}>{error}</p>
            <a
              href="/login"
              style={{ display: 'inline-block', padding: '10px 20px', background: '#059669', color: '#fff', borderRadius: 10, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              Request a new link →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyInner /></Suspense>
}
