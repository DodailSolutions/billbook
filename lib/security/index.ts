/**
 * Security utilities for protecting the application
 * Implements rate limiting, CSRF protection, input validation, and more
 */

import { headers } from 'next/headers'
import crypto from 'crypto'

// ============================================================================
// RATE LIMITING - Prevent brute force attacks
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiter middleware
 * Prevents abuse by limiting requests per IP
 */
export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60 * 1000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    let data = rateLimitStore.get(identifier)

    if (!data || now > data.resetTime) {
        // Reset the window
        data = { count: 1, resetTime: now + windowMs }
        rateLimitStore.set(identifier, data)
        return { allowed: true, remaining: maxRequests - 1, resetTime: data.resetTime }
    }

    data.count++
    const remaining = Math.max(0, maxRequests - data.count)
    const allowed = data.count <= maxRequests

    if (allowed) {
        return { allowed: true, remaining, resetTime: data.resetTime }
    }

    return { allowed: false, remaining: 0, resetTime: data.resetTime }
}

// ============================================================================
// IP ADDRESS DETECTION - Get user IP for rate limiting
// ============================================================================

export async function getClientIP(): Promise<string> {
    const headersList = await headers()
    
    // Check various headers that might contain the IP
    const forwarded = headersList.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIp = headersList.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    return 'unknown'
}

// ============================================================================
// CSRF TOKEN GENERATION & VALIDATION
// ============================================================================

const csrfTokens = new Set<string>()

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
    const token = crypto.randomBytes(32).toString('hex')
    csrfTokens.add(token)
    return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
    const isValid = csrfTokens.has(token)
    if (isValid) {
        // Token can only be used once
        csrfTokens.delete(token)
    }
    return isValid
}

// ============================================================================
// CONTENT SECURITY POLICY HEADERS
// ============================================================================

export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
    const useSalt = salt || crypto.randomBytes(16).toString('hex')
    
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, useSalt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err)
            const hash = derivedKey.toString('hex')
            resolve(`${useSalt}:${hash}`)
        })
    })
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt] = hash.split(':')
    const hashToCheck = await hashPassword(password, salt)
    return hash === hashToCheck
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

const SQL_INJECTION_PATTERNS = [
    /(\bunion\b.*\bselect\b)|(\bselect\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)|(\btruncate\b)/i,
    /(\binsert\b.*\binto\b)|(\bupdate\b.*\bset\b)/i,
    /(\bdelete\b.*\bfrom\b)|(\bexec\b.*\()/i,
    /(-{2}|\/\*|\*\/|xp_)/i,
]

/**
 * Check if input contains SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
}

/**
 * Sanitize input to prevent SQL injection
 */
export function sanitizeInput(input: string): string {
    let sanitized = input
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'`;]/g, '')
    
    // Trim whitespace
    sanitized = sanitized.trim()
    
    return sanitized
}

// ============================================================================
// SECURE API RESPONSE
// ============================================================================

export interface SecureAPIResponse<T> {
    success: boolean
    data?: T
    error?: string
    timestamp: number
}

export function createSecureResponse<T>(data: T, status: number = 200): SecureAPIResponse<T> {
    return {
        success: status >= 200 && status < 300,
        data,
        timestamp: Date.now(),
    }
}

export function createErrorResponse(error: string): SecureAPIResponse<null> {
    return {
        success: false,
        error,
        timestamp: Date.now(),
    }
}

// ============================================================================
// JWT VALIDATION
// ============================================================================

/**
 * Validate Bearer token format
 */
export function extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null
    }
    
    return parts[1]
}

// ============================================================================
// SECURE RANDOM GENERATION
// ============================================================================

export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

export function generateSecureOTP(length: number = 6): string {
    const digits = '0123456789'
    let otp = ''
    
    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(digits.length)]
    }
    
    return otp
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'), iv)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
    const [iv, authTag, encrypted] = encryptedData.split(':')
    
    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
}

// ============================================================================
// SECURE HEADERS MIDDLEWARE
// ============================================================================

export async function applySecurityHeaders(response: Response): Promise<Response> {
    const newResponse = new Response(response.body, response)
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value)
    })
    
    return newResponse
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

export interface ValidationOptions {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    required?: boolean
    sanitize?: boolean
}

export function validateInput(input: string, options: ValidationOptions = {}): { valid: boolean; error?: string } {
    const {
        minLength = 0,
        maxLength = Infinity,
        pattern,
        required = false,
    } = options

    // Check required
    if (required && !input?.trim()) {
        return { valid: false, error: 'This field is required' }
    }

    if (!input) {
        return { valid: true }
    }

    // Check length
    if (input.length < minLength) {
        return { valid: false, error: `Minimum ${minLength} characters required` }
    }

    if (input.length > maxLength) {
        return { valid: false, error: `Maximum ${maxLength} characters allowed` }
    }

    // Check pattern
    if (pattern && !pattern.test(input)) {
        return { valid: false, error: 'Invalid format' }
    }

    // Detect injection attempts
    if (detectSQLInjection(input)) {
        return { valid: false, error: 'Invalid input detected' }
    }

    return { valid: true }
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString('base64')
}

export function validateSessionToken(token: string): boolean {
    // Basic validation - in production, check against database
    return token.length > 0 && !detectSQLInjection(token)
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

interface AuditLog {
    timestamp: number
    action: string
    userId?: string
    ipAddress?: string
    details: Record<string, unknown>
    status: 'success' | 'failure'
}

const auditLogs: AuditLog[] = []

export async function logSecurityEvent(
    action: string,
    userId?: string,
    details: Record<string, unknown> = {},
    status: 'success' | 'failure' = 'success'
): Promise<void> {
    const ipAddress = await getClientIP()
    
    const log: AuditLog = {
        timestamp: Date.now(),
        action,
        userId,
        ipAddress,
        details,
        status,
    }
    
    auditLogs.push(log)
    
    // Keep only last 1000 logs in memory
    if (auditLogs.length > 1000) {
        auditLogs.shift()
    }
    
    // In production, log to database
    if (status === 'failure') {
        console.warn('[SECURITY]', log)
    }
}

export function getAuditLogs(limit: number = 100): AuditLog[] {
    return auditLogs.slice(-limit)
}
