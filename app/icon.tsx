import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, #047857, #059669)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Receipt/document with checkmark — invoice generated + approved */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M8 8h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
