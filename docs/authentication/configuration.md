# Authentication Configuration

## Better Auth Setup

### Main Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from 'better-auth'
import { admin, emailOTP } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './schema'

export const auth = betterAuth({
  user: {
    additionalFields: {
      houseNumber: {
        type: 'string',
        unique: true,
        required: true,
        validation: {
          maxLength: 10,
          pattern: '^[A-Z]-\\d{1,2}$',
          message: 'Please enter a valid house number (e.g., A-1, B-9, C-23).',
        },
      },
      phone: {
        type: 'string',
        required: true,
        validation: {
          minLength: 10,
          maxLength: 10,
          pattern: '^[0-9]{10}$',
          message: 'Please enter a valid 10-digit phone number.',
        },
      },
    },
  },
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    nextCookies(),
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Email OTP implementation
      },
    }),
  ],
})
```

### Key Configuration Changes

The authentication system has been updated to use Drizzle ORM:

- **Database Adapter**: Replaced `pg.Pool` with `drizzleAdapter`
- **Schema Mapping**: Explicit mapping of Better Auth tables to Drizzle schema
- **Type Safety**: Full type safety for authentication operations
- **Enhanced Plugins**: Added `nextCookies()` and `emailOTP()` plugins

### Environment Variables

Required environment variables in `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

### Database Connection

The system uses PostgreSQL via Supabase with Drizzle ORM:

- **Adapter**: `drizzleAdapter` for type-safe database operations
- **Connection**: Managed by Drizzle with `postgres` client
- **Schema**: Explicit schema mapping for Better Auth tables
- **Type Safety**: Full TypeScript support for all database operations

```typescript
// Database connection (lib/db.ts)
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client, { schema })
```

## Custom User Fields

### House Number Validation

- **Pattern**: `^[A-Z]-\d{1,2}$`
- **Examples**: A-1, B-9, C-23, Z-99
- **Constraints**:
  - Must start with uppercase letter
  - Followed by hyphen
  - End with 1-2 digits
  - Unique across all users

### Phone Number Validation

- **Pattern**: `^[0-9]{10}$`
- **Length**: Exactly 10 digits
- **Format**: Numbers only, no spaces or special characters
- **Example**: 9876543210

## Session Management

### Cookie Configuration

```typescript
cookieStore.set({
  name: 'better-auth.session_token',
  value: response.token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
})
```

### Session Properties

- **Duration**: 7 days
- **Security**: HTTP-only cookies in production
- **SameSite**: Lax for CSRF protection
- **Secure**: HTTPS only in production

## Admin Plugin

The admin plugin is enabled for administrative functions:

```typescript
plugins: [admin()]
```

This provides additional administrative capabilities for user management.

## Database Schema

The authentication system uses Drizzle ORM schema definitions for the following tables:

- `user` - User accounts with custom fields (houseNumber, phone)
- `account` - OAuth and credential accounts
- `session` - Active user sessions
- `verification` - Email verification tokens

### Schema Integration

Better Auth tables are mapped to Drizzle schema:

```typescript
database: drizzleAdapter(db, {
  provider: "pg",
  schema: {
    user: schema.user,
    account: schema.account,
    session: schema.session,
    verification: schema.verification,
  },
}),
```

See [Database Documentation](../database/README.md) for detailed table structures and [Type Migration Guide](../database/type-migration.md) for information about the Drizzle integration.
