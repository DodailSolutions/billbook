import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
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
          borderRadius: '40px',
        }}
      >
        {/* Simplified invoice icon */}
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Notebook binding */}
          <rect x="15" y="20" width="5" height="22" rx="2.5" fill="#00A651"/>
          <rect x="15" y="50" width="5" height="22" rx="2.5" fill="#00A651"/>
          <rect x="15" y="80" width="5" height="22" rx="2.5" fill="#00A651"/>
          
          {/* Document/Page */}
          <rect x="30" y="28" width="70" height="75" rx="5" fill="white"/>
          
          {/* Folded corner */}
          <path d="M 100 28 L 100 43 L 85 28 Z" fill="#E0E0E0"/>
          
          {/* Rupee symbol */}
          <path d="M 42 42 L 70 42 M 42 50 L 70 50 M 42 58 L 54 58 L 64 83" 
                stroke="#0072BC" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M 42 42 L 42 58" stroke="#0072BC" strokeWidth="4.5" strokeLinecap="round"/>
          
          {/* Invoice lines */}
          <rect x="42" y="85" width="42" height="3" rx="1.5" fill="#0072BC" opacity="0.3"/>
          <rect x="42" y="92" width="32" height="3" rx="1.5" fill="#0072BC" opacity="0.3"/>
          <rect x="42" y="99" width="36" height="3" rx="1.5" fill="#0072BC" opacity="0.3"/>
          
          {/* Checkmark */}
          <path d="M 72 90 L 80 98 L 95 80" 
                stroke="#00A651" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
