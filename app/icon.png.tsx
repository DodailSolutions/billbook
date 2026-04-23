import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 512,
  height: 512,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0072BC 0%, #00A651 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '100px',
        }}
      >
        {/* Simplified invoice icon */}
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* Notebook binding */}
          <rect x="40" y="60" width="12" height="60" rx="6" fill="#00A651"/>
          <rect x="40" y="140" width="12" height="60" rx="6" fill="#00A651"/>
          <rect x="40" y="220" width="12" height="60" rx="6" fill="#00A651"/>
          
          {/* Document/Page */}
          <rect x="80" y="80" width="180" height="200" rx="12" fill="white"/>
          
          {/* Folded corner */}
          <path d="M 260 80 L 260 110 L 230 80 Z" fill="#E0E0E0"/>
          
          {/* Rupee symbol */}
          <path d="M 110 120 L 180 120 M 110 135 L 180 135 M 110 150 L 140 150 L 165 210" 
                stroke="#0072BC" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M 110 120 L 110 150" stroke="#0072BC" strokeWidth="12" strokeLinecap="round"/>
          
          {/* Invoice lines */}
          <rect x="110" y="220" width="110" height="8" rx="4" fill="#0072BC" opacity="0.3"/>
          <rect x="110" y="240" width="85" height="8" rx="4" fill="#0072BC" opacity="0.3"/>
          <rect x="110" y="260" width="95" height="8" rx="4" fill="#0072BC" opacity="0.3"/>
          
          {/* Checkmark */}
          <path d="M 190 235 L 210 255 L 250 210" 
                stroke="#00A651" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
