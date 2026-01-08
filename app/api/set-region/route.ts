import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const region = searchParams.get('region')
  
  const response = NextResponse.redirect(new URL(region === 'ae' ? '/ae' : '/', request.url))
  
  // Set cookie to remember user's region preference
  response.cookies.set('region-preference', region || 'in', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/'
  })
  
  return response
}
