# 🔐 Security Implementation Guide

Complete guide for implementing security features throughout the application.

## Overview

This guide covers the security improvements integrated into the BillBook application including:
- Rate limiting and DDoS protection
- CSRF protection
- SQL injection prevention
- Input validation and sanitization
- Secure password hashing
- JWT token validation
- Encryption/Decryption
- Security headers
- Audit logging

## Quick Start

### 1. Environment Validation

The application automatically validates all required environment variables on startup.

```typescript
// lib/env.ts automatically validates when the app starts
// Check console output for validation results

✅ Environment validation passed
// or
❌ Environment validation failed:
  - Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

### 2. API Route Security

All API routes should be secured with the security utilities:

```typescript
// app/api/example/route.ts
import { 
  createSecureResponse, 
  createErrorResponse,
  validateInput,
  extractBearerToken 
} from '@/lib/security';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract and validate token
    const token = extractBearerToken(request);
    if (!token) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get and validate input
    const body = await request.json();
    const validated = validateInput(body.email, {
      type: 'email',
      required: true,
    });

    if (!validated.isValid) {
      return createErrorResponse(validated.error, 400);
    }

    // Your business logic here
    const result = { success: true };

    return createSecureResponse(result, 200);
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}
```

### 3. Middleware Security Headers

The middleware automatically applies security headers to all requests:

```typescript
// middleware.ts - Runs automatically
// Applied headers:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security
// - Content-Security-Policy
```

### 4. Rate Limiting

Protected routes have automatic rate limiting:

```typescript
// Rate limits (per IP, per minute):
// - Sensitive routes (/api/razorpay, /api/webhooks): 30 req/min
// - Admin routes (/api/admin): 60 req/min
// - Regular API routes: 100 req/min

// Middleware automatically enforces these limits
// Returns 429 Too Many Requests when exceeded
```

## Usage Examples

### Password Hashing & Verification

```typescript
import { hashPassword, verifyPassword } from '@/lib/security';

// Store hashed password
const hashedPassword = await hashPassword('user-password');
// Store in database: hashedPassword

// Verify on login
const isValid = await verifyPassword('user-password', storedHash);
if (isValid) {
  // Login successful
}
```

### Input Validation

```typescript
import { validateInput } from '@/lib/security';

// Validate email
const email = validateInput('user@example.com', { 
  type: 'email',
  required: true 
});

// Validate phone
const phone = validateInput('+1234567890', { 
  type: 'phone',
  required: true 
});

// Validate custom pattern
const code = validateInput('ABC123', { 
  pattern: /^[A-Z]{3}\d{3}$/,
  required: true 
});
```

### Encryption/Decryption

```typescript
import { encryptData, decryptData } from '@/lib/security';

// Encrypt sensitive data
const plaintext = 'sensitive-information';
const encrypted = await encryptData(plaintext, 'encryption-key');

// Decrypt when needed
const decrypted = await decryptData(encrypted, 'encryption-key');
```

### CSRF Protection

```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/security';

// Generate token (server-side)
const csrfToken = generateCSRFToken();

// Send to client in response
response.headers.set('X-CSRF-Token', csrfToken);

// Validate in next request
const isValid = validateCSRFToken(csrfToken, request.headers.get('x-csrf-token'));
```

### Session Management

```typescript
import { generateSessionToken, validateSessionToken } from '@/lib/security';

// Create session
const sessionToken = generateSessionToken();

// Store in database with user_id and expiration

// Validate in requests
const sessionData = validateSessionToken(sessionToken);
if (sessionData) {
  // Session valid
} else {
  // Session invalid or expired
}
```

### Audit Logging

```typescript
import { logSecurityEvent } from '@/lib/security';

// Log security events
await logSecurityEvent('LOGIN_SUCCESS', clientIP, {
  userId: 'user123',
  email: 'user@example.com',
  timestamp: new Date().toISOString(),
});

// Suspicious activity
await logSecurityEvent('SUSPICIOUS_ACTIVITY', clientIP, {
  attemptedAction: 'unauthorized_access',
  resource: '/api/admin/users',
  severity: 'high',
});
```

## Security Checklist

- [ ] All environment variables set and validated
- [ ] Database password hashing enabled
- [ ] JWT_SECRET configured (min 32 chars in production)
- [ ] API_SECRET configured (min 32 chars)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting tested
- [ ] SQL injection prevention verified
- [ ] XSS prevention in place
- [ ] CSRF tokens implemented
- [ ] Security headers applied
- [ ] Audit logging enabled
- [ ] Error handling doesn't expose sensitive info
- [ ] Sensitive data encrypted
- [ ] Session tokens validated
- [ ] Input validation on all user input

## Common Security Patterns

### Protected API Route Template

```typescript
// app/api/protected/route.ts
import { createSecureResponse, createErrorResponse } from '@/lib/security';
import { validateAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Validate authentication
    const user = await validateAuth(request);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // 2. Validate authorization
    if (!user.isAdmin) {
      return createErrorResponse('Forbidden', 403);
    }

    // 3. Fetch and return secure response
    const data = { message: 'Success' };
    return createSecureResponse(data, 200);
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
```

### Form Security

```typescript
// components/secure-form.tsx
'use client';

import { validateInput } from '@/lib/security';
import { useState } from 'react';

export function SecureForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validate inputs
    const newErrors: Record<string, string> = {};
    
    const email = validateInput(formData.get('email') as string, {
      type: 'email',
      required: true,
    });
    if (!email.isValid) {
      newErrors.email = email.error || 'Invalid email';
    }

    const password = validateInput(formData.get('password') as string, {
      minLength: 8,
      required: true,
    });
    if (!password.isValid) {
      newErrors.password = password.error || 'Password too short';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit to API
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (!response.ok) {
      setErrors({ form: 'Submission failed' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input name="password" type="password" required />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Performance Optimization Integration

Use performance utilities alongside security:

```typescript
import { measurePerformance, memoize, createCache } from '@/lib/performance';
import { validateInput } from '@/lib/security';

// Memoize expensive validation
const validateUserEmail = memoize(
  async (email: string) => {
    const validation = validateInput(email, { type: 'email' });
    return validation;
  },
  { maxSize: 1000 }
);

// Measure and cache results
const cachedValidation = createCache();

export async function checkEmail(email: string) {
  const cached = cachedValidation.get(`email-${email}`);
  if (cached) return cached;

  const result = await measurePerformance(
    () => validateUserEmail(email),
    'email-validation'
  );

  cachedValidation.set(`email-${email}`, result, 3600000); // 1 hour TTL
  return result;
}
```

## Monitoring & Debugging

### Check Validation Status

```bash
# View environment validation on startup
# Look for ✅ or ❌ in console output
```

### Enable Security Logging

```typescript
// lib/security/index.ts - Already includes logging
// Security events are logged to console in development
// Configure database logging in production
```

### Performance Metrics

```typescript
import { getMetricsStats } from '@/lib/performance';

// Get performance stats
const stats = getMetricsStats();
console.log('Performance Metrics:', stats);
```

## Deployment Checklist

### Before Production

1. **Environment Variables**
   - [ ] All required vars set
   - [ ] No default values in use
   - [ ] Secrets in secure vault
   - [ ] Keys rotated if necessary

2. **Security Headers**
   - [ ] CSP configured for your domain
   - [ ] HSTS enabled
   - [ ] CORS properly scoped

3. **Database**
   - [ ] Row Level Security (RLS) enabled in Supabase
   - [ ] Encryption at rest enabled
   - [ ] Regular backups configured

4. **API Security**
   - [ ] Rate limiting tested
   - [ ] Input validation confirmed
   - [ ] Error messages don't leak info
   - [ ] Sensitive data encrypted

5. **Monitoring**
   - [ ] Audit logging enabled
   - [ ] Error tracking configured
   - [ ] Performance monitoring active

6. **Testing**
   - [ ] Security tests passing
   - [ ] Load testing completed
   - [ ] Penetration testing done (recommended)

## Troubleshooting

### Rate Limit Errors

```
Error: 429 Too Many Requests

Solution: 
- Check rate limit thresholds in middleware.ts
- Use exponential backoff for retries
- Implement request queueing for bulk operations
```

### Invalid Token Errors

```
Error: Unauthorized

Solution:
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format (Bearer <token>)
- Ensure SUPABASE_SERVICE_ROLE_KEY is correct
```

### CSP Violations

```
Error: Content Security Policy: The page's settings blocked the loading of a resource

Solution:
- Update CSP headers in next.config.ts
- Add external domains to csp directives
- Test with browser DevTools
```

## References

- [OWASP Security Checklist](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Razorpay Security](https://razorpay.com/docs/api/safety-security/)

## Support

For security issues or questions:
- Review the security module: `lib/security/index.ts`
- Check middleware: `middleware.ts`
- Validate environment: `lib/env.ts`
- Review config: `next.config.ts`

---

**Last Updated**: 2024
**Version**: 1.0.0
