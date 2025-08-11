# Permission Guard Usage Examples

The `PermissionGuard` component provides a flexible way to protect pages and components based on user roles and specific permissions defined in your `permissions.ts` file.

## Basic Usage

### 1. Component-level Protection

```tsx
import { PermissionGuard } from "@/components/guards/PermissionGuard";

export default function SomeProtectedPage() {
	return (
		<PermissionGuard requiredRole='admin'>
			<div>
				<h1>Admin Only Content</h1>
				<p>This content is only visible to admin users.</p>
			</div>
		</PermissionGuard>
	);
}
```

### 2. Permission-based Protection

```tsx
import { PermissionGuard } from "@/components/guards/PermissionGuard";

export default function PaymentPage() {
	return (
		<PermissionGuard
			requiredPermission={{
				resource: "payment",
				action: "create",
			}}
		>
			<div>
				<h1>Create Payment</h1>
				<p>
					This content is only visible to users who can create
					payments.
				</p>
			</div>
		</PermissionGuard>
	);
}
```

### 3. Higher-Order Component (HOC) Usage

```tsx
import { withPermissionGuard } from "@/components/guards/PermissionGuard";

function AdminDashboard() {
	return (
		<div>
			<h1>Admin Dashboard</h1>
			<p>Admin-only content here</p>
		</div>
	);
}

// Wrap the component with permission guard
export default withPermissionGuard(AdminDashboard, {
	requiredRole: "admin",
	redirectTo: "/unauthorized",
});
```

### 4. Custom Fallback Component

```tsx
import { PermissionGuard } from "@/components/guards/PermissionGuard";

const CustomAccessDenied = () => (
	<div className='text-center py-8'>
		<h2>Oops! You need special permissions</h2>
		<p>Contact your administrator for access.</p>
	</div>
);

export default function WalletPage() {
	return (
		<PermissionGuard
			requiredPermission={{
				resource: "wallet",
				action: "update",
			}}
			fallback={<CustomAccessDenied />}
		>
			<div>
				<h1>Update Wallet</h1>
				{/* Wallet update content */}
			</div>
		</PermissionGuard>
	);
}
```

## Using the usePermissions Hook

The `usePermissions` hook allows you to check permissions within your components:

```tsx
import { usePermissions } from "@/components/guards/PermissionGuard";

export default function DynamicContent() {
	const { isAuthenticated, userRole, hasRole, hasPermission, canAccess } =
		usePermissions();

	if (!isAuthenticated) {
		return <div>Please log in</div>;
	}

	return (
		<div>
			<h1>Welcome, {userRole}!</h1>

			{hasRole("admin") && <button>Admin Action</button>}

			{hasPermission("payment", "create") && (
				<button>Create Payment</button>
			)}

			{canAccess({
				permission: { resource: "wallet", action: "transfer" },
			}) && <button>Transfer Money</button>}
		</div>
	);
}
```

## Available Permissions

Based on your `permissions.ts` file, here are the available resources and actions:

### Resources:

-   `payment`: create, view, cancel, refund
-   `transaction`: create, view, list, export
-   `wallet`: create, view, update, transfer
-   `profile`: view, update, delete
-   `user`: create, list, update, delete, set-role, ban, impersonate, set-password
-   `session`: list, delete, revoke

### Roles:

-   `admin`: Full access to all resources
-   `user`: Limited access (view-only for most resources)

## Advanced Examples

### Page-level Protection

```tsx
// pages/admin/users.tsx
import { PermissionGuard } from "@/components/guards/PermissionGuard";

export default function UsersManagement() {
	return (
		<PermissionGuard requiredRole='admin' redirectTo='/dashboard'>
			<div>
				<h1>User Management</h1>
				{/* Admin user management interface */}
			</div>
		</PermissionGuard>
	);
}
```

### Conditional Rendering

```tsx
import { usePermissions } from "@/components/guards/PermissionGuard";

export default function TransactionPage() {
	const { hasPermission } = usePermissions();

	return (
		<div>
			<h1>Transactions</h1>

			{hasPermission("transaction", "view") && (
				<div>{/* Transaction list */}</div>
			)}

			{hasPermission("transaction", "export") && (
				<button>Export Transactions</button>
			)}

			{hasPermission("transaction", "create") && (
				<button>Create New Transaction</button>
			)}
		</div>
	);
}
```

## Notes

1. **Role Hierarchy**: Admin users automatically have access to all content, regardless of specific permission requirements.

2. **Session Management**: The component automatically handles redirects to login page when users are not authenticated.

3. **Loading States**: The component includes built-in loading states that can be customized or disabled.

4. **Error Handling**: Permission checks include error handling to gracefully degrade when permission evaluation fails.

5. **TypeScript Support**: Full TypeScript support with proper typing for resources, actions, and roles.
