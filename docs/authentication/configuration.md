# Authentication Configuration

## Better Auth Setup

### Main Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
	user: {
		additionalFields: {
			houseNumber: {
				type: "string",
				unique: true,
				required: true,
				validation: {
					maxLength: 10,
					pattern: "^[A-Z]-\\d{1,2}$",
					message:
						"Please enter a valid house number (e.g., A-1, B-9, C-23).",
				},
			},
			phone: {
				type: "string",
				required: true,
				validation: {
					minLength: 10,
					maxLength: 10,
					pattern: "^[0-9]{10}$",
					message: "Please enter a valid 10-digit phone number.",
				},
			},
		},
	},
	emailAndPassword: { enabled: true },
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	plugins: [admin()],
});
```

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

The system uses PostgreSQL via Supabase with the following connection settings:

-   **Production**: SSL enabled with `rejectUnauthorized: false`
-   **Development**: SSL disabled for local development
-   **Connection pooling**: Managed by `pg.Pool`

## Custom User Fields

### House Number Validation

-   **Pattern**: `^[A-Z]-\d{1,2}$`
-   **Examples**: A-1, B-9, C-23, Z-99
-   **Constraints**:
    -   Must start with uppercase letter
    -   Followed by hyphen
    -   End with 1-2 digits
    -   Unique across all users

### Phone Number Validation

-   **Pattern**: `^[0-9]{10}$`
-   **Length**: Exactly 10 digits
-   **Format**: Numbers only, no spaces or special characters
-   **Example**: 9876543210

## Session Management

### Cookie Configuration

```typescript
cookieStore.set({
	name: "better-auth.session_token",
	value: response.token,
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### Session Properties

-   **Duration**: 7 days
-   **Security**: HTTP-only cookies in production
-   **SameSite**: Lax for CSRF protection
-   **Secure**: HTTPS only in production

## Admin Plugin

The admin plugin is enabled for administrative functions:

```typescript
plugins: [admin()];
```

This provides additional administrative capabilities for user management.

## Database Schema

The authentication system creates the following tables:

-   `user` - User accounts with custom fields
-   `account` - OAuth and credential accounts
-   `session` - Active user sessions
-   `verification` - Email verification tokens

See [Database Schema](../database/schema.md) for detailed table structures.
