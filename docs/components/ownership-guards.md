# House Ownership Guards

The SocioPay permission system now includes house ownership-based guards that protect content based on whether a user is an owner or renter of their property.

## Available House Ownership Types

- `owner` - Property owners (default value)
- `renter` - Property renters/tenants

## Usage Examples

### Basic Ownership Protection

```tsx
import { OwnerGuard, RenterGuard, PermissionGuard } from '@/components/guards'

// Only show to owners (convenient helper)
<OwnerGuard>
  <PropertyManagementPanel />
</OwnerGuard>

// Only show to renters (convenient helper)
<RenterGuard>
  <RentPaymentSection />
</RenterGuard>

// Using the main guard with specific ownership
<PermissionGuard requiredOwnership="owner">
  <DuesCollectionFeature />
</PermissionGuard>
```

### Multiple Ownership Types

```tsx
// Show to both owners and renters
<PermissionGuard anyOwnership={['owner', 'renter']}>
  <CommunityNotices />
</PermissionGuard>

// This is equivalent to not specifying ownership at all
<PermissionGuard>
  <GeneralCommunityFeature />
</PermissionGuard>
```

### Combining with Permissions and Roles

```tsx
// Admin owners only - combining role and ownership
<PermissionGuard requiredRole="admin" requiredOwnership="owner">
  <AdminOwnerPanel />
</PermissionGuard>

// Owners with payment permissions
<PermissionGuard
  requiredOwnership="owner"
  permissions={{ payment: ['collect'] }}
>
  <CollectDuesButton />
</PermissionGuard>

// Either admin role OR owner ownership
<PermissionGuard
  anyPermissions={[
    { admin: ['access'] }
  ]}
  anyOwnership={['owner']}
>
  <SensitiveFeature />
</PermissionGuard>
```

### Full Page Protection

```tsx
// Protect entire pages based on ownership
<PageGuard requiredOwnership="owner">
  <PropertyManagementPage />
</PageGuard>

// Or use the convenience components
<OwnerGuard fullPage redirectOnUnauthorized>
  <OwnerDashboard />
</OwnerGuard>
```

### Element Protection with Fallbacks

```tsx
// Custom fallback for unauthorized ownership
<RenterGuard
  fallbacks={{
    unauthorized: (
      <div className="p-4 text-muted-foreground">
        This feature is only available to property renters.
      </div>
    )
  }}
>
  <RentPaymentForm />
</RenterGuard>

// Minimal element protection
<ElementGuard
  requiredOwnership="owner"
  unauthorizedFallback={null} // Hide completely if not owner
>
  <CollectRentButton />
</ElementGuard>
```

## How It Works

1. **Client-side Check**: The guard first checks the user's `houseOwnership` field from the session
2. **Fast Validation**: Ownership checks are performed immediately without server calls
3. **Combined Logic**: Ownership checks are combined with permission and role checks using AND logic
4. **Fallback Handling**: If ownership check fails, appropriate fallback UI is shown

## Database Schema

The ownership type is stored in the `user` table:

```sql
houseOwnership text('house_ownership').default('owner').notNull()
```

## Performance Notes

- Ownership checks are **client-side only** and very fast
- No additional API calls are made for ownership validation
- Combines seamlessly with existing permission checks
- Smart caching is still applied to permission-based checks

## Best Practices

1. **Use Helper Components**: Prefer `OwnerGuard` and `RenterGuard` for simple cases
2. **Combine Smartly**: When combining with permissions, put ownership checks first for better performance
3. **Progressive Enhancement**: Consider using ownership as a first filter, then permissions for fine-grained control
4. **Meaningful Fallbacks**: Provide clear messages about why content is restricted

## Common Patterns

```tsx
// Dues collection - owners only with payment permissions
;<OwnerGuard permissions={{ payment: ['collect'] }}>
  <DuesCollectionInterface />
</OwnerGuard>

// Maintenance requests - different interfaces for owners vs renters
{
  session?.user?.houseOwnership === 'owner' ? (
    <OwnerMaintenanceRequests />
  ) : (
    <RenterMaintenanceRequests />
  )
}

// Admin override - admins can see everything regardless of ownership
;<PermissionGuard
  anyPermissions={[{ admin: ['access'] }]}
  anyOwnership={['owner']}
>
  <SensitiveOwnerData />
</PermissionGuard>
```
