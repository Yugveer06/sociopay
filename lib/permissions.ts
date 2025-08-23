import { createAccessControl } from 'better-auth/plugins/access'

/**
 * Define custom permissions for the application
 * Make sure to use `as const` so TypeScript can infer the type correctly
 */
export const statement = {
  // Custom resources and their permissions
  dashboard: ['view'],
  payment: [
    'add',
    'list-own',
    'list-all',
    'delete',
    'generate-receipt',
    'export',
  ],
  due: ['list-own', 'list-all'],
  expenses: ['add', 'list', 'export', 'delete'],
  renterKyc: [
    'upload-own',
    'upload-all',
    'list-own',
    'list-all',
    'view-own',
    'view-all',
    'download-own',
    'download-all',
    'delete-own',
    'delete-all',
  ],
  members: ['list', 'edit', 'ban', 'unban'],
} as const

// Create the access controller
const ac = createAccessControl(statement)

/**
 * Admin role with full permissions
 * Inherits all default admin permissions and adds custom permissions
 */
export const admin = ac.newRole({
  // Custom permissions for admin
  dashboard: ['view'],
  payment: [
    'add',
    'list-all',
    'list-own',
    'delete',
    'generate-receipt',
    'export',
  ],
  due: ['list-all'],
  expenses: ['add', 'list', 'export', 'delete'],
  renterKyc: [
    'upload-all',
    'list-all',
    'list-own',
    'view-all',
    'download-all',
    'delete-all',
  ],
  members: ['list', 'edit', 'ban', 'unban'],
})

/**
 * User role with limited permissions
 * Regular users can only manage their own data
 */
export const user = ac.newRole({
  // Custom permissions for regular users
  dashboard: ['view'],
  payment: ['list-own', 'generate-receipt'],
  due: ['list-own'],
  expenses: ['list'],
  renterKyc: [
    'upload-own',
    'list-own',
    'view-own',
    'download-own',
    'delete-own',
  ],
})

// Export the access controller for use in auth configuration
export { ac }

/**
 * Role definitions for easy reference
 */
export const roles = {
  admin,
  user,
} as const

/**
 * Type definitions for better TypeScript support
 */
export type Role = keyof typeof roles
export type Statement = typeof statement
export type Permissions = {
  [K in keyof Statement]: Statement[K][number][]
}
