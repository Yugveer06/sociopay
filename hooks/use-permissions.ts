'use client'

import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { authClient } from '@/lib/auth-client'
import { statement, type Statement } from '@/lib/permissions'

// Type definitions for better TypeScript support
export type Resource = keyof Statement
export type Permission<T extends Resource> = Statement[T][number]
export type PermissionCheck = {
  [K in Resource]?: Permission<K>[]
}

// Cache for permission results to prevent repeated API calls
const permissionCache = new Map<
  string,
  { result: boolean; timestamp: number }
>()
const CACHE_DURATION = 30000 // 30 seconds cache

export interface UsePermissionsReturn {
  /** Check if the current user has a specific permission (server-side with cache) */
  hasPermission: (permission: PermissionCheck) => Promise<boolean>
  /** Check if the current user has specific permissions synchronously based on role */
  checkRolePermission: (permission: PermissionCheck, role: string) => boolean
  /** Smart permission check that uses client-side first, server-side as fallback */
  checkPermission: (
    permission: PermissionCheck,
    forceServerCheck?: boolean
  ) => Promise<boolean>
  /** Check if the current user has any of the provided permissions */
  hasAnyPermission: (
    permissions: PermissionCheck[],
    forceServerCheck?: boolean
  ) => Promise<boolean>
  /** Check if the current user has all of the provided permissions */
  hasAllPermissions: (
    permissions: PermissionCheck[],
    forceServerCheck?: boolean
  ) => Promise<boolean>
  /** Check if user has admin role */
  isAdmin: boolean
  /** Current user role */
  role: string | null
  /** Whether permission check is currently loading */
  loading: boolean
  /** Current user session */
  session: any
}

/**
 * Custom hook for managing permissions in the SocioPay application
 * Integrates with Better Auth's access control system
 *
 * @example
 * ```tsx
 * const { hasPermission, isAdmin, checkRolePermission } = usePermissions()
 *
 * // Check server-side permission
 * const canAddPayment = await hasPermission({ payment: ['add'] })
 *
 * // Check role permission (client-side, synchronous)
 * const adminCanDelete = checkRolePermission({ payment: ['delete'] }, 'admin')
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  const role = session?.user?.role || null
  const isAdmin = role === 'admin'

  // Helper function to create cache key
  const createCacheKey = useCallback(
    (permission: PermissionCheck, userId?: string) => {
      return `${userId || 'no-user'}-${JSON.stringify(permission)}`
    },
    []
  )

  // Helper function to check cache
  const getCachedResult = useCallback((cacheKey: string) => {
    const cached = permissionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result
    }
    return null
  }, [])

  // Helper function to set cache
  const setCachedResult = useCallback((cacheKey: string, result: boolean) => {
    permissionCache.set(cacheKey, { result, timestamp: Date.now() })
  }, [])

  /**
   * Check if the current user has a specific permission (server-side check)
   * This makes an API call to verify permissions with caching
   */
  const hasPermission = useCallback(
    async (permission: PermissionCheck): Promise<boolean> => {
      if (!session?.user?.id) {
        return false
      }

      // Prevent concurrent requests
      if (loadingRef.current) {
        return false
      }

      const cacheKey = createCacheKey(permission, session.user.id)

      // Check cache first
      const cachedResult = getCachedResult(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      try {
        loadingRef.current = true
        setLoading(true)

        const { data, error } = await authClient.admin.hasPermission({
          userId: session.user.id,
          permissions: permission,
        })

        if (error) {
          console.error('Permission check failed:', error)
          setCachedResult(cacheKey, false)
          return false
        }

        const result = data?.success === true
        setCachedResult(cacheKey, result)
        return result
      } catch (error) {
        console.error('Permission check error:', error)
        setCachedResult(cacheKey, false)
        return false
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    },
    [session?.user?.id, createCacheKey, getCachedResult, setCachedResult]
  )

  /**
   * Check if a role has specific permissions (client-side, synchronous)
   * This doesn't require an API call
   */
  const checkRolePermission = useCallback(
    (permission: PermissionCheck, roleToCheck: string): boolean => {
      try {
        return authClient.admin.checkRolePermission({
          permissions: permission,
          role: roleToCheck as 'user' | 'admin',
        })
      } catch (error) {
        console.error('Role permission check error:', error)
        return false
      }
    },
    []
  )

  /**
   * Smart permission check that uses client-side by default and falls back to server
   * Use this for most UI permission checks to avoid unnecessary API calls
   */
  const checkPermission = useCallback(
    async (
      permission: PermissionCheck,
      forceServerCheck = false
    ): Promise<boolean> => {
      if (!session?.user) {
        return false
      }

      // If we have a role and it's not a forced server check, use client-side checking
      if (role && !forceServerCheck) {
        return checkRolePermission(permission, role)
      }

      // Fall back to server-side check
      return hasPermission(permission)
    },
    [session?.user, role, checkRolePermission, hasPermission]
  )

  /**
   * Check if user has any of the provided permissions
   * Uses smart checking (client-side first)
   */
  const hasAnyPermission = useCallback(
    async (
      permissions: PermissionCheck[],
      forceServerCheck = false
    ): Promise<boolean> => {
      for (const permission of permissions) {
        if (await checkPermission(permission, forceServerCheck)) {
          return true
        }
      }
      return false
    },
    [checkPermission]
  )

  /**
   * Check if user has all of the provided permissions
   * Uses smart checking (client-side first)
   */
  const hasAllPermissions = useCallback(
    async (
      permissions: PermissionCheck[],
      forceServerCheck = false
    ): Promise<boolean> => {
      for (const permission of permissions) {
        if (!(await checkPermission(permission, forceServerCheck))) {
          return false
        }
      }
      return true
    },
    [checkPermission]
  )

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      hasPermission,
      checkRolePermission,
      checkPermission, // New smart permission check
      hasAnyPermission,
      hasAllPermissions,
      isAdmin,
      role,
      loading: sessionLoading || loading,
      session,
    }),
    [
      hasPermission,
      checkRolePermission,
      checkPermission,
      hasAnyPermission,
      hasAllPermissions,
      isAdmin,
      role,
      sessionLoading,
      loading,
      session,
    ]
  )
}

/**
 * Hook for checking specific permissions with better TypeScript support
 *
 * @example
 * ```tsx
 * const canAddPayment = usePermissionCheck({ payment: ['add'] })
 * const canViewAllDues = usePermissionCheck({ due: ['list-all'] })
 * ```
 */
export function usePermissionCheck(permission: PermissionCheck) {
  const {
    checkRolePermission,
    role,
    loading: sessionLoading,
  } = usePermissions()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  // Client-side role check (immediate)
  const roleHasAccess = useMemo(() => {
    return role ? checkRolePermission(permission, role) : false
  }, [role, checkRolePermission, permission])

  // Server-side permission check (async) - memoized to prevent re-creation
  const checkServerPermission = useCallback(async () => {
    if (!role || sessionLoading) return

    setChecking(true)
    try {
      const { data, error } = await authClient.admin.hasPermission({
        permissions: permission,
      })

      if (error) {
        console.error('Permission check failed:', error)
        setHasAccess(false)
        return
      }

      setHasAccess(data?.success === true)
    } catch (error) {
      console.error('Permission check failed:', error)
      setHasAccess(false)
    } finally {
      setChecking(false)
    }
  }, [role, sessionLoading, permission])

  // Only run the effect when essential dependencies change
  useEffect(() => {
    // Reset state when permission changes
    setHasAccess(null)

    if (role && !sessionLoading) {
      checkServerPermission()
    }
  }, [role, sessionLoading, checkServerPermission])

  return useMemo(
    () => ({
      /** Whether the user has access (null while loading) */
      hasAccess,
      /** Whether the user's role theoretically has access (client-side check) */
      roleHasAccess,
      /** Whether the permission check is currently in progress */
      checking: sessionLoading || checking,
    }),
    [hasAccess, roleHasAccess, sessionLoading, checking]
  )
}
