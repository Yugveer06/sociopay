// Export all permission guard components and utilities
export {
  PermissionGuard,
  PageGuard,
  ElementGuard,
  withPermissionGuard,
  type PermissionGuardProps,
  type PermissionGuardFallbacks,
} from './permission-guard'

// Re-export permission utilities for convenience
export {
  usePermissions,
  usePermissionCheck,
  type UsePermissionsReturn,
  type PermissionCheck,
  type Resource,
  type Permission,
} from '@/hooks/use-permissions'
