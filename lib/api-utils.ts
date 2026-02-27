/**
 * API Utilities for Secure Error Handling and Responses
 */

import { NextResponse } from 'next/server'

interface APIError {
  message: string
  code?: string
  details?: unknown
}

interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: APIError
  timestamp: string
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Create a standardized error response
 * In production, sanitizes error messages to prevent information disclosure
 */
export function createErrorResponse(
  error: string | Error | unknown,
  status: number = 500,
  code?: string
): NextResponse<APIResponse> {
  const isProduction = process.env.NODE_ENV === 'production'
  
  let message: string
  let details: unknown
  
  if (error instanceof Error) {
    message = isProduction ? 
      getGenericErrorMessage(status) : 
      error.message
    details = isProduction ? undefined : error.stack
  } else if (typeof error === 'string') {
    message = error
  } else {
    message = getGenericErrorMessage(status)
    details = isProduction ? undefined : error
  }
  
  // Log the actual error server-side
  if (isProduction && error instanceof Error) {
    console.error(`[API Error] ${code || 'UNKNOWN'}:`, error.message, error.stack)
  } else if (!isProduction) {
    console.error('[API Error]:', error)
  }
  
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details: isProduction ? undefined : details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Get generic error message based on HTTP status code
 */
function getGenericErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    401: 'Authentication required.',
    403: 'Access denied.',
    404: 'Resource not found.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    503: 'Service temporarily unavailable.',
  }
  
  return messages[status] || 'An error occurred.'
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .substring(0, 10000) // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate number range
 */
export function isValidNumber(
  value: unknown,
  options?: { min?: number; max?: number }
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false
  }
  
  if (options?.min !== undefined && value < options.min) {
    return false
  }
  
  if (options?.max !== undefined && value > options.max) {
    return false
  }
  
  return true
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T = unknown>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Extract and validate bearer token from request
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Create response with security headers
 */
export function createSecureResponse<T>(
  data: T,
  status: number = 200
): NextResponse<APIResponse<T>> {
  const response = createSuccessResponse(data, status)
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

/**
 * Log API request for monitoring
 */
export function logAPIRequest(
  method: string,
  path: string,
  userId?: string,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    method,
    path,
    userId: userId || 'anonymous',
    ...details,
  }
  
  // In production, this could be sent to a logging service
  console.log('[API Request]:', JSON.stringify(logEntry))
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler(
  handler: (request: Request, context?: unknown) => Promise<Response>
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('[Async Handler Error]:', error)
      return createErrorResponse(error, 500, 'INTERNAL_ERROR')
    }
  }
}
