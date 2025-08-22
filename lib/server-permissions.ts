import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { type Statement } from '@/lib/permissions'

// Type definitions for server-side permission checking
export type Resource = keyof Statement
export type Permission<T extends Resource> = Statement[T][number]
export type PermissionCheck = {
  [K in Resource]?: Permission<K>[]
}

export interface ServerPermissionResult {
  success: boolean
  user?: Record<string, unknown>
  error?: string
}

/**
 * Server-side permission utilities for protecting API routes and server actions
 * These utilities handle authentication and authorization on the server side
 */

/**
 * Get the current session from the server
 * Use this in server components and API routes
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch (error) {
    console.error('Failed to get server session:', error)
    return null
  }
}

/**
 * Check if a user has specific permissions on the server
 * @param permissions - The permissions to check
 * @param userId - Optional user ID (defaults to current session user)
 * @returns Promise<ServerPermissionResult>
 */
export async function checkServerPermission(
  permissions: PermissionCheck,
  userId?: string
): Promise<ServerPermissionResult> {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const targetUserId = userId || session.user.id

    // Use Better Auth's server-side permission checking
    const result = await auth.api.userHasPermission({
      body: {
        userId: targetUserId,
        permissions,
      },
    })

    return {
      success: result.success || false,
      user: session.user,
      error: result.success ? undefined : 'Permission denied',
    }
  } catch (error) {
    console.error('Server permission check failed:', error)
    return {
      success: false,
      error: 'Permission check failed',
    }
  }
}

/**
 * Check if a role has specific permissions (server-side)
 * @param permissions - The permissions to check
 * @param role - The role to check
 * @returns Promise<ServerPermissionResult>
 */
export async function checkServerRolePermission(
  permissions: PermissionCheck,
  role: string
): Promise<ServerPermissionResult> {
  try {
    const result = await auth.api.userHasPermission({
      body: {
        role: role as 'user' | 'admin',
        permissions,
      },
    })

    return {
      success: result.success || false,
      error: result.success ? undefined : 'Permission denied',
    }
  } catch (error) {
    console.error('Server role permission check failed:', error)
    return {
      success: false,
      error: 'Permission check failed',
    }
  }
}

/**
 * Require authentication for server actions and API routes
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession()

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  return session
}

/**
 * Require specific permissions for server actions and API routes
 * Throws an error if not authorized
 */
export async function requirePermission(permissions: PermissionCheck) {
  const result = await checkServerPermission(permissions)

  if (!result.success) {
    throw new Error(result.error || 'Permission denied')
  }

  return result
}

/**
 * Require admin role for server actions and API routes
 * Throws an error if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return session
}

/**
 * Wrapper function for server actions that require authentication
 * @param action - The server action to wrap
 * @returns Wrapped server action that checks authentication
 */
export function withAuth<T extends unknown[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    await requireAuth()
    return action(...args)
  }
}

/**
 * Wrapper function for server actions that require specific permissions
 * @param permissions - Required permissions
 * @param action - The server action to wrap
 * @returns Wrapped server action that checks permissions
 */
export function withPermission<T extends unknown[], R>(
  permissions: PermissionCheck,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    await requirePermission(permissions)
    return action(...args)
  }
}

/**
 * Wrapper function for server actions that require admin access
 * @param action - The server action to wrap
 * @returns Wrapped server action that checks admin access
 */
export function withAdmin<T extends unknown[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    await requireAdmin()
    return action(...args)
  }
}

/**
 * Check if current user is admin (convenience function)
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession()
    return session?.user?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Get current user role (convenience function)
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const session = await getServerSession()
    return session?.user?.role || null
  } catch {
    return null
  }
}

/**
 * Utility to check multiple permission sets (any match)
 */
export async function checkAnyPermission(
  permissionSets: PermissionCheck[]
): Promise<ServerPermissionResult> {
  for (const permissions of permissionSets) {
    const result = await checkServerPermission(permissions)
    if (result.success) {
      return result
    }
  }

  return {
    success: false,
    error: 'None of the required permissions found',
  }
}

/**
 * Utility to check multiple permission sets (all must match)
 */
export async function checkAllPermissions(
  permissionSets: PermissionCheck[]
): Promise<ServerPermissionResult> {
  for (const permissions of permissionSets) {
    const result = await checkServerPermission(permissions)
    if (!result.success) {
      return result
    }
  }

  return {
    success: true,
  }
}
