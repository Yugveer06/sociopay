'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PermissionGuard,
  PageGuard,
  ElementGuard,
  withPermissionGuard,
} from '@/components/guards/permission-guard'
import { usePermissions } from '@/hooks/use-permissions'
import {
  Shield,
  CreditCard,
  Receipt,
  Users,
  FileText,
  DollarSign,
  Settings,
  Eye,
  Download,
  Trash2,
  Plus,
  Edit,
  Ban,
  Info,
} from 'lucide-react'

/**
 * Example component protected by HOC
 */
const AdminOnlySection = withPermissionGuard(
  function AdminPanel() {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Control Panel
          </CardTitle>
          <CardDescription>
            This section is only visible to administrators (using HOC pattern)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            🎉 Welcome to the admin panel! You have full system access.
          </p>
        </CardContent>
      </Card>
    )
  },
  { requiredRole: 'admin', useRoleCheck: true }
)

/**
 * Example page demonstrating all permission guard features
 */
function PermissionGuardExamplePage() {
  const permissions = usePermissions()
  const { role, isAdmin, session, loading } = permissions
  const [serverCheckResult, setServerCheckResult] = useState<string | null>(
    null
  )

  // Memoize current user status to prevent unnecessary re-renders
  const userStatus = useMemo(
    () => ({
      authenticated: !!session?.user,
      role: role || 'Unknown',
      isAdmin,
      email: session?.user?.email || 'N/A',
    }),
    [session?.user, role, isAdmin]
  )

  // Demo: Server-side permission check
  const handleServerCheck = useCallback(async () => {
    setServerCheckResult('Checking...')
    try {
      // This would typically be a server action
      // For demo purposes, we'll simulate it
      setTimeout(() => {
        setServerCheckResult(
          `✅ Server confirmed: User has payment permissions`
        )
      }, 1000)
    } catch (error) {
      setServerCheckResult(`❌ Server check failed: ${error}`)
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <Shield className="text-muted-foreground h-8 w-8 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Shield className="text-primary h-8 w-8" />
          Permission Guard Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          This page demonstrates how to use the PermissionGuard component for
          protecting content based on user roles and permissions. The guard
          integrates with Better Auth&apos;s access control system.
        </p>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current User Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span>Authenticated:</span>
              <Badge
                variant={userStatus.authenticated ? 'default' : 'destructive'}
              >
                {userStatus.authenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            {userStatus.authenticated && (
              <>
                <div className="flex items-center gap-4 text-sm">
                  <span>Role:</span>
                  <Badge variant={userStatus.isAdmin ? 'default' : 'secondary'}>
                    {userStatus.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>User:</span>
                  <span className="bg-muted rounded px-2 py-1 font-mono text-xs">
                    {userStatus.email}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Permission Guard Examples */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Guards</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="server">Server-Side</TabsTrigger>
        </TabsList>

        {/* Basic Permission Guards */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Admin Only Content */}
            <PermissionGuard requiredRole="admin" useRoleCheck>
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Users className="h-5 w-5" />
                    Admin Only
                  </CardTitle>
                  <CardDescription>
                    Only admins can see this card (role-based check)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    This content is protected by{' '}
                    <code>requiredRole=&quot;admin&quot;</code>
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Payment Permissions */}
            <PermissionGuard permissions={{ payment: ['add'] }}>
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CreditCard className="h-5 w-5" />
                    Add Payments
                  </CardTitle>
                  <CardDescription>
                    Requires payment.add permission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Server-side permission check for{' '}
                    <code>payment: [&apos;add&apos;]</code>
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* KYC Permissions */}
            <PermissionGuard permissions={{ renterKyc: ['view-all'] }}>
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <FileText className="h-5 w-5" />
                    View All KYC
                  </CardTitle>
                  <CardDescription>
                    Requires renterKyc.view-all permission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Can view all user KYC documents (typically admin-only)
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* User Own Data */}
            <PermissionGuard permissions={{ renterKyc: ['view-own'] }}>
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Eye className="h-5 w-5" />
                    View Own KYC
                  </CardTitle>
                  <CardDescription>
                    Requires renterKyc.view-own permission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Can view own KYC documents (available to regular users)
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>
        </TabsContent>

        {/* Advanced Permission Guards */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="space-y-6">
            {/* Multiple Permission Requirements */}
            <PermissionGuard
              allPermissions={[{ payment: ['add'] }, { expenses: ['add'] }]}
            >
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <DollarSign className="h-5 w-5" />
                    Financial Management
                  </CardTitle>
                  <CardDescription>
                    Requires BOTH payment.add AND expenses.add permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Using <code>allPermissions</code> prop for AND logic between
                    permission sets
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Any Permission (OR Logic) */}
            <PermissionGuard
              anyPermissions={[
                { payment: ['list-all'] },
                { due: ['list-all'] },
                { expenses: ['list'] },
              ]}
            >
              <Card className="border-teal-200 bg-teal-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <Receipt className="h-5 w-5" />
                    Financial Reports
                  </CardTitle>
                  <CardDescription>
                    Requires ANY of: payments.list-all, due.list-all, or
                    expenses.list
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Using <code>anyPermissions</code> prop for OR logic between
                    permission sets
                  </p>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Element Level Protection */}
            <Card>
              <CardHeader>
                <CardTitle>Element-Level Protection Examples</CardTitle>
                <CardDescription>
                  Protecting individual buttons and UI elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <ElementGuard permissions={{ payment: ['add'] }}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </ElementGuard>

                  <ElementGuard permissions={{ expenses: ['export'] }}>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </ElementGuard>

                  <ElementGuard requiredRole="admin" useRoleCheck>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All
                    </Button>
                  </ElementGuard>

                  <ElementGuard
                    permissions={{ members: ['edit'] }}
                    fallback={
                      <Button variant="secondary" disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit (No Permission)
                      </Button>
                    }
                  >
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Member
                    </Button>
                  </ElementGuard>

                  <ElementGuard permissions={{ members: ['ban'] }}>
                    <Button variant="destructive">
                      <Ban className="mr-2 h-4 w-4" />
                      Ban User
                    </Button>
                  </ElementGuard>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Different Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="space-y-6">
            {/* HOC Pattern */}
            <AdminOnlySection />

            {/* Custom Fallbacks */}
            <PermissionGuard
              permissions={{ payment: ['delete'] }}
              fallbacks={{
                unauthorized: (
                  <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            Custom Unauthorized Message
                          </p>
                          <p className="text-sm text-yellow-700">
                            You need payment.delete permission to access the
                            danger zone. Contact your administrator for access.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
                loading: (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 animate-pulse text-blue-500" />
                        <span className="text-sm">
                          Custom loading: Verifying delete permissions...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ),
              }}
            >
              <Card className="border-red-300 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700">⚠️ Danger Zone</CardTitle>
                  <CardDescription>
                    High-risk operations with custom fallback messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" size="sm">
                    Delete All Payments
                  </Button>
                </CardContent>
              </Card>
            </PermissionGuard>

            {/* Page Guard Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Page Guard Pattern</CardTitle>
                <CardDescription>
                  Use PageGuard for full page protection (automatically
                  redirects on unauthorized)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Implementation Example</AlertTitle>
                  <AlertDescription className="mt-2">
                    <code className="bg-muted rounded px-2 py-1 text-sm">
                      {`<PageGuard permissions={{ members: ['list'] }}>`}
                      <br />
                      &nbsp;&nbsp;{`<MembersPage />`}
                      <br />
                      {`</PageGuard>`}
                    </code>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Server-Side Examples */}
        <TabsContent value="server" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Server-Side Permission Utilities</CardTitle>
                <CardDescription>
                  Examples of server-side permission checking for API routes and
                  server actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Server Action Example</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <code className="bg-muted block rounded px-2 py-1 text-sm">
                      {`import { requirePermission } from '@/lib/server-permissions'`}
                      <br />
                      <br />
                      {`export async function deletePayment(id: string) {`}
                      <br />
                      &nbsp;&nbsp;
                      {`await requirePermission({ payment: ['delete'] })`}
                      <br />
                      &nbsp;&nbsp;{`// Your deletion logic here...`}
                      <br />
                      {`}`}
                    </code>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Wrapper Function Example</AlertTitle>
                  <AlertDescription className="mt-2">
                    <code className="bg-muted block rounded px-2 py-1 text-sm">
                      {`const protectedAction = withPermission(`}
                      <br />
                      &nbsp;&nbsp;{`{ payment: ['add'] },`}
                      <br />
                      &nbsp;&nbsp;{`async (data) => { /* action logic */ }`}
                      <br />
                      {`)`}
                    </code>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleServerCheck}>
                  Test Server Permission Check
                </Button>

                {serverCheckResult && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{serverCheckResult}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Common patterns and prop reference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">PermissionGuard Props</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  <code>permissions</code> - Single permission check
                </li>
                <li>
                  <code>anyPermissions</code> - OR logic (any match)
                </li>
                <li>
                  <code>allPermissions</code> - AND logic (all match)
                </li>
                <li>
                  <code>requiredRole</code> - Simple role check
                </li>
                <li>
                  <code>useRoleCheck</code> - Client-side checking
                </li>
                <li>
                  <code>fullPage</code> - Page-level styling
                </li>
                <li>
                  <code>redirectOnUnauthorized</code> - Auto redirect
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Available Resources</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  <code>payment</code> - Payment operations
                </li>
                <li>
                  <code>due</code> - Due amount viewing
                </li>
                <li>
                  <code>expenses</code> - Expense management
                </li>
                <li>
                  <code>renterKyc</code> - KYC document access
                </li>
                <li>
                  <code>members</code> - Member management
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrap the entire page with page-level authentication
// For demo purposes, we only require authentication (no specific permissions)
export default function PermissionGuardExample() {
  return (
    <PageGuard permissions={undefined}>
      <PermissionGuardExamplePage />
    </PageGuard>
  )
}
