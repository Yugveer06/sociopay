// Export all permission guard components and utilities
export {
  PermissionGuard,
  PageGuard,
  ElementGuard,
  OwnerGuard,
  RenterGuard,
  withPermissionGuard,
  type PermissionGuardProps,
  type PermissionGuardFallbacks,
} from './permission-guard'

// Export server-safe guards
export { ServerElementGuard } from './server-element-guard'

// Re-export permission utilities for convenience
export {
  usePermissions,
  usePermissionCheck,
  type UsePermissionsReturn,
  type PermissionCheck,
  type Resource,
  type Permission,
} from '@/hooks/use-permissions'
