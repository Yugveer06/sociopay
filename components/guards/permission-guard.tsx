'use client'

import { usePermissions, type PermissionCheck } from '@/hooks/use-permissions'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'

// Component-level fallback UIs
export interface PermissionGuardFallbacks {
  /** Content to show when user is not authenticated */
  unauthenticated?: ReactNode
  /** Content to show when user lacks required permissions */
  unauthorized?: ReactNode
  /** Content to show while permission check is loading */
  loading?: ReactNode
  /** Content to show when an error occurs during permission check */
  error?: ReactNode
}

export interface PermissionGuardProps {
  /** Required permissions - user must have these permissions to see the content */
  permissions?: PermissionCheck
  /** Alternative permissions - user needs ANY of these permissions (used with OR logic) */
  anyPermissions?: PermissionCheck[]
  /** All permissions - user needs ALL of these permissions (used with AND logic) */
  allPermissions?: PermissionCheck[]
  /** Whether to use role-based checking (client-side, faster) instead of server-side */
  useRoleCheck?: boolean
  /** Specific role required (shorthand for role-based checking) */
  requiredRole?: 'admin' | 'user'
  /** Required house ownership type - user must have this ownership type to see the content */
  requiredOwnership?: 'owner' | 'renter'
  /** Alternative ownership types - user needs ANY of these ownership types (used with OR logic) */
  anyOwnership?: ('owner' | 'renter')[]
  /** Children to render when user has permission */
  children: ReactNode
  /** Custom fallback components */
  fallbacks?: PermissionGuardFallbacks
  /** Whether to redirect on unauthorized access */
  redirectOnUnauthorized?: boolean
  /** Where to redirect if unauthorized (defaults to /dashboard) */
  unauthorizedRedirect?: string
  /** Whether to redirect on unauthenticated access */
  redirectOnUnauthenticated?: boolean
  /** Where to redirect if unauthenticated (defaults to /login) */
  unauthenticatedRedirect?: string
  /** Whether this is protecting a full page (affects styling of fallbacks) */
  fullPage?: boolean
  /** Custom className for the container */
  className?: string
  /** Whether to show the back button on unauthorized access */
  showBackButton?: boolean
}

/**
 * Comprehensive permission guard component for protecting content based on user permissions
 * Supports multiple permission checking strategies and customizable fallbacks
 *
 * @example
 * ```tsx
 * // Basic usage - protect a component
 * <PermissionGuard permissions={{ payment: ['add'] }}>
 *   <AddPaymentButton />
 * </PermissionGuard>
 *
 * // Full page protection with redirect
 * <PermissionGuard
 *   permissions={{ members: ['list'] }}
 *   fullPage
 *   redirectOnUnauthorized
 * >
 *   <MembersPage />
 * </PermissionGuard>
 *
 * // Role-based protection (faster, client-side)
 * <PermissionGuard requiredRole="admin" useRoleCheck>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * // House ownership protection - only owners can see this
 * <PermissionGuard requiredOwnership="owner">
 *   <OwnerOnlyFeature />
 * </PermissionGuard>
 *
 * // Multiple ownership types - owners OR renters can see this
 * <PermissionGuard anyOwnership={['owner', 'renter']}>
 *   <GeneralFeature />
 * </PermissionGuard>
 *
 * // Multiple permission strategies
 * <PermissionGuard
 *   anyPermissions={[
 *     { payment: ['add'] },
 *     { expenses: ['add'] }
 *   ]}
 * >
 *   <AddTransactionButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permissions,
  anyPermissions,
  allPermissions,
  useRoleCheck = true, // Default to true to avoid unnecessary server calls
  requiredRole,
  requiredOwnership,
  anyOwnership,
  children,
  fallbacks = {},
  redirectOnUnauthorized = false,
  unauthorizedRedirect = '/dashboard',
  redirectOnUnauthenticated = false,
  unauthenticatedRedirect = '/login',
  // fullPage and showBackButton were unused in this implementation; keep props via rest if needed
  className,
}: PermissionGuardProps) {
  const router = useRouter()
  const {
    checkPermission, // Use smart permission check instead of hasPermission
    hasAnyPermission,
    hasAllPermissions,
    checkRolePermission,
    role,
    session,
    loading: sessionLoading,
  } = usePermissions()

  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Note: no local back handling is required here; navigation is handled via `router` in callers

  // Check permissions - wrapped in useCallback to prevent re-renders
  const checkPermissions = useCallback(async () => {
    if (!session?.user) {
      setHasAccess(false)
      return
    }

    // Reset states
    setError(null)

    // Get user's house ownership from session
    const userOwnership = session.user.houseOwnership

    // Check house ownership requirements first (client-side, immediate)
    if (requiredOwnership || anyOwnership) {
      let ownershipPassed = false

      if (requiredOwnership) {
        ownershipPassed = userOwnership === requiredOwnership
      } else if (anyOwnership?.length) {
        ownershipPassed = anyOwnership.includes(userOwnership)
      }

      if (!ownershipPassed) {
        setHasAccess(false)
        return
      }
    }

    // Role-based checking (client-side, immediate)
    if (useRoleCheck || requiredRole) {
      const roleToCheck = requiredRole || role
      if (!roleToCheck) {
        setHasAccess(false)
        return
      }

      if (requiredRole && role !== requiredRole) {
        setHasAccess(false)
        return
      }

      // Use role-based permission checking
      if (permissions && Object.keys(permissions).length > 0) {
        setHasAccess(checkRolePermission(permissions, roleToCheck))
        return
      }

      // If just checking role without specific permissions
      if (requiredRole) {
        setHasAccess(true)
        return
      }

      // If only checking ownership without other requirements
      if (
        (requiredOwnership || anyOwnership) &&
        !permissions &&
        !allPermissions &&
        !anyPermissions
      ) {
        setHasAccess(true)
        return
      }
    }

    // Smart permission checking (client-side first, server-side if needed)
    setPermissionLoading(true)

    try {
      let result = false

      if (allPermissions?.length) {
        result = await hasAllPermissions(allPermissions, !useRoleCheck)
      } else if (anyPermissions?.length) {
        result = await hasAnyPermission(anyPermissions, !useRoleCheck)
      } else if (permissions && Object.keys(permissions).length > 0) {
        result = await checkPermission(permissions, !useRoleCheck)
      } else {
        // No specific permissions required, just need to be authenticated (and pass ownership check if any)
        result = true
      }

      setHasAccess(result)
    } catch (err) {
      console.error('Permission check failed:', err)
      setError('Failed to check permissions')
      setHasAccess(false)
    } finally {
      setPermissionLoading(false)
    }
  }, [
    session?.user,
    useRoleCheck,
    requiredRole,
    requiredOwnership,
    anyOwnership,
    role,
    permissions,
    allPermissions,
    anyPermissions,
    checkRolePermission,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
  ])

  // Check permissions
  useEffect(() => {
    if (!sessionLoading) {
      checkPermissions()
    }
  }, [sessionLoading, checkPermissions])

  // Handle redirects
  useEffect(() => {
    if (hasAccess === false) {
      if (!session?.user && redirectOnUnauthenticated) {
        router.push(unauthenticatedRedirect)
        return
      }

      if (session?.user && redirectOnUnauthorized) {
        router.push(unauthorizedRedirect)
        return
      }
    }
  }, [
    hasAccess,
    session,
    redirectOnUnauthorized,
    unauthorizedRedirect,
    redirectOnUnauthenticated,
    unauthenticatedRedirect,
    router,
  ])

  // Show loading state
  if (sessionLoading || permissionLoading || hasAccess === null) {
    return fallbacks.loading ?? null
  }

  // Show error state
  if (error) {
    return fallbacks.error ?? null
  }

  // Not authenticated
  if (!session?.user) {
    return fallbacks.unauthenticated ?? null
  }

  // Authenticated but not authorized
  if (hasAccess === false) {
    return fallbacks.unauthorized ?? null
  }

  // All checks passed, render children directly (do not wrap in a container to avoid extra layout gaps)
  return <div className={className}>{children}</div>
}

/**
 * Higher-order component version of PermissionGuard
 * Useful for wrapping pages or components in a more functional style
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function PermissionGuardedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Page-level permission guard for easy page protection
 * Automatically sets fullPage=true and redirectOnUnauthorized=true
 */
export function PageGuard({
  children,
  ...props
}: Omit<PermissionGuardProps, 'fullPage' | 'redirectOnUnauthorized'>) {
  return (
    <PermissionGuard fullPage redirectOnUnauthorized {...props}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Element-level permission guard with minimal styling
 * Perfect for protecting buttons, links, or small UI elements
 */
export function ElementGuard({
  children,
  loadingFallback,
  errorFallback,
  unauthorizedFallback,
  unauthenticatedFallback,
  ...props
}: Omit<PermissionGuardProps, 'fullPage' | 'fallbacks'> & {
  /** Fallback for loading state */
  loadingFallback?: ReactNode
  /** Fallback for error state */
  errorFallback?: ReactNode
  /** Fallback for unauthorized state */
  unauthorizedFallback?: ReactNode
  /** Fallback for unauthenticated state */
  unauthenticatedFallback?: ReactNode
}) {
  const customFallbacks =
    loadingFallback ||
    errorFallback ||
    unauthorizedFallback ||
    unauthenticatedFallback
      ? {
          loading: loadingFallback,
          error: errorFallback,
          unauthorized: unauthorizedFallback,
          unauthenticated: unauthenticatedFallback,
        }
      : undefined

  return (
    <PermissionGuard
      fullPage={false}
      showBackButton={false}
      fallbacks={customFallbacks}
      {...props}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * Owner-only guard - only shows content to house owners
 * Perfect for features like property management, dues collection, etc.
 */
export function OwnerGuard({
  children,
  ...props
}: Omit<PermissionGuardProps, 'requiredOwnership' | 'anyOwnership'>) {
  return (
    <PermissionGuard requiredOwnership="owner" {...props}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Renter-only guard - only shows content to renters
 * Perfect for renter-specific features like rent payment, tenant services, etc.
 */
export function RenterGuard({
  children,
  ...props
}: Omit<PermissionGuardProps, 'requiredOwnership' | 'anyOwnership'>) {
  return (
    <PermissionGuard requiredOwnership="renter" {...props}>
      {children}
    </PermissionGuard>
  )
}
