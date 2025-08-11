# Database Documentation

## Overview

SocioPay uses Supabase PostgreSQL as the primary database with Better Auth for authentication table management.

## Database Schema

### Tables Overview

The database consists of four main tables managed by Better Auth:

-   **`user`** - User accounts with community-specific fields
-   **`account`** - Authentication provider accounts
-   **`session`** - Active user sessions
-   **`verification`** - Email verification tokens

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

### TypeScript Type

```typescript
type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	houseNumber: string; // Custom field: A-1, B-9, C-23
	phone: string; // Custom field: 10-digit number
	createdAt: string;
	updatedAt: string;
};
```

### Custom Fields

#### House Number

-   **Type**: `TEXT`
-   **Constraints**: `UNIQUE NOT NULL`
-   **Format**: `^[A-Z]-\d{1,2}$`
-   **Examples**: A-1, B-9, C-23, Z-99
-   **Purpose**: Unique identifier for community members

#### Phone

-   **Type**: `TEXT`
-   **Constraints**: `NOT NULL`
-   **Format**: `^[0-9]{10}$`
-   **Example**: 9876543210
-   **Purpose**: Contact verification and communication

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
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope TEXT,
  password TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Purpose

-   Links users to authentication providers
-   Stores OAuth tokens and credentials
-   Manages password hashes for email/password auth

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
	id: string;
	token: string;
	userId: string;
	expiresAt: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
	updatedAt: string;
};
```

### Features

-   **Automatic Expiration**: 7-day session lifetime
-   **Security Tracking**: IP address and user agent logging
-   **Token Management**: Secure session token storage

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

-   Email verification tokens
-   Password reset tokens
-   Other verification workflows

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
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: false,
});
```

## Type Generation

### Supabase Types

Types are automatically generated from the database schema:

```bash
# Generate types
pnpm db:types
```

### Generated Types Location

```
db/
├── types.ts           # Auto-generated Supabase types
└── supabase/         # Supabase configuration
```

### Usage Example

```typescript
import { Database } from "@/db/types";

type User = Database["public"]["Tables"]["user"]["Row"];
type UserInsert = Database["public"]["Tables"]["user"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["user"]["Update"];
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

-   **Passwords**: Automatically hashed by Better Auth
-   **Tokens**: Cryptographically secure random tokens
-   **PII**: Consider encryption for sensitive fields

## Backup and Recovery

### Automated Backups

-   Supabase provides automated daily backups
-   Point-in-time recovery available
-   Manual backup exports supported

### Data Export

```sql
-- Export user data
COPY (SELECT * FROM "user") TO '/path/to/users.csv' CSV HEADER;
```

## Performance Optimization

### Indexing Strategy

-   Primary keys automatically indexed
-   Unique constraints create indexes
-   Consider composite indexes for common queries

### Query Optimization

```sql
-- Efficient user lookup by house number
SELECT * FROM "user" WHERE houseNumber = 'A-10';

-- Session cleanup query
DELETE FROM "session" WHERE expiresAt < NOW();
```

## Monitoring

### Key Metrics to Monitor

-   Connection pool utilization
-   Query performance
-   Table sizes and growth
-   Index usage statistics
-   Failed authentication attempts

### Useful Queries

```sql
-- Active sessions count
SELECT COUNT(*) FROM "session" WHERE expiresAt > NOW();

-- User registration trends
SELECT DATE(createdAt), COUNT(*)
FROM "user"
GROUP BY DATE(createdAt)
ORDER BY DATE(createdAt);

-- House number distribution
SELECT SUBSTRING(houseNumber, 1, 1) as building, COUNT(*)
FROM "user"
GROUP BY SUBSTRING(houseNumber, 1, 1);
```
