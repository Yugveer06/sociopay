# Authentication System

SocioPay uses Better Auth for secure authentication with custom user fields specific to community management.

## Overview

The authentication system supports:

-   Email/password authentication
-   Custom user fields (house number, phone)
-   Session management with secure cookies
-   Form validation with Zod schemas
-   Server actions for auth operations

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auth Pages    │───▶│  Server Actions  │───▶│   Better Auth   │
│  (login/signup) │    │   (validated)    │    │   + Database    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## User Schema

### Custom Fields

-   **houseNumber**: Unique identifier for community members
    -   Format: `^[A-Z]-\d{1,2}$` (e.g., A-1, B-9, C-23)
    -   Required and unique across all users
-   **phone**: 10-digit phone number
    -   Format: `^[0-9]{10}$`
    -   Required for verification

### Standard Fields

-   **name**: Full name of the user
-   **email**: Email address (unique)
-   **password**: Hashed password
-   **emailVerified**: Email verification status

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
2. Form validation
3. Better Auth verifies credentials
4. Session token generated and stored in cookie
5. User redirected to dashboard

## Files Structure

```
app/(auth)/
├── actions.ts          # Server actions for auth operations
├── login/
│   └── page.tsx       # Login page component
└── signup/
    └── page.tsx       # Signup page component

lib/
├── auth.ts            # Better Auth configuration
├── schemas.ts         # Zod validation schemas
└── action-helpers.ts  # Action validation utilities
```

## Configuration

See [Authentication Configuration](./configuration.md) for detailed setup instructions.

## Components

See [Authentication Components](./components.md) for component documentation.

## Security

See [Authentication Security](./security.md) for security considerations and best practices.
