# API Documentation

## Overview

SocioPay uses Next.js Server Actions for secure, type-safe API operations. The application includes authentication, payment management, and expense tracking through validated server actions.

## API Structure

### Authentication API (`/api/auth/[...all]`)

Better Auth handles all authentication endpoints through a single catch-all route:

- `POST /api/auth/sign-in` - User authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/forgot-password` - Password reset initiation
- `POST /api/auth/reset-password` - Password reset completion
- `GET /api/auth/session` - Get current session

## Server Actions

### Authentication Actions (`app/(auth)/actions.ts`)

#### `signIn(data: SignInData)`

Authenticates a user with email and password.

**Parameters:**

```typescript
type SignInData = {
  email: string // Valid email address
  password: string // Minimum 6 characters
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  errors?: Record<string, string[]>
}
```

**Example Usage:**

```typescript
import { signIn } from '@/app/(auth)/actions'

const result = await signIn({
  email: 'user@example.com',
  password: 'password123',
})

if (result.success) {
  // User authenticated successfully
  console.log('Welcome', result.data?.user.name)
} else {
  // Handle authentication error
  console.error(result.message)
}
```

**Behavior:**

- Validates input using `signInSchema`
- Calls Better Auth API for authentication
- Sets secure session cookie on success
- Returns user data and session token
- Handles authentication errors gracefully

#### `signUp(data: SignUpData)`

Creates a new user account with community-specific fields.

**Parameters:**

```typescript
type SignUpData = {
  fullName: string // Minimum 2 characters
  houseNumber: string // Format: A-1, B-9, C-23
  email: string // Valid email address
  phone: string // 10-digit number
  password: string // Minimum 6 characters
  confirmPassword: string // Must match password
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  errors?: Record<string, string[]>
}
```

**Example Usage:**

```typescript
import { signUp } from '@/app/(auth)/actions'

const result = await signUp({
  fullName: 'John Doe',
  houseNumber: 'A-10',
  email: 'john@example.com',
  phone: '9876543210',
  password: 'password123',
  confirmPassword: 'password123',
})

if (result.success) {
  // Account created successfully
  console.log('Account created for', result.data?.user.name)
} else {
  // Handle registration errors
  if (result.errors) {
    Object.entries(result.errors).forEach(([field, messages]) => {
      console.error(`${field}: ${messages.join(', ')}`)
    })
  }
}
```

**Behavior:**

- Validates all input fields using `signUpSchema`
- Checks password confirmation match
- Validates house number format and uniqueness
- Creates user account via Better Auth
- Sets session cookie for immediate login
- Returns user data and session token

#### `forgotPassword(data: ForgotPasswordData)`

Initiates password reset process by sending OTP to user's email.

**Parameters:**

```typescript
type ForgotPasswordData = {
  email: string // Valid email address
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
}
```

**Example Usage:**

```typescript
import { forgotPassword } from '@/app/(auth)/actions'

const result = await forgotPassword({
  email: 'user@example.com',
})

if (result.success) {
  // OTP sent successfully
  console.log('Reset code sent to email')
}
```

**Behavior:**

- Validates email format
- Sends 6-digit OTP to user's email
- Returns success message

#### `resetPassword(data: ResetPasswordData)`

Resets user password using OTP verification.

**Parameters:**

```typescript
type ResetPasswordData = {
  email: string // Valid email address
  otp: string // 6-digit OTP from email
  password: string // New password (minimum 6 characters)
  confirmPassword: string // Must match password
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
}
```

**Example Usage:**

```typescript
import { resetPassword } from '@/app/(auth)/actions'

const result = await resetPassword({
  email: 'user@example.com',
  otp: '123456',
  password: 'newpassword123',
  confirmPassword: 'newpassword123',
})

if (result.success) {
  // Password reset successfully
  console.log('Password updated')
}
```

**Behavior:**

- Validates OTP and email
- Checks password confirmation match
- Updates user password
- Invalidates existing sessions

#### `signOut()`

Signs out the current user and invalidates their session.

**Parameters:** None

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
}
```

**Example Usage:**

```typescript
import { signOut } from '@/app/(auth)/actions'

const result = await signOut()

if (result.success) {
  // User signed out successfully
  console.log('Signed out')
}
```

**Behavior:**

- Invalidates current session
- Clears session cookies
- Returns success confirmation

## Action Helpers

### `validatedAction<T, K>(schema, action)`

Utility function that wraps server actions with Zod validation.

**Parameters:**

- `schema`: Zod schema for input validation
- `action`: Async function to execute with validated data

**Returns:**

- Function that validates input and executes action
- Standardized error handling for validation failures

**Example:**

```typescript
import { validatedAction } from '@/lib/action-helpers'
import { z } from 'zod'

const mySchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
})

const myAction = validatedAction(mySchema, async data => {
  // data is automatically typed and validated
  return {
    success: true,
    message: `Hello ${data.name}, age ${data.age}`,
  }
})
```

## Error Handling

### Error Response Format

All server actions return a consistent error format:

```typescript
type ActionState = {
  success: false
  message: string // Human-readable error message
  errors?: Record<string, string[]> // Field-specific validation errors
}
```

### Error Types

#### Validation Errors

```typescript
{
  success: false,
  message: "Validation failed",
  errors: {
    email: ["Please enter a valid email address."],
    password: ["Password must be at least 6 characters."]
  }
}
```

#### Authentication Errors

```typescript
{
  success: false,
  message: "Invalid email or password"
}
```

#### Server Errors

```typescript
{
  success: false,
  message: "An unexpected error occurred"
}
```

## Session Management

### Cookie Configuration

Server actions automatically manage session cookies:

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
- **Security**: HTTP-only, secure in production
- **CSRF Protection**: SameSite lax policy
- **Automatic Cleanup**: Expired sessions removed automatically

## Type Safety

### Schema Validation

All server actions use Zod schemas for type-safe validation:

```typescript
// Input validation
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Type inference
type SignInData = z.infer<typeof signInSchema>
```

### Return Types

Consistent return types across all actions:

```typescript
type ActionState<T = any> = {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}
```

## Security Considerations

### Input Validation

- All inputs validated on both client and server
- Zod schemas prevent invalid data processing
- SQL injection prevention through parameterized queries

### Authentication Security

- Passwords never stored in plain text
- Session tokens are cryptographically secure
- Automatic session expiration
- CSRF protection via SameSite cookies

### Error Security

- Generic error messages prevent information disclosure
- Detailed validation errors only for client-side feedback
- Server errors logged but not exposed to client

## Payment Actions (`app/(sidebar)/payments/actions.ts`)

### `addPayment(data: AddPaymentData)`

Creates a new payment record for a community member.

**Parameters:**

```typescript
type AddPaymentData = {
  userId: string // User ID from session
  categoryId: string // Payment category ID
  amount: string // Payment amount (e.g., "1500.00")
  paymentDate: Date // Date of payment
  periodStart?: Date // Start of payment period (optional)
  periodEnd?: Date // End of payment period (optional)
  intervalType?: 'monthly' | 'quarterly' | 'half_yearly' | 'annually' // Payment interval (optional)
  notes?: string // Additional notes (optional)
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
  data?: {
    payment: Payment
  }
  errors?: Record<string, string[]>
}
```

**Example Usage:**

```typescript
import { addPayment } from '@/app/(sidebar)/payments/actions'

const result = await addPayment({
  userId: session.user.id,
  categoryId: '1',
  amount: '1500.00',
  paymentDate: new Date(),
  intervalType: 'monthly',
  notes: 'Monthly maintenance fee',
})
```

### `exportPaymentsToCSV()`

Exports all payments to CSV format with user and category information.

**Returns:**

```typescript
type ExportResult = {
  success: boolean
  message?: string
  data?: string // CSV content
  filename?: string // Suggested filename
}
```

### `exportPaymentsToPDF()`

Exports payment data for PDF generation (client-side processing).

**Returns:**

```typescript
type ExportResult = {
  success: boolean
  message?: string
  data?: PaymentExportData[]
  filename?: string
}
```

## Expense Actions (`app/(sidebar)/expenses/actions.ts`)

### `addExpense(data: AddExpenseData)`

Creates a new expense record for the community.

**Parameters:**

```typescript
type AddExpenseData = {
  categoryId: string // Expense category ID (converted to integer)
  amount: string // Expense amount as string (e.g., "2500.00")
  expenseDate: string // Date when expense occurred (ISO date string)
  notes?: string // Additional notes (optional)
}
```

**Returns:**

```typescript
type ActionState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
```

**Example Usage:**

```typescript
import { addExpense } from '@/app/(sidebar)/expenses/actions'

const result = await addExpense({
  categoryId: '2',
  amount: '2500.00',
  expenseDate: new Date().toISOString().split('T')[0],
  notes: 'Monthly maintenance supplies',
})

if (result.success) {
  console.log('Expense added successfully')
} else {
  console.error(result.message)
}
```

**Behavior:**

- Validates input using `addExpenseSchema`
- Converts categoryId to integer and validates amount
- Requires user authentication
- Handles database constraint violations
- Returns user-friendly error messages

### `exportExpensesToCSV()`

Exports all expense records to CSV format with complete category information.

**Returns:**

```typescript
type ExportResult = {
  success: boolean
  message?: string
  data?: string // CSV content
  filename?: string // Suggested filename
}
```

**CSV Columns:**

- ID, Amount, Expense Date, Category, Notes, Created At

### `exportExpensesToPDF()`

Exports expense data for PDF generation (client-side processing).

**Returns:**

```typescript
type ExportResult = {
  success: boolean
  message?: string
  data?: ExpenseExportData[]
  filename?: string
}
```

## Data Types

### Payment Types

```typescript
type Payment = {
  id: string
  userId: string
  categoryId: number
  amount: string
  paymentDate: Date | null
  periodStart: Date | null
  periodEnd: Date | null
  intervalType: 'monthly' | 'quarterly' | 'half_yearly' | 'annually' | null
  notes: string | null
  createdAt: Date | null
}

type PaymentCategory = {
  id: number
  name: string
  description: string | null
}
```

### Expense Types

```typescript
type Expense = {
  id: string
  categoryId: number
  amount: string
  expenseDate: Date | null
  notes: string | null
  createdAt: Date | null
}

type ExpenseCategory = {
  id: number
  name: string
  description: string | null
}
```

## Best Practices

### Using Server Actions

1. **Always validate input** using Zod schemas
2. **Handle errors gracefully** with proper user feedback
3. **Use TypeScript** for type safety
4. **Implement loading states** for better UX
5. **Follow security best practices** for sensitive operations
6. **Check authentication** before performing operations
7. **Revalidate paths** after data mutations

### Example Implementation

```typescript
"use client";

import { useState, useTransition } from "react";
import { addPayment } from "@/app/(sidebar)/payments/actions";

export function AddPaymentForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState(null);

	const handleSubmit = (formData: FormData) => {
		startTransition(async () => {
			const data = {
				userId: session.user.id,
				categoryId: formData.get("categoryId") as string,
				amount: formData.get("amount") as string,
				paymentDate: new Date(formData.get("paymentDate") as string),
				notes: formData.get("notes") as string,
			};

			const result = await addPayment(data);
			setResult(result);

			if (result.success) {
				// Handle success (show toast, reset form, etc.)
			}
		});
	};

	return (
		<form action={handleSubmit}>
			{/* Form fields */}
			<button disabled={isPending}>
				{isPending ? "Adding Payment..." : "Add Payment"}
			</button>
		</form>
	);
}
```
