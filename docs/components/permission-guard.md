# Permission Guard System

A comprehensive role-based access control (RBAC) system for SocioPay built on top of Better Auth's access control plugin.

## Overview

The permission guard system provides both client-side and server-side protection for your Next.js application, allowing you to control access to:

- **Full pages** - Protect entire routes and pages
- **Components** - Guard specific UI components and features
- **Elements** - Control visibility of buttons, links, and small UI elements
- **Server actions** - Protect API routes and server functions

## Quick Start

### 1. Basic Component Protection

```tsx
import { PermissionGuard } from '@/components/guards'

// Protect a component with specific permissions
<PermissionGuard permissions={{ payment: ['add'] }}>
  <AddPaymentButton />
</PermissionGuard>

// Role-based protection (faster, client-side)
<PermissionGuard requiredRole="admin" useRoleCheck>
  <AdminPanel />
</PermissionGuard>
```

### 2. Page-Level Protection

```tsx
import { PageGuard } from '@/components/guards'

export default function MembersPage() {
  return (
    <PageGuard permissions={{ members: ['list'] }} redirectOnUnauthorized>
      <div>Your page content...</div>
    </PageGuard>
  )
}
```

### 3. Element Protection

```tsx
import { ElementGuard } from '@/components/guards'

;<ElementGuard
  permissions={{ payment: ['delete'] }}
  fallback={<Button disabled>Delete (No Permission)</Button>}
>
  <Button variant="destructive">Delete Payment</Button>
</ElementGuard>
```

### 4. Server-Side Protection

```tsx
import { requirePermission, withPermission } from '@/lib/server-permissions'

// Protect server actions
export async function deletePayment(id: string) {
  await requirePermission({ payment: ['delete'] })
  // Your deletion logic here...
}

// Or use wrapper functions
const protectedAction = withPermission({ payment: ['add'] }, async data => {
  // Your action logic
})
```

## Components

### PermissionGuard

The main permission guard component with full customization options.

```tsx
<PermissionGuard
  permissions={{ payment: ['add'] }} // Single permission check
  anyPermissions={[
    // OR logic (any match)
    { payment: ['add'] },
    { expenses: ['add'] },
  ]}
  allPermissions={[
    // AND logic (all match)
    { payment: ['add'] },
    { expenses: ['add'] },
  ]}
  requiredRole="admin" // Simple role check
  useRoleCheck={true} // Client-side checking
  fullPage={false} // Page-level styling
  redirectOnUnauthorized={false} // Auto redirect
  unauthorizedRedirect="/dashboard" // Redirect destination
  showBackButton={true} // Show back button
  fallbacks={{
    // Custom fallback UIs
    unauthorized: <CustomUnauthorized />,
    loading: <CustomLoading />,
    unauthenticated: <CustomLogin />,
  }}
>
  <YourProtectedContent />
</PermissionGuard>
```

### PageGuard

Simplified page-level protection with automatic redirects.

```tsx
<PageGuard permissions={{ members: ['list'] }}>
  <MembersPage />
</PageGuard>
```

### ElementGuard

Minimal protection for UI elements.

```tsx
<ElementGuard
  permissions={{ payment: ['add'] }}
  fallback={<Button disabled>Add Payment (No Access)</Button>}
>
  <Button>Add Payment</Button>
</ElementGuard>
```

### withPermissionGuard (HOC)

Higher-order component for functional wrapping.

```tsx
const ProtectedComponent = withPermissionGuard(MyComponent, {
  requiredRole: 'admin',
  useRoleCheck: true,
})
```

## Hooks

### usePermissions

Main hook for permission management.

```tsx
const {
  hasPermission, // Async server-side check
  checkRolePermission, // Sync client-side check
  hasAnyPermission, // Check multiple (OR)
  hasAllPermissions, // Check multiple (AND)
  isAdmin, // Convenience boolean
  role, // Current user role
  loading, // Loading state
  session, // Current session
} = usePermissions()

// Usage examples
const canAdd = await hasPermission({ payment: ['add'] })
const adminCanDelete = checkRolePermission({ payment: ['delete'] }, 'admin')
```

### usePermissionCheck

Specialized hook for specific permission checking.

```tsx
const { hasAccess, roleHasAccess, checking } = usePermissionCheck({
  payment: ['add'],
})
```

## Server-Side Utilities

### Protection Functions

```tsx
import {
  requireAuth, // Require authentication
  requirePermission, // Require specific permissions
  requireAdmin, // Require admin role
  checkServerPermission, // Check permissions (non-throwing)
  getServerSession, // Get current session
} from '@/lib/server-permissions'

// Usage in server actions/API routes
export async function protectedAction() {
  await requireAuth() // Must be logged in
  await requirePermission({ payment: ['add'] }) // Must have permission
  await requireAdmin() // Must be admin

  const result = await checkServerPermission({
    // Non-throwing check
    payment: ['delete'],
  })
  if (!result.success) {
    return { error: result.error }
  }
}
```

### Wrapper Functions

```tsx
// Wrap functions with automatic protection
const authAction = withAuth(yourServerAction)
const permissionAction = withPermission({ payment: ['add'] }, yourServerAction)
const adminAction = withAdmin(yourServerAction)
```

## Permission System

### Available Resources

The system includes these predefined resources:

- **payment**: `add`, `list-own`, `list-all`, `delete`, `generate-receipt`, `export`
- **due**: `list-own`, `list-all`
- **expenses**: `add`, `list`, `export`
- **renterKyc**: `upload-own`, `upload-all`, `list-own`, `list-all`, `view-own`, `view-all`, `download-own`, `download-all`, `delete-own`, `delete-all`
- **members**: `list`, `edit`, `ban`, `unban`

### Roles

- **admin**: Full access to all resources and permissions
- **user**: Limited access, typically own data only

### Permission Checking Strategies

1. **Server-side (default)**: Makes API call to verify permissions
   - More secure and always up-to-date
   - Slightly slower due to network request

2. **Role-based (client-side)**: Uses role definitions for immediate checking
   - Faster, no network request
   - Good for UI responsiveness
   - Use `useRoleCheck={true}` or `checkRolePermission()`

## Best Practices

### 1. Use Appropriate Protection Level

```tsx
// Page-level: Full pages
<PageGuard permissions={{ members: ['list'] }}>
  <MembersPage />
</PageGuard>

// Component-level: Features/sections
<PermissionGuard permissions={{ payment: ['add'] }}>
  <AddPaymentForm />
</PermissionGuard>

// Element-level: Buttons/links
<ElementGuard permissions={{ payment: ['delete'] }}>
  <DeleteButton />
</ElementGuard>
```

### 2. Combine Client and Server Protection

```tsx
// Client-side for UX
;<ElementGuard permissions={{ payment: ['add'] }}>
  <Button onClick={handleAdd}>Add Payment</Button>
</ElementGuard>

// Server-side for security
export async function addPayment(data) {
  await requirePermission({ payment: ['add'] })
  // ... logic
}
```

### 3. Use Role Checks for Performance

```tsx
// For immediate UI feedback
<PermissionGuard requiredRole="admin" useRoleCheck>
  <AdminQuickActions />
</PermissionGuard>

// For security-critical operations, always use server-side
<PermissionGuard permissions={{ payment: ['delete'] }}>
  <DangerousOperations />
</PermissionGuard>
```

### 4. Provide Good Fallbacks

```tsx
<PermissionGuard
  permissions={{ members: ['edit'] }}
  fallbacks={{
    unauthorized: (
      <Card>
        <CardContent>
          <p>You don't have permission to edit members.</p>
          <Button onClick={() => contactAdmin()}>Request Access</Button>
        </CardContent>
      </Card>
    ),
  }}
>
  <EditMemberForm />
</PermissionGuard>
```

## Examples

See `/app/example/page.tsx` for comprehensive examples of all permission guard features and patterns.

## TypeScript Support

The system is fully typed with TypeScript:

```tsx
// Resource and permission types are automatically inferred
const permissions: PermissionCheck = {
  payment: ['add', 'delete'], // ✅ Valid permissions
  invalid: ['fake'], // ❌ TypeScript error
}

// Hook return types are fully typed
const { hasPermission }: UsePermissionsReturn = usePermissions()
```

## Error Handling

The system gracefully handles errors:

- Network failures default to "no access"
- Invalid permissions are logged and denied
- Fallback UIs are shown for error states
- Server-side protection throws descriptive errors

## Performance Considerations

- Use `useRoleCheck={true}` for immediate UI updates
- Server-side checks are cached per session
- Element guards are optimized for frequent re-renders
- Page guards implement efficient redirect logic

## Security Notes

⚠️ **Important**: This component provides UI-level protection only. Always implement server-side protection for API routes and server actions using the provided server utilities.

✅ **Best Practice**: Use both client-side guards (for UX) and server-side protection (for security).
