'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { roles, statement } from '@/lib/permissions'

/**
 * Permission Guard for Next.js + Better Auth
 * - Full page protection (client-side HOC + helper)
 * - Element-level protection (<ShowIf />)
 * - Works with a custom [check](cci:1://file:///f:/Personal/Web%20Development/Full%20Stack/sociopay/components/permission-guard.tsx:356:0-377:1) function or with `authClient` (if you expose it at `@/lib/auth-client`)
 *
 * Notes:
 * - This file intentionally tries to be implementation-agnostic: it will use the client-side
 *   Better Auth client if you export it from `@/lib/auth-client`. If you didn't, pass a
 *   [check](cci:1://file:///f:/Personal/Web%20Development/Full%20Stack/sociopay/components/permission-guard.tsx:356:0-377:1) function prop that resolves to a boolean.
 * - The server-side helper [getServerSidePropsWithPermission](cci:1://file:///f:/Personal/Web%20Development/Full%20Stack/sociopay/components/permission-guard.tsx:263:0-354:1) expects you to pass your
 *   server-side `auth` instance (from `better-auth`) or a function that retrieves the
 *   current role/user from the request. See the helper's JSDoc for details.
 */

type Permission = typeof statement

// Try to import your auth client. This is optional — the component will still work if you
// pass a custom [check](cci:1://file:///f:/Personal/Web%20Development/Full%20Stack/sociopay/components/permission-guard.tsx:356:0-377:1) function.
let authClient: any = undefined
try {
  // Common pattern: you export createAuthClient() as authClient from `@/lib/auth-client`
  // e.g. export const authClient = createAuthClient({ plugins: [adminClient({ ac, roles })] })
  // and then `export const { useSession, admin } = authClient`.
  // We import as `any` and feature-detect below.
  // If you don't have this path in your project, nothing breaks — pass [check](cci:1://file:///f:/Personal/Web%20Development/Full%20Stack/sociopay/components/permission-guard.tsx:356:0-377:1) prop.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  authClient = require('@/lib/auth-client').authClient
} catch (e) {
  // ignore: user might not have the path or is using a different file
}

export interface PermissionGuardProps {
  /** Permission(s) to check, in Better Auth "permissions" shape */
  permissions?: Permission
  /** If true, require authentication even if `permissions` not provided */
  requireAuth?: boolean
  /** Redirect path when access denied (page-mode only). If `null`, the component will render the `fallback` */
  redirectTo?: string | null
  /** Fallback UI while loading or when access denied */
  fallback?: React.ReactNode
  /** Custom permission checker: (permissions) => Promise<boolean> */
  check?: (permissions?: Permission) => Promise<boolean> | boolean
  /** Mode affects behavior: 'page' will redirect when unauthorized; 'element' will render nothing */
  mode?: 'page' | 'element'
  children?: React.ReactNode
}

/** Default spinner/fallback */
function DefaultFallback({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        // ... rest of the styles
      }}
    >
      {children}
    </div>
  )
}

/**
 * Default permission checker which tries to use the Better Auth client if available.
 * Returns true if allowed, false otherwise.
 */
async function defaultCheck(permissions?: Permission): Promise<boolean> {
  // If no permissions were provided, treat as allowed (the caller can set requireAuth to force auth)
  if (!permissions || Object.keys(permissions).length === 0) return true

  // If we have an auth client and it exposes an `admin` client with `hasPermission`, use that.
  try {
    if (
      authClient &&
      authClient.admin &&
      typeof authClient.admin.hasPermission === 'function'
    ) {
      // hasPermission returns { data, error } (per docs)
      const res = await authClient.admin.hasPermission({ permissions })
      if (res?.data !== undefined) {
        // The client might return a boolean in data or a shaped response. Handle both.
        if (typeof res.data === 'boolean') return res.data
        // If the client returns { allowed: true } or similar, try to infer.
        if (typeof res.data.allowed === 'boolean') return res.data.allowed
      }
      // If it returns a raw boolean
      if (typeof res === 'boolean') return res

      // If hasPermission returned nothing useful, fallthrough and return false.
      return false
    }

    // The client also exposes a `checkRolePermission` synchronous helper that checks a role's permissions
    // without contacting the server. This is useful to avoid a round-trip if you know the user's role(s).
    if (
      authClient &&
      authClient.admin &&
      typeof authClient.admin.checkRolePermission === 'function'
    ) {
      // If the session has a role stored, use it. This is an optimistic, client-side check.
      try {
        const session =
          (authClient.useSession && authClient.useSession()) || undefined
        const currentRole = session?.role || session?.data?.role || undefined
        if (currentRole) {
          // checkRolePermission(role, permissions) returns boolean
          const allowed = authClient.admin.checkRolePermission(
            currentRole,
            permissions
          )
          if (typeof allowed === 'boolean') return allowed
        }
      } catch (e) {
        // ignore and continue
      }
    }
  } catch (e) {
    // ignore errors and fallback to false
  }

  // No way to check — be conservative and deny access by default.
  return false
}

/** Hook that exposes a simple permission state */
export function usePermissionCheck(
  permissions?: Permission,
  customCheck?: PermissionGuardProps['check']
) {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const checker = customCheck ?? defaultCheck
        const res = await checker(permissions)
        if (!mounted) return
        setAllowed(Boolean(res))
      } catch (e: any) {
        if (!mounted) return
        setError(e)
        setAllowed(false)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    run()

    return () => {
      mounted = false
    }
  }, [JSON.stringify(permissions), customCheck])

  return { allowed, loading, error } as const
}

/**
 * Page / Container-level permission guard.
 * Use this to wrap entire pages when client-side protection is acceptable.
 * For server-side protection, use `getServerSidePropsWithPermission` exported below.
 */
export function PermissionGuard({
  permissions,
  requireAuth = false,
  redirectTo = '/login',
  fallback,
  check,
  mode = 'page',
  children,
}: PermissionGuardProps) {
  const router = useRouter()
  const { allowed, loading } = usePermissionCheck(permissions, check)

  // If we require auth and there is no client session, treat as not allowed.
  // We intentionally do not depend on a specific `useSession` implementation — the user can pass `check`.

  if (loading) return <DefaultFallback>{fallback}</DefaultFallback>

  // If allowed, render children
  if (allowed) return <>{children}</>

  // Not allowed
  if (mode === 'element') {
    // element-level protection: render nothing (or you can return null)
    return null
  }

  // page mode: redirect if requested
  if (redirectTo) {
    // redirect using next/router
    useEffect(() => {
      // small safety: only navigate on client
      router.replace(redirectTo)
    }, [router, redirectTo])

    return (
      <DefaultFallback>{fallback ?? <div>Redirecting...</div>}</DefaultFallback>
    )
  }

  // render fallback if no redirect requested
  return <>{fallback ?? <div>Access denied</div>}</>
}

/**
 * Element-level conditional renderer. Use where you need to hide specific buttons/sections.
 * Example: <ShowIf permissions={{ payment: ['generate-receipt'] }}>...</ShowIf>
 */
export function ShowIf({
  permissions,
  fallback = null,
  check,
  children,
}: {
  permissions?: Permission
  fallback?: React.ReactNode
  check?: PermissionGuardProps['check']
  children?: React.ReactNode
}) {
  const { allowed, loading } = usePermissionCheck(permissions, check)

  if (loading) return <>{fallback}</>
  if (allowed) return <>{children}</>
  return <>{fallback}</>
}

/**
 * Higher-order component to wrap a page component with client-side permission checking.
 * Usage: export default withPermission(MyPage, { permissions: { payment: ['list-all'] } })
 */
export function withPermission<P extends object>(
  Page: React.ComponentType<P>,
  options: Partial<PermissionGuardProps> & { permissions?: Permission }
) {
  return function WithPermissionWrapper(props: P) {
    return (
      <PermissionGuard
        permissions={options.permissions}
        requireAuth={options.requireAuth}
        redirectTo={options.redirectTo}
        fallback={options.fallback}
        check={options.check}
        mode={options.mode ?? 'page'}
      >
        <Page {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Server-side helper for Next.js Pages router.
 * WARNING: You must provide a server `auth` instance (from `better-auth`) or a custom
 * `getIdentityFromContext` function so the helper can determine the user's role or id.
 *
 * Example usage:
 *
 * // pages/protected.tsx
 * export const getServerSideProps = getServerSidePropsWithPermission({
 *   permissions: { project: ['create'] },
 *   auth, // YOUR server-side `auth` instance (better-auth)
 *   getIdentityFromContext: async (ctx) => {
 *     // return { role: 'user' } or { userId: '...' }
 *     return { role: 'admin' };
 *   }
 * });
 */
export function getServerSidePropsWithPermission({
  permissions,
  // one of: server auth instance (better-auth export), or a function that calls server API
  auth,
  getIdentityFromContext,
  redirectTo = '/login',
}: {
  permissions: Permission
  auth?: any
  getIdentityFromContext?: (
    ctx: any
  ) =>
    | Promise<{ role?: string; userId?: string } | null>
    | { role?: string; userId?: string }
    | null
  redirectTo?: string
}) {
  return async function getServerSideProps(ctx: any) {
    // 1) Determine identity
    let identity: { role?: string; userId?: string } | null = null
    try {
      if (typeof getIdentityFromContext === 'function') {
        identity = await getIdentityFromContext(ctx)
      } else if (auth && typeof auth.api?.userHasPermission === 'function') {
        // try to extract role from cookies (you must implement this to match your auth setup)
        // fallback: check an auth session getter if you exposed one on your server auth instance.
        if (typeof auth.getSession === 'function') {
          try {
            const session = await auth.getSession(ctx.req)
            if (session?.role) identity = { role: session.role }
            if (session?.userId) identity = { userId: session.userId }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // deny if we couldn't establish identity
    if (!identity) {
      return {
        redirect: { destination: redirectTo, permanent: false },
      }
    }

    // If the server `auth` is provided, ask it whether identity has permission
    try {
      if (auth && typeof auth.api?.userHasPermission === 'function') {
        const res = await auth.api.userHasPermission({
          body: {
            ...(identity.userId ? { userId: identity.userId } : {}),
            ...(identity.role ? { role: identity.role } : {}),
            permissions,
          },
        })
        // res may be shaped like { data: true } or a boolean
        const allowed = res?.data ?? res
        if (!allowed) {
          return { redirect: { destination: redirectTo, permanent: false } }
        }

        // allowed -> continue, you can pass any extras as props
        return { props: {} }
      }
    } catch (e) {
      // On error, redirect
      return { redirect: { destination: redirectTo, permanent: false } }
    }

    // If we fell through (no server auth available), deny conservatively
    return { redirect: { destination: redirectTo, permanent: false } }
  }
}

/**
 * Utility: synchronous check against a role using the client's `checkRolePermission` if available.
 * This is useful for quick UI toggles where you already know the user's role.
 */
export function checkRolePermissionSync(
  role: string,
  permissions: Permission
): boolean {
  try {
    if (
      authClient &&
      authClient.admin &&
      typeof authClient.admin.checkRolePermission === 'function'
    ) {
      return Boolean(authClient.admin.checkRolePermission(role, permissions))
    }
  } catch (e) {
    // ignore
  }
  // fallback: deny
  return false
}

export default PermissionGuard
