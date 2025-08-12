# Drizzle ORM Integration Guide

## Overview

This guide covers the integration of Drizzle ORM into SocioPay, providing type-safe database operations while maintaining compatibility with Better Auth and the existing Supabase PostgreSQL database.

## Architecture

### Integration Approach

The Drizzle integration follows a hybrid architecture:

- **Drizzle ORM**: Type-safe database operations and schema definitions
- **Better Auth with Drizzle Adapter**: Authentication table management
- **Supabase PostgreSQL**: Underlying database infrastructure
- **Zero Migration**: Works with existing database schema

### Benefits

- **Type Safety**: Compile-time type checking for all database operations
- **Performance**: Optimized SQL query generation
- **Developer Experience**: Full IntelliSense support and autocomplete
- **Maintainability**: Single source of truth for database schema
- **Compatibility**: Seamless integration with existing Better Auth setup

## Installation and Setup

### Dependencies

```json
{
  "dependencies": {
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "better-auth": "^1.3.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

### Configuration Files

#### `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Load environment variables
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

#### `lib/db.ts`

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

## Schema Definition

### Complete Schema Structure

```typescript
// lib/schema.ts
import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  serial,
  uuid,
  numeric,
  date,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Custom enums
export const intervalTypeEnum = pgEnum('interval_type', [
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
])

// Better Auth tables
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

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
})

// Application tables
export const paymentCategories = pgTable('payment_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

export const expenseCategories = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

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

export const societyFunds = pgTable('society_funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalFunds: numeric('total_funds', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
})

// Relations
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

export const expenseRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}))

export const paymentCategoryRelations = relations(
  paymentCategories,
  ({ many }) => ({
    payments: many(payments),
  })
)

export const expenseCategoryRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  })
)
```

## Better Auth Integration

### Updated Configuration

```typescript
// lib/auth.ts
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

### Key Changes

1. **Adapter**: Replaced `pg` Pool with `drizzleAdapter`
2. **Schema Mapping**: Explicit schema mapping for Better Auth tables
3. **Type Safety**: Full type safety for authentication operations
4. **Compatibility**: Maintains all existing Better Auth functionality

## Type System

### Type Exports

```typescript
// lib/types.ts
export type {
  User,
  Payment,
  Expense,
  PaymentCategory,
  ExpenseCategory,
  SocietyFunds,
} from './schema'

// Inferred types
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { user, payments, expenses } from './schema'

export type User = InferSelectModel<typeof user>
export type UserInsert = InferInsertModel<typeof user>

export type Payment = InferSelectModel<typeof payments>
export type PaymentInsert = InferInsertModel<typeof payments>

export type Expense = InferSelectModel<typeof expenses>
export type ExpenseInsert = InferInsertModel<typeof expenses>
```

### Usage in Components

```typescript
import type { User, Payment } from '@/lib/types'
import { db } from '@/lib/db'
import { payments, user } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// Type-safe component props
interface PaymentListProps {
  user: User
  payments: Payment[]
}

// Type-safe database operations
const getUserPayments = async (userId: string): Promise<Payment[]> => {
  return await db.select().from(payments).where(eq(payments.userId, userId))
}
```

## Database Operations

### Basic CRUD Operations

#### Create

```typescript
import { db } from '@/lib/db'
import { payments, paymentCategories } from '@/lib/schema'

// Insert new payment
const newPayment = await db
  .insert(payments)
  .values({
    userId: 'user-123',
    categoryId: 1,
    amount: '1500.00',
    paymentDate: new Date(),
    notes: 'Monthly maintenance fee',
  })
  .returning()
```

#### Read

```typescript
import { eq, desc, and, gte } from 'drizzle-orm'

// Get user payments
const userPayments = await db
  .select()
  .from(payments)
  .where(eq(payments.userId, userId))
  .orderBy(desc(payments.paymentDate))

// Get payments with category information
const paymentsWithCategory = await db
  .select({
    id: payments.id,
    amount: payments.amount,
    paymentDate: payments.paymentDate,
    categoryName: paymentCategories.name,
    notes: payments.notes,
  })
  .from(payments)
  .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
  .where(eq(payments.userId, userId))

// Get payments for current year
const currentYearPayments = await db
  .select()
  .from(payments)
  .where(
    and(
      eq(payments.userId, userId),
      gte(payments.paymentDate, new Date(new Date().getFullYear(), 0, 1))
    )
  )
```

#### Update

```typescript
// Update payment
const updatedPayment = await db
  .update(payments)
  .set({
    amount: '1600.00',
    notes: 'Updated maintenance fee',
  })
  .where(eq(payments.id, paymentId))
  .returning()
```

#### Delete

```typescript
// Delete payment
await db.delete(payments).where(eq(payments.id, paymentId))
```

### Advanced Queries

#### Relational Queries

```typescript
// Get user with all payments and categories
const userWithPayments = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    payments: {
      with: {
        category: true,
      },
      orderBy: desc(payments.paymentDate),
    },
  },
})
```

#### Aggregations

```typescript
import { sum, count, avg } from 'drizzle-orm'

// Payment summary by category
const paymentSummary = await db
  .select({
    categoryName: paymentCategories.name,
    totalAmount: sum(payments.amount),
    paymentCount: count(),
    averageAmount: avg(payments.amount),
  })
  .from(payments)
  .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
  .groupBy(paymentCategories.name)

// Monthly payment totals
const monthlyTotals = await db
  .select({
    month: sql<string>`DATE_TRUNC('month', ${payments.paymentDate})`,
    total: sum(payments.amount),
  })
  .from(payments)
  .where(eq(payments.userId, userId))
  .groupBy(sql`DATE_TRUNC('month', ${payments.paymentDate})`)
  .orderBy(sql`DATE_TRUNC('month', ${payments.paymentDate})`)
```

#### Complex Joins

```typescript
// Get users with their payment statistics
const userPaymentStats = await db
  .select({
    userId: user.id,
    userName: user.name,
    houseNumber: user.houseNumber,
    totalPayments: sum(payments.amount),
    paymentCount: count(payments.id),
    lastPaymentDate: max(payments.paymentDate),
  })
  .from(user)
  .leftJoin(payments, eq(user.id, payments.userId))
  .groupBy(user.id, user.name, user.houseNumber)
  .orderBy(desc(sum(payments.amount)))
```

## Development Workflow

### Available Scripts

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

### Development Process

1. **Schema Changes**: Modify `lib/schema.ts`
2. **Generate Migration**: Run `pnpm db:generate`
3. **Apply Changes**: Run `pnpm db:push`
4. **Verify**: Use `pnpm db:studio` to inspect changes
5. **Test**: Update application code and test functionality

### Drizzle Studio

Drizzle Studio provides a web-based interface for database management:

- **Visual Schema**: View tables, relationships, and constraints
- **Data Browser**: Browse and edit table data
- **Query Runner**: Execute custom SQL queries
- **Schema Inspector**: Analyze database structure

## Migration from Supabase Types

### Before (Supabase Types)

```typescript
import { Database } from '@/db/types'

type User = Database['public']['Tables']['user']['Row']
type UserInsert = Database['public']['Tables']['user']['Insert']

// Raw SQL or Supabase client queries
const { data: users } = await supabase
  .from('user')
  .select('*')
  .eq('houseNumber', 'A-1')
```

### After (Drizzle ORM)

```typescript
import type { User } from '@/lib/types'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// Type-safe Drizzle queries
const users = await db.select().from(user).where(eq(user.houseNumber, 'A-1'))
```

### Migration Steps

1. **Install Dependencies**: Add Drizzle packages
2. **Create Schema**: Define tables in `lib/schema.ts`
3. **Update Database Connection**: Replace Supabase client with Drizzle
4. **Update Better Auth**: Switch to Drizzle adapter
5. **Replace Type Imports**: Use Drizzle-generated types
6. **Update Queries**: Convert to Drizzle syntax
7. **Test Functionality**: Ensure all features work correctly

## Error Handling

### Database Connection Errors

```typescript
// lib/db.ts
try {
  const client = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
  })
  export const db = drizzle(client, { schema })
} catch (error) {
  console.error('Failed to initialize database connection:', error)
  throw new Error('Database connection failed')
}
```

### Query Error Handling

```typescript
// Wrapper for safe database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error('Database operation failed:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

// Usage
const { data: payments, error } = await safeDbOperation(() =>
  db.select().from(payments).where(eq(payments.userId, userId))
)

if (error) {
  // Handle error
  console.error('Failed to fetch payments:', error)
  return
}

// Use data safely
console.log('User payments:', payments)
```

## Performance Considerations

### Connection Pooling

```typescript
// Optimized connection configuration
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase compatibility
  max: 10, // Maximum connections
  idle_timeout: 20, // Idle timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
})
```

### Query Optimization

```typescript
// Use indexes effectively
const indexedQuery = await db
  .select()
  .from(user)
  .where(eq(user.houseNumber, 'A-1')) // Uses unique index

// Limit results for pagination
const paginatedPayments = await db
  .select()
  .from(payments)
  .where(eq(payments.userId, userId))
  .orderBy(desc(payments.paymentDate))
  .limit(20)
  .offset(page * 20)

// Use prepared statements for repeated queries
const getUserPayments = db
  .select()
  .from(payments)
  .where(eq(payments.userId, placeholder('userId')))
  .prepare()

const userPayments = await getUserPayments.execute({ userId: 'user-123' })
```

### Batch Operations

```typescript
// Batch inserts
const newPayments = await db
  .insert(payments)
  .values([
    { userId: 'user-1', categoryId: 1, amount: '1500.00' },
    { userId: 'user-2', categoryId: 1, amount: '1500.00' },
    { userId: 'user-3', categoryId: 1, amount: '1500.00' },
  ])
  .returning()

// Batch updates
await db.transaction(async tx => {
  await tx
    .update(payments)
    .set({ amount: '1600.00' })
    .where(eq(payments.categoryId, 1))
  await tx.update(societyFunds).set({ totalFunds: '50000.00' })
})
```

## Best Practices

### Schema Design

1. **Use Appropriate Types**: Choose correct column types for data
2. **Define Relationships**: Use foreign keys and relations
3. **Add Constraints**: Implement unique, not null, and check constraints
4. **Index Strategy**: Add indexes for frequently queried columns
5. **Naming Convention**: Use consistent naming for tables and columns

### Query Patterns

1. **Type Safety**: Always use typed queries
2. **Error Handling**: Wrap database operations in try-catch
3. **Transactions**: Use transactions for related operations
4. **Prepared Statements**: Use for repeated queries
5. **Pagination**: Implement proper pagination for large datasets

### Development Workflow

1. **Schema First**: Define schema before writing queries
2. **Migration Strategy**: Use migrations for schema changes
3. **Testing**: Test database operations thoroughly
4. **Documentation**: Document complex queries and relationships
5. **Performance**: Monitor and optimize query performance

## Troubleshooting

### Common Issues

#### Connection Problems

```bash
# Check database URL format
echo $DATABASE_URL

# Test connection
node -e "const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT NOW()\`.then(console.log).catch(console.error).finally(() => sql.end());"
```

#### Schema Sync Issues

```bash
# Introspect current database
pnpm db:introspect

# Generate new migration
pnpm db:generate

# Push changes
pnpm db:push
```

#### Type Errors

```typescript
// Ensure proper type imports
import type { User, Payment } from '@/lib/types'

// Use correct column references
import { user, payments } from '@/lib/schema'
const query = db.select().from(user).where(eq(user.id, userId))
```

### Debug Mode

```typescript
// Enable query logging
const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

// Log specific queries
const result = await db
  .select()
  .from(payments)
  .where(eq(payments.userId, userId))
  .$debug() // Logs the generated SQL
```

## Conclusion

The Drizzle ORM integration provides a robust, type-safe foundation for database operations in SocioPay while maintaining full compatibility with existing functionality. The migration preserves all data and authentication flows while adding significant developer experience improvements and compile-time safety.

Key benefits achieved:

- **Type Safety**: Compile-time validation of all database operations
- **Performance**: Optimized SQL generation and query execution
- **Developer Experience**: Full IntelliSense support and autocomplete
- **Maintainability**: Single source of truth for database schema
- **Compatibility**: Seamless integration with Better Auth and existing infrastructure
