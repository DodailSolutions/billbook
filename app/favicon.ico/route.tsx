import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
 
export const runtime = 'edge'
 
export async function GET(request: NextRequest) {
  // Return PNG with .ico content type for browser compatibility
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
          borderRadius: '6px',
        }}
      >
        {/* Simplified invoice icon */}
        <svg width="24" height="24" viewBox="0 0 24 24">
          {/* Document */}
          <rect x="6" y="4" width="14" height="17" rx="2" fill="white"/>
          
          {/* Invoice lines */}
          <rect x="8" y="7" width="8" height="2" rx="1" fill="#0072BC"/>
          <rect x="8" y="11" width="6" height="1.5" rx="0.75" fill="#0072BC" opacity="0.6"/>
          <rect x="8" y="14" width="7" height="1.5" rx="0.75" fill="#0072BC" opacity="0.6"/>
          
          {/* Checkmark */}
          <path d="M 14 16 L 16 18 L 19 14" 
                stroke="#00A651" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  )
}
