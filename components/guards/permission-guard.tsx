'use client'

import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { usePermissions, type PermissionCheck } from '@/hooks/use-permissions'

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
 * Default loading component
 */
const DefaultLoading = ({ fullPage }: { fullPage?: boolean }) => (
  <div
    className={`flex items-center justify-center ${
      fullPage ? 'min-h-screen' : 'p-8'
    }`}
  >
    <div className="flex flex-col items-center space-y-4">
      <Shield className="text-muted-foreground h-8 w-8 animate-pulse" />
      <p className="text-muted-foreground text-sm">Checking permissions...</p>
    </div>
  </div>
)

/**
 * Default unauthorized component
 */
const DefaultUnauthorized = ({
  fullPage,
  showBackButton,
  onBack,
}: {
  fullPage?: boolean
  showBackButton?: boolean
  onBack?: () => void
}) => (
  <div
    className={`flex items-center justify-center ${
      fullPage ? 'bg-background min-h-screen' : 'p-8'
    }`}
  >
    <div className="max-w-md space-y-6 text-center">
      <div className="flex justify-center">
        <div className="bg-destructive/10 rounded-full p-4">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this{' '}
          {fullPage ? 'page' : 'feature'}.
          {fullPage &&
            ' Contact your administrator if you believe this is an error.'}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {showBackButton && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}
        {fullPage && (
          <Button asChild>
            <a href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </a>
          </Button>
        )}
      </div>
    </div>
  </div>
)

/**
 * Default unauthenticated component
 */
const DefaultUnauthenticated = ({ fullPage }: { fullPage?: boolean }) => (
  <div
    className={`flex items-center justify-center ${
      fullPage ? 'bg-background min-h-screen' : 'p-8'
    }`}
  >
    <div className="max-w-md space-y-6 text-center">
      <div className="flex justify-center">
        <div className="bg-primary/10 rounded-full p-4">
          <Shield className="text-primary h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Authentication Required</h2>
        <p className="text-muted-foreground">
          Please sign in to access this {fullPage ? 'page' : 'feature'}.
        </p>
      </div>

      <Button asChild className="w-full">
        <a href="/login">Sign In</a>
      </Button>
    </div>
  </div>
)

/**
 * Default error component
 */
const DefaultError = ({ fullPage }: { fullPage?: boolean }) => (
  <div
    className={`flex items-center justify-center ${
      fullPage ? 'min-h-screen' : 'p-8'
    }`}
  >
    <Alert className="max-w-md">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Something went wrong while checking permissions. Please try again.
      </AlertDescription>
    </Alert>
  </div>
)

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
  children,
  fallbacks = {},
  redirectOnUnauthorized = false,
  unauthorizedRedirect = '/dashboard',
  redirectOnUnauthenticated = false,
  unauthenticatedRedirect = '/login',
  fullPage = false,
  className,
  showBackButton = true,
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

  // Handle back button
  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }, [router])

  // Check permissions - wrapped in useCallback to prevent re-renders
  const checkPermissions = useCallback(async () => {
    if (!session?.user) {
      setHasAccess(false)
      return
    }

    // Reset states
    setError(null)

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
        // No specific permissions required, just need to be authenticated
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
    return (
      <div className={className}>
        {fallbacks.loading || <DefaultLoading fullPage={fullPage} />}
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        {fallbacks.error || <DefaultError fullPage={fullPage} />}
      </div>
    )
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <div className={className}>
        {fallbacks.unauthenticated || (
          <DefaultUnauthenticated fullPage={fullPage} />
        )}
      </div>
    )
  }

  // Authenticated but not authorized
  if (hasAccess === false) {
    return (
      <div className={className}>
        {fallbacks.unauthorized || (
          <DefaultUnauthorized
            fullPage={fullPage}
            showBackButton={showBackButton}
            onBack={handleBack}
          />
        )}
      </div>
    )
  }

  // All checks passed, render children
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
  fallback,
  ...props
}: Omit<PermissionGuardProps, 'fullPage' | 'fallbacks'> & {
  /** Simple fallback content (alternative to custom fallbacks) */
  fallback?: ReactNode
}) {
  const simpleFallbacks = fallback
    ? {
        unauthorized: fallback,
        unauthenticated: fallback,
        loading: fallback,
        error: fallback,
      }
    : undefined

  return (
    <PermissionGuard
      fullPage={false}
      showBackButton={false}
      fallbacks={simpleFallbacks}
      {...props}
    >
      {children}
    </PermissionGuard>
  )
}
