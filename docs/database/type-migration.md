# Database Type Migration Guide

## Overview

SocioPay has migrated from Supabase-generated types to Drizzle ORM types for improved type safety, developer experience, and maintainability. The `db/types.ts` file now serves as a compatibility layer during the transition period.

## Migration Summary

### What Changed

-   **Before**: `db/types.ts` contained auto-generated Supabase types with complex generic type definitions
-   **After**: `db/types.ts` is now a compatibility layer that re-exports Drizzle ORM types from `@/lib/types`
-   **Architecture**: Moved from Supabase client-based types to Drizzle ORM schema-based types

### Key Benefits

-   **Type Safety**: Compile-time validation of all database operations
-   **Simplified Types**: Clean, straightforward type definitions without complex generics
-   **Better DX**: Full IntelliSense support and autocomplete
-   **Single Source of Truth**: Schema definitions drive both database structure and TypeScript types
-   **Performance**: Optimized SQL generation and query execution

## File Structure Changes

### Before Migration

```
db/
├── types.ts           # 300+ lines of auto-generated Supabase types
└── supabase/         # Supabase configuration
```

### After Migration

```
db/
├── types.ts           # 100 lines - compatibility layer re-exporting Drizzle types
└── supabase/         # Supabase configuration (maintained for infrastructure)

lib/
├── schema.ts          # Drizzle schema definitions (source of truth)
├── types.ts           # Centralized Drizzle type exports
└── db.ts             # Database connection with Drizzle
```

## Type System Comparison

### Legacy Supabase Types

```typescript
// Complex generic type definitions
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = // ... complex type resolution

// Usage (verbose)
type User = Database["public"]["Tables"]["user"]["Row"];
type UserInsert = Database["public"]["Tables"]["user"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["user"]["Update"];
```

### New Drizzle Types

```typescript
// Simple, direct type definitions
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

// Usage (clean)
import type { User, NewUser } from "@/lib/types";
```

## Compatibility Layer

The `db/types.ts` file now serves as a compatibility layer to ensure existing code continues to work during the migration period.

### Current Implementation

```typescript
/**
 * @deprecated This file contains legacy Supabase-generated types.
 *
 * ⚠️  MIGRATION NOTICE ⚠️
 * These types have been replaced with Drizzle ORM types.
 * Please import from "@/lib/types" instead.
 */

// Re-export Drizzle types for backward compatibility
export type {
	User,
	NewUser,
	Account,
	NewAccount,
	Session,
	NewSession,
	Verification,
	NewVerification,
	Payment,
	NewPayment,
	PaymentCategory,
	NewPaymentCategory,
	Expense,
	NewExpense,
	ExpenseCategory,
	NewExpenseCategory,
	SocietyFunds,
	NewSocietyFunds,
	UserWithPayments,
	PaymentWithUser,
	ExpenseWithCategory,
	DbResult,
	IntervalType,
} from "@/lib/types";

// Legacy Database type for backward compatibility
export type Database = {
	public: {
		Tables: {
			user: {
				Row: import("@/lib/types").User;
				Insert: import("@/lib/types").NewUser;
				Update: Partial<import("@/lib/types").NewUser>;
			};
			// ... other tables mapped to Drizzle types
		};
	};
};
```

### Backward Compatibility

The compatibility layer ensures that existing imports continue to work:

```typescript
// These imports still work (but are deprecated)
import { Database, Tables } from "@/db/types";
type User = Tables<"user">;

// Preferred new imports
import type { User } from "@/lib/types";
```

## Migration Path for Developers

### Step 1: Update Imports

**Before:**

```typescript
import { Database } from "@/db/types";
type User = Database["public"]["Tables"]["user"]["Row"];
type UserInsert = Database["public"]["Tables"]["user"]["Insert"];
```

**After:**

```typescript
import type { User, NewUser } from "@/lib/types";
```

### Step 2: Update Database Operations

**Before (Supabase Client):**

```typescript
const { data: users } = await supabase
	.from("user")
	.select("*")
	.eq("houseNumber", "A-1");
```

**After (Drizzle ORM):**

```typescript
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

const users = await db.select().from(user).where(eq(user.houseNumber, "A-1"));
```

### Step 3: Update Type Annotations

**Before:**

```typescript
interface UserListProps {
	users: Database["public"]["Tables"]["user"]["Row"][];
}
```

**After:**

```typescript
import type { User } from "@/lib/types";

interface UserListProps {
	users: User[];
}
```

## New Type Features

### Enhanced Type Safety

```typescript
// Compile-time validation of column names
const users = await db
	.select({
		id: user.id,
		name: user.name,
		houseNumber: user.houseNumber, // TypeScript validates this exists
		// invalidColumn: user.invalid, // ❌ TypeScript error
	})
	.from(user);
```

### Relational Types

```typescript
// Type-safe relations
export type UserWithPayments = User & {
	payments: (Payment & {
		category: PaymentCategory;
	})[];
};

// Usage with full type safety
const userWithPayments = await db.query.user.findFirst({
	where: eq(user.id, userId),
	with: {
		payments: {
			with: {
				category: true,
			},
		},
	},
}); // Returns UserWithPayments type
```

### Utility Types

```typescript
// Database operation result wrapper
export type DbResult<T> = {
	data: T | null;
	error: string | null;
};

// Usage
const getUserPayments = async (
	userId: string
): Promise<DbResult<Payment[]>> => {
	try {
		const payments = await db
			.select()
			.from(payments)
			.where(eq(payments.userId, userId));
		return { data: payments, error: null };
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};
```

## Schema-Driven Development

### Single Source of Truth

The Drizzle schema in `lib/schema.ts` now serves as the single source of truth for:

-   Database table structure
-   TypeScript type definitions
-   Relationship definitions
-   Validation constraints

```typescript
// Schema definition drives everything
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	houseNumber: text("houseNumber").unique().notNull(),
	phone: text("phone").notNull(),
	// ... other fields
});

// Types are automatically inferred
export type User = InferSelectModel<typeof user>; // ✅ Always in sync
```

### Automatic Type Updates

When schema changes, types update automatically:

```typescript
// Add new field to schema
export const user = pgTable("user", {
	// ... existing fields
	apartment: text("apartment"), // New field
});

// Type automatically includes new field
type User = InferSelectModel<typeof user>;
// Now includes: apartment?: string | null
```

## Performance Improvements

### Query Generation

Drizzle generates optimized SQL queries:

```typescript
// Drizzle query
const result = await db
  .select({
    userName: user.name,
    totalPayments: sum(payments.amount),
  })
  .from(user)
  .leftJoin(payments, eq(user.id, payments.userId))
  .where(eq(user.houseNumber, "A-1"))
  .groupBy(user.id);

// Generated SQL (optimized)
SELECT
  "user"."name" AS "userName",
  SUM("payments"."amount") AS "totalPayments"
FROM "user"
LEFT JOIN "payments" ON "user"."id" = "payments"."user_id"
WHERE "user"."houseNumber" = $1
GROUP BY "user"."id"
```

### Prepared Statements

```typescript
// Prepared statement for repeated queries
const getUserByHouse = db
	.select()
	.from(user)
	.where(eq(user.houseNumber, placeholder("houseNumber")))
	.prepare();

// Reuse prepared statement (faster execution)
const userA1 = await getUserByHouse.execute({ houseNumber: "A-1" });
const userB2 = await getUserByHouse.execute({ houseNumber: "B-2" });
```

## Development Workflow

### Updated Commands

```bash
# Drizzle commands (new)
pnpm db:generate    # Generate migrations from schema
pnpm db:push        # Push schema to database
pnpm db:studio      # Open Drizzle Studio

# Legacy commands (still available)
pnpm db:types       # Generate Supabase types (deprecated)
```

### Schema Development Process

1. **Modify Schema**: Update `lib/schema.ts`
2. **Generate Migration**: Run `pnpm db:generate`
3. **Review Migration**: Check generated SQL in `drizzle/` folder
4. **Apply Changes**: Run `pnpm db:push`
5. **Verify Types**: TypeScript automatically picks up changes
6. **Test**: Update application code and test

## Error Handling Improvements

### Type-Safe Error Handling

```typescript
// Before: Runtime errors possible
const user = await supabase
	.from("user")
	.select("invalid_column") // ❌ Runtime error
	.single();

// After: Compile-time validation
const user = await db
	.select({
		// invalid_column: user.invalid, // ❌ TypeScript error at compile time
		name: user.name, // ✅ Validated column
	})
	.from(user);
```

### Better Error Messages

```typescript
// Drizzle provides detailed error context
try {
	await db.insert(user).values({
		// Missing required field
		name: "John Doe",
		// email: "john@example.com", // Required field missing
	});
} catch (error) {
	// Error includes specific field information
	console.error("Database error:", error.message);
	// "null value in column 'email' violates not-null constraint"
}
```

## Testing Considerations

### Type-Safe Test Data

```typescript
// Test data with full type safety
const createTestUser = (overrides: Partial<NewUser> = {}): NewUser => ({
	id: "test-user-1",
	name: "Test User",
	email: "test@example.com",
	emailVerified: false,
	houseNumber: "A-1",
	phone: "1234567890",
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

// Usage in tests
const testUser = createTestUser({ houseNumber: "B-5" });
await db.insert(user).values(testUser);
```

### Mock Database Operations

```typescript
// Type-safe mocking
const mockDb = {
	select: jest.fn().mockReturnValue({
		from: jest.fn().mockReturnValue({
			where: jest.fn().mockResolvedValue([testUser]),
		}),
	}),
} as unknown as typeof db;
```

## Future Considerations

### Deprecation Timeline

1. **Phase 1** (Current): Compatibility layer active, both import paths work
2. **Phase 2** (Next release): Add deprecation warnings for old imports
3. **Phase 3** (Future release): Remove compatibility layer, require new imports

### Migration Checklist

-   [ ] Update all `import { Database } from "@/db/types"` to `import type { User } from "@/lib/types"`
-   [ ] Replace `Tables<"tableName">` with direct type imports
-   [ ] Update database operations to use Drizzle syntax
-   [ ] Test all functionality with new type system
-   [ ] Update documentation and examples

## Troubleshooting

### Common Migration Issues

#### Import Errors

```typescript
// ❌ Old import style (deprecated)
import { Database } from "@/db/types";
type User = Database["public"]["Tables"]["user"]["Row"];

// ✅ New import style
import type { User } from "@/lib/types";
```

#### Type Mismatches

```typescript
// ❌ Using old generic types
const users: Tables<"user">[] = await getUsers();

// ✅ Using direct types
const users: User[] = await getUsers();
```

#### Missing Type Exports

If you encounter missing type exports, check that they're properly exported from `lib/types.ts`:

```typescript
// Ensure all needed types are exported
export type { User, Payment, Expense } from "./schema-types";
```

### Getting Help

-   Check the [Drizzle Integration Guide](./drizzle-integration.md) for detailed setup information
-   Review the [Database README](./README.md) for complete schema documentation
-   Use TypeScript's IntelliSense to explore available types and methods

## Conclusion

The migration from Supabase-generated types to Drizzle ORM types represents a significant improvement in type safety, developer experience, and maintainability. The compatibility layer ensures a smooth transition while providing clear migration paths for all existing code.

Key benefits achieved:

-   **Simplified Types**: Clean, direct type definitions
-   **Better Type Safety**: Compile-time validation of all database operations
-   **Improved DX**: Full IntelliSense support and autocomplete
-   **Performance**: Optimized SQL generation and prepared statements
-   **Maintainability**: Single source of truth for schema and types
