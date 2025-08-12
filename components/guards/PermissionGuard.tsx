'use client'

import { useSession } from '@/lib/auth-client'
import { type Role, type Statement } from '@/lib/permissions'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Props for the PermissionGuard component
 */
interface PermissionGuardProps {
  children: React.ReactNode
  /** Required role to access the content */
  requiredRole?: Role
  /** Custom permission check - resource and action */
  requiredPermission?: {
    resource: keyof Statement
    action: string
  }
  /** Fallback component to render when access is denied */
  fallback?: React.ReactNode
  /** Redirect URL when access is denied (defaults to "/login") */
  redirectTo?: string
  /** Whether to show a loading state while checking permissions */
  showLoading?: boolean
}

/**
 * Loading component for permission checks
 */
const LoadingState = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
  </div>
)

/**
 * Access denied component
 */
const AccessDenied = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Access Denied</h1>
      <p className="mb-8 text-lg text-gray-600">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
)

/**
 * Helper function to check if user has permission using simple role-based checks
 */
function checkUserPermission(
  userRole: Role,
  resource: keyof Statement,
  action: string
): boolean {
  try {
    // Define permissions based on the statement structure
    const userPermissions: Record<Role, Record<string, string[]>> = {
      admin: {
        payment: ['create', 'view', 'cancel', 'refund'],
        transaction: ['create', 'view', 'list', 'export'],
        wallet: ['create', 'view', 'update', 'transfer'],
        profile: ['view', 'update', 'delete'],
        user: [
          'create',
          'list',
          'update',
          'delete',
          'set-role',
          'ban',
          'impersonate',
          'set-password',
        ],
        session: ['list', 'delete', 'revoke'],
      },
      user: {
        payment: ['view'],
        transaction: ['view', 'list'],
        wallet: ['view'],
        profile: ['view', 'update'],
        user: [],
        session: [],
      },
    }

    const rolePermissions = userPermissions[userRole]
    const resourcePermissions = rolePermissions[resource] || []

    return resourcePermissions.includes(action)
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

/**
 * PermissionGuard component that protects content based on user roles and permissions
 */
export function PermissionGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/login',
  showLoading = true,
}: PermissionGuardProps) {
  const session = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Simple timeout to handle loading state
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Show loading state while checking authentication
  if (isChecking) {
    return showLoading ? <LoadingState /> : null
  }

  // Redirect to login if not authenticated
  if (!session.data?.user) {
    router.push(redirectTo)
    return null
  }

  // Get user role from session (you may need to adjust this based on your user schema)
  const userRole = ((session.data.user as any).role as Role) || 'user'

  // Check role-based access
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return fallback || <AccessDenied />
  }

  // Check specific permission
  if (requiredPermission) {
    const hasPermission = checkUserPermission(
      userRole,
      requiredPermission.resource,
      requiredPermission.action
    )

    if (!hasPermission) {
      return fallback || <AccessDenied />
    }
  }

  // User has required permissions, render children
  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withPermissionGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const session = useSession()

  const hasRole = (role: Role): boolean => {
    if (!session.data?.user) return false
    const userRole = ((session.data.user as any).role as Role) || 'user'
    return userRole === role || userRole === 'admin'
  }

  const hasPermission = (
    resource: keyof Statement,
    action: string
  ): boolean => {
    if (!session.data?.user) return false

    const userRole = ((session.data.user as any).role as Role) || 'user'
    return checkUserPermission(userRole, resource, action)
  }

  const canAccess = (requirements: {
    role?: Role
    permission?: {
      resource: keyof Statement
      action: string
    }
  }): boolean => {
    if (requirements.role && !hasRole(requirements.role)) {
      return false
    }

    if (
      requirements.permission &&
      !hasPermission(
        requirements.permission.resource,
        requirements.permission.action
      )
    ) {
      return false
    }

    return true
  }

  return {
    isLoading: false, // Better Auth doesn't expose loading state the same way
    isAuthenticated: !!session.data?.user,
    userRole: ((session.data?.user as any)?.role as Role) || 'user',
    hasRole,
    hasPermission,
    canAccess,
  }
}
