import { type NextRequest, NextResponse } from 'next/server';

// Supabase client initialization for potential future use
// const subaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// const supabase = createClient(subaseUrl, supabaseKey);

// In-memory rate limit store (for demo; use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  
  return forwarded || real || 'unknown';
}

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

/**
 * Log security events
 */
async function logSecurityEvent(
  eventType: string,
  ip: string,
  details: Record<string, unknown>
) {
  try {
    // Log security events - implement based on your needs
    console.log(`[SECURITY] ${eventType} from IP: ${ip}`, details);
    
    // Optional: Store in database
    // await supabase.from('security_logs').insert({
    //   event_type: eventType,
    //   ip_address: ip,
    //   details: JSON.stringify(details),
    //   timestamp: new Date().toISOString(),
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Validate request format
 */
function isValidRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  const method = request.method;
  
  // Check for valid content type on POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!contentType?.includes('application/json')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const ip = getClientIP(request);
  const method = request.method;
  
  // Skip middleware for static assets and public files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.ico') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ====================================================================
  // RATE LIMITING
  // ====================================================================
  const apiRoutes = pathname.startsWith('/api/');
  const adminRoutes = pathname.startsWith('/api/admin/');
  const sensitiveRoutes = [
    '/api/razorpay/',
    '/api/webhooks/',
    '/api/team/members',
    '/api/invoices/bulk',
  ].some(route => pathname.startsWith(route));
  
  let rateLimitPassed = true;
  
  if (apiRoutes) {
    // Stricter rate limiting for sensitive routes
    if (sensitiveRoutes) {
      rateLimitPassed = checkRateLimit(ip, 30, 60000); // 30 requests per minute
    } else if (adminRoutes) {
      rateLimitPassed = checkRateLimit(ip, 60, 60000); // 60 requests per minute
    } else {
      rateLimitPassed = checkRateLimit(ip, 100, 60000); // 100 requests per minute
    }
    
    if (!rateLimitPassed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { pathname, method });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // ====================================================================
  // REQUEST VALIDATION
  // ====================================================================
  if (!isValidRequest(request)) {
    await logSecurityEvent('INVALID_REQUEST', ip, { pathname, method });
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }

  // ====================================================================
  // SQL INJECTION DETECTION
  // ====================================================================
  const sqlInjectionPatterns = [
    /(\bOR\b|\bAND\b).*?=/gi,
    /[;'"`]/,
    /(-{2}|\/\*|\*\/)/,
    /xp_|sp_|exec|execute|select|insert|update|delete|drop|create/gi,
  ];
  
  const checkSQLInjection = (str: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(str));
  };
  
  // Check query parameters
  for (const [key, value] of searchParams) {
    if (checkSQLInjection(key) || checkSQLInjection(value)) {
      await logSecurityEvent('SQL_INJECTION_ATTEMPT', ip, { pathname, key, value });
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  }

  // ====================================================================
  // XSS PREVENTION - Check headers
  // ====================================================================
  const userAgent = request.headers.get('user-agent') || '';
  
  // Basic bot detection
  if (userAgent.match(/bot|crawler|spider|curl|wget/i) && pathname.startsWith('/api/')) {
    await logSecurityEvent('BOT_DETECTED', ip, { pathname, userAgent });
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // ====================================================================
  // AUTHENTICATED ROUTES
  // ====================================================================
  const protectedRoutes = [
    '/api/admin/',
    '/api/invoices/',
    '/api/customers/',
    '/api/team/',
    '/dashboard',
    '/settings',
    '/profile',
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth_token')?.value;
    
    if (!token && pathname.startsWith('/api/')) {
      await logSecurityEvent('MISSING_AUTH_TOKEN', ip, { pathname });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login
    if (!token && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ====================================================================
  // ADD SECURITY HEADERS TO RESPONSE
  // ====================================================================
  const response = NextResponse.next();
  
  // CORS headers (adjust origin as needed)
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Cache control
  if (pathname.startsWith('/_next/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove sensitive server info
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
  
  return response;
}

// ====================================================================
// MATCHER CONFIGURATION
// ====================================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
