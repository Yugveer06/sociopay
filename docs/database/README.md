# Database Documentation

## Overview

SocioPay uses Supabase PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and Better Auth for authentication table management. The system has migrated from Supabase-generated types to Drizzle ORM types for improved type safety, developer experience, and maintainability.

## 🚨 Important Migration Notice

The database type system has been migrated from Supabase-generated types to Drizzle ORM types. The `db/types.ts` file now serves as a compatibility layer during the transition period.

**For detailed migration information, see: [Type Migration Guide](./type-migration.md)**

### Quick Migration Summary

- **Old**: `import { Database } from "@/db/types"`
- **New**: `import type { User, Payment } from "@/lib/types"`
- **Compatibility**: Old imports still work but are deprecated

## Database Schema

### Architecture

The database uses a modern, type-safe approach:

- **Drizzle ORM** for type-safe database operations and schema definitions
- **Better Auth** with Drizzle adapter for authentication table management
- **PostgreSQL** as the underlying database (Supabase or self-hosted)
- **Modular Schema Organization** with separate files for different domains

### Tables Overview

The database consists of authentication tables and application tables organized in a modular schema structure:

#### Authentication Tables (Better Auth + Drizzle)

- **`user`** - User accounts with community-specific fields (house number, phone, role, ban status)
- **`account`** - Authentication provider accounts and password storage
- **`session`** - Active user sessions with IP tracking and user agent
- **`verification`** - Email verification and OTP tokens

#### Application Tables (Drizzle ORM)

- **`payment_categories`** - Payment category definitions (maintenance, utilities, etc.)
- **`expense_categories`** - Expense category definitions (repairs, supplies, etc.)
- **`payments`** - Member payment records with intervals and periods
- **`expenses`** - Community expense records with categorization
- **`society_funds`** - Community fund tracking and balance management

#### Schema Organization

```
db/schema/
├── index.ts           # Schema exports and cross-table relations
├── auth.ts            # Better Auth tables (user, account, session, verification)
├── categories.ts      # Category tables (payment_categories, expense_categories)
├── payments.ts        # Payment system tables and relations
├── expenses.ts        # Expense management tables and relations
└── funds.ts           # Society funds and financial tracking
```

## User Table

### Schema Definition

```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  houseNumber TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Drizzle Schema Definition

```typescript
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  houseNumber: text('houseNumber').unique().notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
```

### TypeScript Type (Drizzle Generated)

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { user } from '@/lib/schema'

type User = InferSelectModel<typeof user>
type UserInsert = InferInsertModel<typeof user>

// User type includes:
// {
//   id: string;
//   name: string;
//   email: string;
//   emailVerified: boolean;
//   image: string | null;
//   houseNumber: string; // Custom field: A-1, B-9, C-23
//   phone: string; // Custom field: 10-digit number
//   createdAt: Date;
//   updatedAt: Date;
// }
```

### Custom Fields

#### House Number

- **Type**: `TEXT`
- **Constraints**: `UNIQUE NOT NULL`
- **Format**: `^[A-Z]-\d{1,2}$`
- **Examples**: A-1, B-9, C-23, Z-99
- **Purpose**: Unique identifier for community members

#### Phone

- **Type**: `TEXT`
- **Constraints**: `NOT NULL`
- **Format**: `^[0-9]{10}$`
- **Example**: 9876543210
- **Purpose**: Contact verification and communication

### Indexes

```sql
-- Automatic indexes
CREATE UNIQUE INDEX user_email_idx ON "user" (email);
CREATE UNIQUE INDEX user_houseNumber_idx ON "user" (houseNumber);
CREATE INDEX user_createdAt_idx ON "user" (createdAt);
```

## Account Table

### Schema Definition

```sql
CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshToken TEXT,
  refreshTokenExpiresAt TEXT,
  idToken TEXT,
  password TEXT,
  scope TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Drizzle Schema Definition

```typescript
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  accessTokenExpiresAt: text('accessTokenExpiresAt'),
  refreshToken: text('refreshToken'),
  refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
  idToken: text('idToken'),
  password: text('password'),
  scope: text('scope'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})
```

### TypeScript Type (Drizzle Generated)

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { account } from '@/lib/schema'

type Account = InferSelectModel<typeof account>
type AccountInsert = InferInsertModel<typeof account>

// Account type includes:
// {
//   id: string;
//   accountId: string;
//   providerId: string;
//   userId: string;
//   accessToken: string | null;
//   accessTokenExpiresAt: string | null;
//   refreshToken: string | null;
//   refreshTokenExpiresAt: string | null;
//   idToken: string | null;
//   password: string | null;
//   scope: string | null;
//   createdAt: string;
//   updatedAt: string;
// }
```

### Purpose

- Links users to authentication providers
- Stores OAuth tokens and credentials with separate expiration tracking
- Manages password hashes for email/password auth
- Tracks token scopes for OAuth providers
- Maintains creation and update timestamps

### Field Details

#### Token Management

- **`accessToken`**: OAuth access token for API calls
- **`accessTokenExpiresAt`**: Expiration timestamp for access token
- **`refreshToken`**: OAuth refresh token for token renewal
- **`refreshTokenExpiresAt`**: Expiration timestamp for refresh token
- **`scope`**: OAuth scope permissions granted to the application

#### Authentication Methods

- **`password`**: Hashed password for email/password authentication
- **`idToken`**: OpenID Connect ID token containing user claims

#### Metadata

- **`createdAt`**: Account creation timestamp
- **`updatedAt`**: Last modification timestamp

## Session Table

### Schema Definition

```sql
CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expiresAt TIMESTAMP NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### TypeScript Type

```typescript
type Session = {
  id: string
  token: string
  userId: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}
```

### Features

- **Automatic Expiration**: 7-day session lifetime
- **Security Tracking**: IP address and user agent logging
- **Token Management**: Secure session token storage

## Verification Table

### Schema Definition

```sql
CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Purpose

- Email verification tokens
- Password reset tokens
- Other verification workflows

## Database Functions

### `get_member_balance`

Custom function for member balance calculations:

```sql
CREATE OR REPLACE FUNCTION get_member_balance(member_uuid TEXT)
RETURNS NUMERIC AS $$
BEGIN
  -- Function implementation for balance calculation
  -- (Implementation depends on payment system requirements)
  RETURN 0;
END;
$$ LANGUAGE plpgsql;
```

## Connection Configuration

### Environment Setup

```bash
# Database connection string
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase specific
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Connection Pool

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})
```

## Type Generation

### Supabase Types

Types are automatically generated from the database schema:

```bash
# Generate types
pnpm db:types
```

### Type System Structure

```
db/
├── types.ts           # Compatibility layer (re-exports Drizzle types)
└── supabase/         # Supabase configuration

lib/
├── schema.ts          # Drizzle schema definitions (source of truth)
├── types.ts           # Centralized Drizzle type exports
└── db.ts             # Database connection with Drizzle
```

### Usage Example

**New (Recommended):**

```typescript
import type { User, NewUser } from '@/lib/types'
```

**Legacy (Deprecated but still works):**

```typescript
import { Database } from '@/db/types'
type User = Database['public']['Tables']['user']['Row']
type UserInsert = Database['public']['Tables']['user']['Insert']
type UserUpdate = Database['public']['Tables']['user']['Update']
```

## Data Validation

### Database Constraints

```sql
-- Email validation
ALTER TABLE "user" ADD CONSTRAINT user_email_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- House number validation
ALTER TABLE "user" ADD CONSTRAINT user_houseNumber_check
  CHECK (houseNumber ~ '^[A-Z]-\d{1,2}$');

-- Phone validation
ALTER TABLE "user" ADD CONSTRAINT user_phone_check
  CHECK (phone ~ '^[0-9]{10}$');
```

### Application-Level Validation

Validation is also enforced at the application level through Better Auth configuration and Zod schemas.

## Migrations

### Better Auth Migrations

```bash
# Run Better Auth migrations
pnpm auth:migrate
```

### Custom Migrations

For custom schema changes, use Supabase migration tools:

```sql
-- Example migration for additional fields
ALTER TABLE "user" ADD COLUMN apartment_number TEXT;
ALTER TABLE "user" ADD COLUMN building_name TEXT;
```

## Security Considerations

### Row Level Security (RLS)

Consider implementing RLS policies for data protection:

```sql
-- Enable RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own data
CREATE POLICY user_own_data ON "user"
  FOR ALL USING (auth.uid() = id);
```

### Data Encryption

- **Passwords**: Automatically hashed by Better Auth
- **Tokens**: Cryptographically secure random tokens
- **PII**: Consider encryption for sensitive fields

## Backup and Recovery

### Automated Backups

- Supabase provides automated daily backups
- Point-in-time recovery available
- Manual backup exports supported

### Data Export

```sql
-- Export user data
COPY (SELECT * FROM "user") TO '/path/to/users.csv' CSV HEADER;
```

## Performance Optimization

### Indexing Strategy

- Primary keys automatically indexed
- Unique constraints create indexes
- Consider composite indexes for common queries

### Query Optimization

```sql
-- Efficient user lookup by house number
SELECT * FROM "user" WHERE houseNumber = 'A-10';

-- Session cleanup query
DELETE FROM "session" WHERE expiresAt < NOW();
```

## Monitoring

### Key Metrics to Monitor

- Connection pool utilization
- Query performance
- Table sizes and growth
- Index usage statistics
- Failed authentication attempts

## Application Tables (Drizzle ORM)

### Payment Categories

```typescript
export const paymentCategories = pgTable('payment_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})
```

### Payments

```typescript
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => paymentCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').defaultNow(),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  intervalType: intervalTypeEnum('interval_type'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Expenses

```typescript
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => expenseCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: date('expense_date').defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Society Funds

```typescript
export const societyFunds = pgTable('society_funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalFunds: numeric('total_funds', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
})
```

### Custom Types and Enums

```typescript
export const intervalTypeEnum = pgEnum('interval_type', [
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
])
```

## Drizzle ORM Configuration

### Database Connection (`lib/db.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Disable prefetch for connection pooling compatibility
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client, { schema })

export type Database = typeof db
export * from './schema'
```

### Drizzle Kit Configuration (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

## Database Operations with Drizzle

### Type-Safe Queries

```typescript
import { db } from '@/lib/db'
import { payments, user, paymentCategories } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

// Get user payments with category information
const userPayments = await db
  .select()
  .from(payments)
  .where(eq(payments.userId, userId))
  .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
  .orderBy(desc(payments.paymentDate))

// Create new payment
const newPayment = await db
  .insert(payments)
  .values({
    userId: 'user-id',
    categoryId: 1,
    amount: '1500.00',
    paymentDate: new Date(),
    notes: 'Monthly maintenance',
  })
  .returning()

// Get user with all payments using relations
const userWithPayments = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    payments: {
      with: {
        category: true,
      },
    },
  },
})
```

### Relations

```typescript
export const userRelations = relations(user, ({ many }) => ({
  payments: many(payments),
  accounts: many(account),
  sessions: many(session),
}))

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(user, {
    fields: [payments.userId],
    references: [user.id],
  }),
  category: one(paymentCategories, {
    fields: [payments.categoryId],
    references: [paymentCategories.id],
  }),
}))
```

## Additional Documentation

- **[Type Migration Guide](./type-migration.md)** - Complete guide for migrating from Supabase types to Drizzle types
- **[Drizzle Integration Guide](./drizzle-integration.md)** - Comprehensive guide to Drizzle ORM integration

## Database Scripts

### Drizzle Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio for database management
pnpm db:studio

# Introspect existing database to generate schema
pnpm db:introspect
```

### Better Auth Commands

```bash
# Generate Better Auth types
pnpm auth:generate

# Run Better Auth migrations
pnpm auth:migrate
```

### Legacy Supabase Commands

```bash
# Generate Supabase types (legacy, replaced by Drizzle)
pnpm db:types
```

## Type Generation and Usage

### Drizzle Type Exports

```typescript
// lib/types.ts - Centralized type exports
export type {
  User,
  Payment,
  Expense,
  PaymentCategory,
  ExpenseCategory,
  SocietyFunds,
} from './schema'

// Usage in components
import type { User, Payment } from '@/lib/types'
```

### Type Safety Benefits

- **Compile-time validation**: Catch type errors during development
- **IntelliSense support**: Full autocomplete for database operations
- **Refactoring safety**: Schema changes automatically update types
- **Runtime safety**: Drizzle validates data at runtime

## Migration Strategy

### From Supabase Types to Drizzle

1. **Schema Definition**: Define Drizzle schemas matching existing database
2. **Better Auth Integration**: Update to use Drizzle adapter
3. **Type Migration**: Replace Supabase type imports with Drizzle types
4. **Query Migration**: Update database operations to use Drizzle syntax
5. **Validation**: Ensure all functionality works with new setup

### Zero-Downtime Migration

- Existing database schema remains unchanged
- Drizzle works with current table structure
- Better Auth continues to function normally
- No data migration required

## Useful Queries

### Drizzle Query Examples

```typescript
// Active sessions count
const activeSessions = await db
  .select({ count: count() })
  .from(session)
  .where(gt(session.expiresAt, new Date()))

// User registration trends
const registrationTrends = await db
  .select({
    date: sql<string>`DATE(${user.createdAt})`,
    count: count(),
  })
  .from(user)
  .groupBy(sql`DATE(${user.createdAt})`)
  .orderBy(sql`DATE(${user.createdAt})`)

// House number distribution
const houseDistribution = await db
  .select({
    building: sql<string>`SUBSTRING(${user.houseNumber}, 1, 1)`,
    count: count(),
  })
  .from(user)
  .groupBy(sql`SUBSTRING(${user.houseNumber}, 1, 1)`)

// Payment summary by category
const paymentSummary = await db
  .select({
    categoryName: paymentCategories.name,
    totalAmount: sum(payments.amount),
    paymentCount: count(),
  })
  .from(payments)
  .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
  .groupBy(paymentCategories.name)
```
