# Authentication System

SocioPay uses Better Auth with Drizzle ORM adapter for secure authentication with custom user fields specific to community management.

## Overview

The authentication system supports:

- Email/password authentication
- Email OTP for password reset
- Custom user fields (house number, phone)
- Session management with secure cookies
- Form validation with Zod schemas
- Server actions for auth operations
- Interactive UI with animations and visual feedback
- Admin functionality for user management
- Ban/unban capabilities for society members

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Pages    │───▶│  Server Actions  │───▶│   Better Auth   │───▶│ Drizzle + PG    │
│  (login/signup) │    │   (validated)    │    │  + Drizzle      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Email Service  │
                                                │   (Resend)      │
                                                └─────────────────┘
```

## User Schema

### Custom Fields

- **houseNumber**: Unique identifier for community members
  - Format: `^[A-Z]-\d{1,2}$` (e.g., A-1, B-9, C-23)
  - Required and unique across all users
- **phone**: 10-digit phone number
  - Format: `^[0-9]{10}$`
  - Required for verification

### Standard Fields

- **name**: Full name of the user
- **email**: Email address (unique)
- **password**: Hashed password
- **emailVerified**: Email verification status

## Authentication Flow

### Sign Up Process

1. User fills out registration form with:
   - Full name
   - House number (validated format)
   - Email address
   - Phone number (10 digits)
   - Password and confirmation

2. Form validation using Zod schema
3. Server action processes the data
4. Better Auth creates user account
5. Session cookie is set
6. User redirected to dashboard

### Sign In Process

1. User enters email and password
2. Form validation using Zod schema
3. Better Auth verifies credentials against Drizzle database
4. Session token generated and stored in secure cookie
5. User redirected to dashboard

### Password Reset Process

1. User requests password reset with email
2. Email OTP sent via Resend service
3. User enters OTP and new password
4. Better Auth verifies OTP and updates password
5. All existing sessions invalidated
6. User can sign in with new password

### Admin Functions

1. Admin users can ban/unban society members
2. Ban reasons and expiration dates are tracked
3. Banned users cannot access the system
4. Admin actions are logged for audit trail

## Files Structure

```
app/(auth)/
├── actions.ts              # Server actions for auth operations
├── layout.tsx              # Authentication layout with animations
├── login/
│   └── page.tsx           # Login page component
├── signup/
│   └── page.tsx           # Signup page component
├── forgot-password/
│   └── page.tsx           # Forgot password page
└── reset-password/
    └── page.tsx           # Password reset page

app/(sidebar)/society-members/
├── actions.ts              # Admin actions for user management
└── page.tsx               # Society members management page

lib/
├── auth.ts                 # Better Auth configuration with Drizzle
├── auth-client.ts          # Client-side auth utilities
├── email-service.ts        # Email OTP service with Resend
├── schemas.ts              # Zod validation schemas
└── action-helpers.ts       # Action validation utilities

lib/zod/
├── auth.ts                 # Authentication validation schemas
├── common.ts               # Common validation utilities
└── index.ts                # Schema exports

db/schema/
└── auth.ts                 # Better Auth database schema with Drizzle

types/
├── better-auth.d.ts        # Better Auth type extensions
└── index.d.ts              # Global type definitions
```

## Configuration

See [Authentication Configuration](./configuration.md) for detailed setup instructions.

## Components

See [Authentication Components](./components.md) for component documentation.

## Security

See [Authentication Security](./security.md) for security considerations and best practices.
