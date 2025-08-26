'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ElementGuard } from './permission-guard'
import { PermissionCheck } from '@/hooks/use-permissions'

interface ServerElementGuardProps {
  permissions?: PermissionCheck
  anyPermissions?: PermissionCheck[]
  allPermissions?: PermissionCheck[]
  children: ReactNode
  loadingFallback?: ReactNode
  unauthorizedFallback?: ReactNode
  unauthenticatedFallback?: ReactNode
}

/**
 * Server-safe wrapper for ElementGuard that prevents SSR issues
 * This component ensures the guard only renders on the client side
 */
export function ServerElementGuard({
  permissions,
  anyPermissions,
  allPermissions,
  children,
  loadingFallback,
  unauthorizedFallback,
  unauthenticatedFallback,
}: ServerElementGuardProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything on the server side
  if (!isClient) {
    return (
      loadingFallback || (
        <div className="bg-muted h-8 w-24 animate-pulse rounded" />
      )
    )
  }

  return (
    <ElementGuard
      permissions={permissions}
      anyPermissions={anyPermissions}
      allPermissions={allPermissions}
      loadingFallback={loadingFallback}
      unauthorizedFallback={unauthorizedFallback}
      unauthenticatedFallback={unauthenticatedFallback}
    >
      {children}
    </ElementGuard>
  )
}
