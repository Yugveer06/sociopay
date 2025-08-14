# Society Members API Documentation

## Overview

The Society Members API provides comprehensive user management functionality for community administrators, including member listing, ban/unban operations, and user administration.

## Server Actions

### Location: `app/(sidebar)/society-members/actions.ts`

All society member management actions are located in the society members server actions file and require admin authentication.

## Actions

### `banUser(data: BanUserData)`

Bans a society member with optional reason and expiration date.

**Parameters:**

```typescript
type BanUserData = {
  userId: string // ID of user to ban
  reason?: string // Reason for ban (optional)
  banExpires?: string // Ban expiration date as ISO string (optional)
}
```

**Validation Schema:**

```typescript
const banUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  reason: z.string().optional(),
  banExpires: z.string().optional(),
})
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
import { banUser } from '@/app/(sidebar)/society-members/actions'

const result = await banUser({
  userId: 'user-id-123',
  reason: 'Violation of community guidelines',
  banExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
})

if (result.success) {
  console.log('User banned successfully')
  // Show success toast
  toast.success(result.message)
} else {
  console.error(result.message)
  // Show error toast
  toast.error(result.message)

  // Handle validation errors
  if (result.errors) {
    Object.entries(result.errors).forEach(([field, messages]) => {
      console.error(`${field}: ${messages.join(', ')}`)
    })
  }
}
```

**Behavior:**

- Validates input using `banUserSchema` with Zod
- Requires admin authentication via session
- Updates user record with ban status, reason, and expiration
- Handles database constraint violations gracefully
- Returns user-friendly error messages
- Revalidates society members data after successful ban
- Logs admin action for audit trail

**Database Updates:**

```sql
UPDATE "user" SET
  banned = true,
  ban_reason = $reason,
  ban_expires = $banExpires
WHERE id = $userId;
```

### `unbanUser(data: UnbanUserData)`

Removes ban from a society member, restoring their access.

**Parameters:**

```typescript
type UnbanUserData = {
  userId: string // ID of user to unban
}
```

**Validation Schema:**

```typescript
const unbanUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
})
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
import { unbanUser } from '@/app/(sidebar)/society-members/actions'

const result = await unbanUser({
  userId: 'user-id-123',
})

if (result.success) {
  console.log('User unbanned successfully')
  // Show success toast
  toast.success(result.message)
} else {
  console.error(result.message)
  // Show error toast
  toast.error(result.message)
}
```

**Behavior:**

- Validates input using `unbanUserSchema`
- Requires admin authentication via session
- Clears ban status, reason, and expiration from user record
- Handles database errors gracefully
- Returns user-friendly error messages
- Revalidates society members data after successful unban
- Logs admin action for audit trail

**Database Updates:**

```sql
UPDATE "user" SET
  banned = false,
  ban_reason = NULL,
  ban_expires = NULL
WHERE id = $userId;
```

## Authentication Requirements

### Admin Role Verification

Both ban and unban actions require:

```typescript
// Check if user has admin role
if (session.user.role !== 'admin') {
  return {
    success: false,
    message: 'Unauthorized: Admin access required',
  }
}
```

### Session Validation

```typescript
// Validate user session
const session = await auth.api.getSession({
  headers: await headers(),
})

if (!session) {
  return {
    success: false,
    message: 'Authentication required',
  }
}
```

## Error Handling

### Validation Errors

```typescript
// Example validation error response
{
  success: false,
  message: "Validation failed",
  errors: {
    userId: ["User ID is required."],
    reason: ["Reason must be a string."]
  }
}
```

### Authentication Errors

```typescript
// Example authentication error
{
  success: false,
  message: "Unauthorized: Admin access required"
}
```

### Database Errors

```typescript
// Example database error
{
  success: false,
  message: "Failed to update user status. Please try again."
}
```

## Security Considerations

### Access Control

- **Admin Only**: Only users with `role: 'admin'` can perform ban/unban operations
- **Session Validation**: All actions require valid user session
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM

### Audit Trail

- **Ban Reasons**: All ban reasons are stored for accountability
- **Timestamps**: Ban and unban actions include timestamps
- **Admin Tracking**: Admin user ID is tracked for all actions
- **Data Revalidation**: UI data is revalidated after each action

### Rate Limiting

Consider implementing rate limiting for admin actions:

```typescript
// Example rate limiting (not implemented)
const rateLimiter = new Map()

function checkRateLimit(adminId: string) {
  const now = Date.now()
  const userActions = rateLimiter.get(adminId) || []

  // Remove actions older than 1 minute
  const recentActions = userActions.filter(time => now - time < 60000)

  if (recentActions.length >= 10) {
    throw new Error('Rate limit exceeded')
  }

  recentActions.push(now)
  rateLimiter.set(adminId, recentActions)
}
```

## Data Types

### User Type with Ban Fields

```typescript
type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  houseNumber: string
  phone: string
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### Ban Status Enum

```typescript
type BanStatus = 'active' | 'expired' | 'none'

function getBanStatus(user: User): BanStatus {
  if (!user.banned) return 'none'
  if (user.banExpires && new Date(user.banExpires) < new Date()) {
    return 'expired'
  }
  return 'active'
}
```

## Usage Examples

### Complete Ban Flow

```typescript
'use client'

import { useState, useTransition } from 'react'
import { banUser } from '@/app/(sidebar)/society-members/actions'
import { toast } from 'sonner'

export function BanUserDialog({ user, onClose }) {
  const [isPending, startTransition] = useTransition()
  const [reason, setReason] = useState('')
  const [banExpires, setBanExpires] = useState('')

  const handleBan = () => {
    startTransition(async () => {
      const result = await banUser({
        userId: user.id,
        reason: reason || undefined,
        banExpires: banExpires || undefined,
      })

      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ban User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to ban {user.name}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter ban reason"
            />
          </div>

          <div>
            <Label htmlFor="banExpires">Expires (optional)</Label>
            <Input
              id="banExpires"
              type="date"
              value={banExpires}
              onChange={(e) => setBanExpires(e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBan}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Banning...' : 'Ban User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Complete Unban Flow

```typescript
'use client'

import { useTransition } from 'react'
import { unbanUser } from '@/app/(sidebar)/society-members/actions'
import { toast } from 'sonner'

export function UnbanUserButton({ user }) {
  const [isPending, startTransition] = useTransition()

  const handleUnban = () => {
    startTransition(async () => {
      const result = await unbanUser({
        userId: user.id,
      })

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Button
      onClick={handleUnban}
      disabled={isPending}
      variant="outline"
      size="sm"
    >
      {isPending ? 'Unbanning...' : 'Unban'}
    </Button>
  )
}
```

## Best Practices

### Form Validation

1. **Client-Side Validation**: Use Zod schemas on both client and server
2. **User Feedback**: Provide immediate feedback for validation errors
3. **Loading States**: Show loading indicators during async operations
4. **Error Handling**: Handle both validation and server errors gracefully

### Security

1. **Admin Verification**: Always verify admin role before sensitive operations
2. **Input Sanitization**: Validate and sanitize all user inputs
3. **Audit Logging**: Log all admin actions for security auditing
4. **Rate Limiting**: Consider implementing rate limiting for admin actions

### User Experience

1. **Confirmation Dialogs**: Use confirmation dialogs for destructive actions
2. **Clear Messaging**: Provide clear success and error messages
3. **Immediate Updates**: Update UI immediately after successful actions
4. **Accessibility**: Ensure all components are accessible

### Error Recovery

1. **Retry Logic**: Implement retry logic for transient failures
2. **Fallback UI**: Provide fallback UI for error states
3. **Error Boundaries**: Use React error boundaries to catch errors
4. **Logging**: Log errors for debugging and monitoring

## Related Documentation

- [Authentication System](../authentication/README.md) - User authentication and session management
- [Database Schema](../database/README.md) - Database structure and relationships
- [API Overview](./README.md) - Complete API documentation
- [Components](../components/README.md) - UI component documentation
