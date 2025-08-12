// Export the main PermissionGuard components and hooks
export {
  PermissionGuard,
  withPermissionGuard,
  usePermissions,
} from './PermissionGuard'

// Re-export types for convenience
export type { Role, Statement } from '@/lib/permissions'
