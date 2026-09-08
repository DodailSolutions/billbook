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
          background: 'linear-gradient(135deg, #005DEE 0%, #0038A9 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 340 340">
          {/* White invoice/document forming B */}
          <rect x="70" y="55" width="200" height="230" rx="28" fill="white"/>
          
          {/* Document lines */}
          <rect x="105" y="105" width="105" height="20" rx="10" fill="#4B6B94"/>
          <rect x="105" y="145" width="130" height="20" rx="10" fill="#4B6B94"/>
          <rect x="105" y="185" width="75" height="20" rx="10" fill="#4B6B94"/>
          
          {/* Bold vibrant electric blue checkmark */}
          <path d="M 175 210 L 205 240 L 255 170" 
                stroke="#005DEE" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          
          {/* Folded corner */}
          <path d="M 270 245 L 270 285 L 230 285 Z" fill="#38B6FF" opacity="0.9"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
