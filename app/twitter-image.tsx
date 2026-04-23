import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'BillBooky - Free Invoice Generator for Indian Businesses'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0072BC 0%, #00A651 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '180px',
              height: '180px',
              background: 'white',
              borderRadius: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Simplified invoice icon */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <svg width="120" height="120" viewBox="0 0 120 120">
                <rect x="10" y="10" width="80" height="100" rx="8" fill="#0072BC" opacity="0.1"/>
                <rect x="20" y="20" width="60" height="8" rx="4" fill="#0072BC"/>
                <rect x="20" y="35" width="45" height="6" rx="3" fill="#0072BC" opacity="0.6"/>
                <rect x="20" y="50" width="50" height="6" rx="3" fill="#0072BC" opacity="0.6"/>
                <path d="M75 70 L85 80 L105 55" stroke="#00A651" strokeWidth="6" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            BillBooky
          </div>
          
          <div
            style={{
              fontSize: '38px',
              color: 'white',
              opacity: 0.95,
              marginBottom: '20px',
              maxWidth: '900px',
              lineHeight: 1.3,
            }}
          >
            Free Invoice Generator for Indian Businesses
          </div>
          
          <div
            style={{
              fontSize: '28px',
              color: 'white',
              opacity: 0.85,
              background: 'rgba(255,255,255,0.15)',
              padding: '15px 40px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}
          >
            Made in India 🇮🇳 | GST-Compliant | 100% Free
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
