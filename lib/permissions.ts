import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

/**
 * Define custom permissions for the application
 * Make sure to use `as const` so TypeScript can infer the type correctly
 */
export const statement = {
  ...defaultStatements, // Include default user and session permissions
  // Custom resources and their permissions
  payment: ['create', 'view', 'cancel', 'refund'],
  transaction: ['create', 'view', 'list', 'export'],
  wallet: ['create', 'view', 'update', 'transfer'],
  profile: ['view', 'update', 'delete'],
} as const

// Create the access controller
const ac = createAccessControl(statement)

/**
 * Admin role with full permissions
 * Inherits all default admin permissions and adds custom permissions
 */
export const admin = ac.newRole({
  // Default admin permissions (user management, session management)
  ...adminAc.statements,
  // Custom permissions for admin
  payment: ['create', 'view', 'cancel', 'refund'],
  transaction: ['create', 'view', 'list', 'export'],
  wallet: ['create', 'view', 'update', 'transfer'],
  profile: ['view', 'update', 'delete'],
})

/**
 * User role with limited permissions
 * Regular users can only manage their own data
 */
export const user = ac.newRole({
  // Custom permissions for regular users
  payment: ['view'],
  transaction: ['view', 'list'],
  wallet: ['view'],
  profile: ['view', 'update'],
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
