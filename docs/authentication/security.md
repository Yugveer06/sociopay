# Authentication Security

## Security Overview

SocioPay implements multiple layers of security to protect user accounts and community data.

## Password Security

### Password Requirements

- **Minimum Length**: 6 characters
- **Hashing**: Automatic password hashing via Better Auth
- **Storage**: Never stored in plain text
- **Validation**: Client and server-side validation

### Best Practices

- Passwords are hashed using industry-standard algorithms
- Salt is automatically applied to prevent rainbow table attacks
- Password confirmation required during registration

## Session Security

### Session Management

```typescript
cookieStore.set({
  name: 'better-auth.session_token',
  value: response.token,
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7-day expiration
})
```

### Security Features

- **HTTP-Only Cookies**: Prevents JavaScript access to session tokens
- **Secure Flag**: HTTPS-only transmission in production
- **SameSite Protection**: Prevents CSRF attacks
- **Automatic Expiration**: 7-day session lifetime
- **Token Rotation**: New tokens generated on each authentication

## Input Validation

### Client-Side Validation

```typescript
// Zod schemas provide type-safe validation
export const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
})
```

### Server-Side Validation

- All inputs re-validated on the server
- Zod schemas ensure consistent validation rules
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization

## Database Security

### Connection Security

- **SSL/TLS**: Encrypted connections to database
- **Connection Pooling**: Managed connections via pg.Pool
- **Environment Variables**: Sensitive data stored securely

### Data Protection

- **Unique Constraints**: House numbers and emails are unique
- **Field Validation**: Database-level validation rules
- **Audit Trail**: Created/updated timestamps on all records

## Custom Field Security

### House Number Validation

```typescript
houseNumber: {
  type: "string",
  unique: true,
  required: true,
  validation: {
    maxLength: 10,
    pattern: "^[A-Z]-\\d{1,2}$",
    message: "Please enter a valid house number (e.g., A-1, B-9, C-23).",
  },
}
```

### Phone Number Validation

```typescript
phone: {
  type: "string",
  required: true,
  validation: {
    minLength: 10,
    maxLength: 10,
    pattern: "^[0-9]{10}$",
    message: "Please enter a valid 10-digit phone number.",
  },
}
```

## Error Handling Security

### Information Disclosure Prevention

- Generic error messages for authentication failures
- No indication whether email exists during login attempts
- Detailed errors only for validation issues
- Server errors logged but not exposed to client

### Error Response Structure

```typescript
type ActionState = {
  success: boolean
  message: string // Safe for client display
  data?: any // Only on success
  errors?: Record<string, string[]> // Validation errors only
}
```

## Environment Security

### Production Configuration

```bash
# Required environment variables
DATABASE_URL=postgresql://...     # Secure database connection
BETTER_AUTH_SECRET=...           # Cryptographically secure secret
NODE_ENV=production              # Production optimizations
```

### Development vs Production

- **SSL**: Required in production, optional in development
- **Secure Cookies**: Enabled in production only
- **Error Logging**: Different levels for different environments

## CSRF Protection

### SameSite Cookies

- `sameSite: "lax"` prevents cross-site request forgery
- Cookies only sent with same-site requests
- Protection against malicious third-party sites

### Server Actions

- Next.js server actions provide built-in CSRF protection
- Actions only callable from same origin
- Automatic token validation

## XSS Prevention

### Input Sanitization

- All user inputs validated and sanitized
- React's built-in XSS protection
- No direct HTML injection points

### Content Security Policy

Consider implementing CSP headers for additional XSS protection:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ]
  },
}
```

## Rate Limiting

### Recommendations

Consider implementing rate limiting for authentication endpoints:

- **Login Attempts**: Limit failed login attempts per IP/email
- **Registration**: Prevent automated account creation
- **Password Reset**: Limit password reset requests

### Implementation Options

- Use middleware for rate limiting
- Implement exponential backoff for failed attempts
- Consider using services like Upstash Redis for distributed rate limiting

## Monitoring and Logging

### Security Events to Monitor

- Failed authentication attempts
- Account creation patterns
- Unusual session activity
- Database connection errors

### Logging Best Practices

- Log security events without sensitive data
- Monitor for brute force attacks
- Track authentication success/failure rates
- Alert on suspicious patterns

## Security Checklist

### Deployment Security

- [ ] HTTPS enabled in production
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] Session cookies configured properly
- [ ] Error messages sanitized
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Regular security updates applied

### Code Security

- [ ] Input validation on client and server
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] CSRF protection enabled
- [ ] Secure password handling
- [ ] Proper error handling
- [ ] Security testing performed
