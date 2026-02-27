/**
 * Rate Limiting Middleware
 * Protects API routes from abuse and brute force attacks
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Default configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
}

// Route-specific configurations
const routeConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/login': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5, // 5 login attempts per 5 minutes
  },
  '/api/auth/signup': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour per IP
  },
  '/api/razorpay': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 payment attempts per 15 minutes
  },
  '/api/invoices': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 invoice operations per minute
  },
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const headers = request.headers
  
  // Try various headers in order of reliability
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to a generic identifier if no IP is available
  return 'unknown'
}

/**
 * Get rate limit configuration for a route
 */
function getConfigForRoute(pathname: string): RateLimitConfig {
  // Check for exact match
  if (routeConfigs[pathname]) {
    return routeConfigs[pathname]
  }
  
  // Check for partial match (e.g., /api/razorpay/*)
  for (const [route, config] of Object.entries(routeConfigs)) {
    if (pathname.startsWith(route)) {
      return config
    }
  }
  
  return defaultConfig
}

/**
 * Clean up expired entries from store
 */
function cleanupStore() {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}

/**
 * Rate limit check
 * Returns null if allowed, error response if rate limited
 */
export function checkRateLimit(
  request: Request,
  pathname: string
): { allowed: boolean; remaining: number; resetTime: number } | null {
  const clientIP = getClientIP(request)
  const config = getConfigForRoute(pathname)
  const key = `${clientIP}:${pathname}`
  const now = Date.now()
  
  // Cleanup old entries periodically (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupStore()
  }
  
  // Get or create rate limit entry
  let entry = store[key]
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    store[key] = entry
  }
  
  // Increment count
  entry.count++
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}

/**
 * Rate limit middleware wrapper
 * Use this to wrap API route handlers
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  customConfig?: RateLimitConfig
) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    // Apply custom config if provided
    if (customConfig) {
      routeConfigs[pathname] = customConfig
    }
    
    const result = checkRateLimit(request, pathname)
    
    if (result && !result.allowed) {
      return createRateLimitResponse(result.resetTime)
    }
    
    // Add rate limit headers to response
    const response = await handler(request)
    
    if (result) {
      const headers = new Headers(response.headers)
      headers.set('X-RateLimit-Limit', getConfigForRoute(pathname).maxRequests.toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
    
    return response
  }
}

/**
 * Reset rate limit for a specific IP (useful for testing or manual override)
 */
export function resetRateLimit(ip: string, pathname?: string) {
  if (pathname) {
    const key = `${ip}:${pathname}`
    delete store[key]
  } else {
    // Reset all entries for this IP
    for (const key in store) {
      if (key.startsWith(`${ip}:`)) {
        delete store[key]
      }
    }
  }
}

// Export for monitoring/admin purposes
export function getRateLimitStats() {
  const now = Date.now()
  const activeEntries = Object.entries(store)
    .filter(([, entry]) => entry.resetTime > now)
    .map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString(),
    }))
  
  return {
    totalActive: activeEntries.length,
    entries: activeEntries,
  }
}
