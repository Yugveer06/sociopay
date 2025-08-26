import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/db/drizzle'
import { paymentCategories, payments, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import {
  calculateAllMaintenanceDue,
  PaymentPeriod,
} from '@/lib/maintenance-due-calculator'
import { checkServerPermission } from '@/lib/server-permissions'
import { and, desc, eq } from 'drizzle-orm'
import { ArrowDownLeft, CreditCard, RefreshCw } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AddPaymentForm } from './add-payment-form'
import { columns, Payment } from './columns'
import { DataTable } from './data-table'
import { dueColumns, MaintenanceDueType } from './due-columns'
import { ExportDropdown } from './export-dropdown'
import { MaintenanceDueTable } from './maintenance-due-table'
import { PaymentAnalytics } from './payment-analytics'
import { ServerElementGuard } from '@/components/guards'
import { ClientOnly } from '@/components/client-only'

export default async function PaymentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Check permissions to determine what data to fetch
  // Users with 'list-all' can see all payments, users with 'list-own' can only see their own
  const listAllPermission = await checkServerPermission({
    payment: ['list-all'],
  })
  const listOwnPermission = await checkServerPermission({
    payment: ['list-own'],
  })

  // If user doesn't have either permission, redirect them
  if (!listAllPermission.success && !listOwnPermission.success) {
    redirect('/dashboard') // Or wherever you want to redirect unauthorized users
  }

  // Determine if we should filter by current user (only has list-own permission)
  const shouldFilterByUser =
    !listAllPermission.success && listOwnPermission.success

  // Fetch payments with user and category data using Drizzle
  let paymentsData: Payment[] = []
  let users: Array<{ id: string; name: string; houseNumber: string }> = []
  let categories: Array<{ id: number; name: string }> = []
  let error: string | null = null

  try {
    // Build the payments query with conditional filtering
    const baseSelect = {
      id: payments.id,
      amount: payments.amount,
      created_at: payments.createdAt,
      interval_type: payments.intervalType,
      payment_type: payments.paymentType,
      notes: payments.notes,
      payment_date: payments.paymentDate,
      period_start: payments.periodStart,
      period_end: payments.periodEnd,
      user_id: payments.userId,
      user_name: user.name,
      house_number: user.houseNumber,
      category_name: paymentCategories.name,
    }

    let result
    if (shouldFilterByUser) {
      // Fetch only current user's payments
      result = await db
        .select(baseSelect)
        .from(payments)
        .leftJoin(user, eq(payments.userId, user.id))
        .leftJoin(
          paymentCategories,
          eq(payments.categoryId, paymentCategories.id)
        )
        .where(eq(payments.userId, session.user.id))
        .orderBy(desc(payments.paymentDate))
    } else {
      // Fetch all payments (user has list-all permission)
      result = await db
        .select(baseSelect)
        .from(payments)
        .leftJoin(user, eq(payments.userId, user.id))
        .leftJoin(
          paymentCategories,
          eq(payments.categoryId, paymentCategories.id)
        )
        .orderBy(desc(payments.paymentDate))
    }

    // Fetch users for the form based on permissions
    if (shouldFilterByUser) {
      // Only fetch current user if they have list-own permission
      const currentUserResult = await db
        .select({
          id: user.id,
          name: user.name,
          houseNumber: user.houseNumber,
        })
        .from(user)
        .where(eq(user.id, session.user.id))

      users = currentUserResult
    } else {
      // Fetch all users for the form (user has list-all permission)
      const usersResult = await db
        .select({
          id: user.id,
          name: user.name,
          houseNumber: user.houseNumber,
        })
        .from(user)

      users = usersResult
    }

    // Fetch all categories for the form
    const categoriesResult = await db
      .select({
        id: paymentCategories.id,
        name: paymentCategories.name,
      })
      .from(paymentCategories)

    categories = categoriesResult

    // Transform the data to match our Payment type
    paymentsData = result.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount || '0'),
      created_at: payment.created_at?.toISOString() || null,
      interval_type: payment.interval_type,
      payment_type: payment.payment_type,
      notes: payment.notes,
      payment_date: payment.payment_date || null,
      period_start: payment.period_start || null,
      period_end: payment.period_end || null,
      user_id: payment.user_id,
      user_name: payment.user_name || 'Unknown',
      house_number: payment.house_number || 'Unknown',
      category_name: payment.category_name || 'Uncategorized',
    }))
  } catch (err) {
    console.error('Error fetching payments:', err)
    error = err instanceof Error ? err.message : 'Unknown error occurred'
  }

  // Use the fetched payments data or fallback to sample data
  const finalPayments: Payment[] = paymentsData.length > 0 ? paymentsData : []

  // Calculate maintenance due data
  let maintenanceDueData: MaintenanceDueType[] = []
  let dueCalculationError: string | null = null

  // Check due permissions to determine what due data to fetch
  // Users with 'list-all' can see all due amounts, users with 'list-own' can only see their own
  const listAllDuePermission = await checkServerPermission({
    due: ['list-all'],
  })
  const listOwnDuePermission = await checkServerPermission({
    due: ['list-own'],
  })

  // Only calculate due data if user has appropriate permissions
  if (listAllDuePermission.success || listOwnDuePermission.success) {
    const shouldFilterDueByUser =
      !listAllDuePermission.success && listOwnDuePermission.success

    try {
      // Build due query based on permissions
      const baseDueSelect = {
        userId: payments.userId,
        userName: user.name,
        houseNumber: user.houseNumber,
        periodStart: payments.periodStart,
        periodEnd: payments.periodEnd,
        paymentDate: payments.paymentDate,
        categoryId: payments.categoryId,
        categoryName: paymentCategories.name,
      }

      let allPaymentsForDue
      if (shouldFilterDueByUser) {
        // Fetch only current user's payments for due calculation
        allPaymentsForDue = await db
          .select(baseDueSelect)
          .from(payments)
          .leftJoin(user, eq(payments.userId, user.id))
          .leftJoin(
            paymentCategories,
            eq(payments.categoryId, paymentCategories.id)
          )
          .where(
            and(
              eq(payments.categoryId, 1), // Only maintenance payments (categoryId = 1)
              eq(payments.userId, session.user.id)
            )
          )
      } else {
        // Fetch all payments for due calculation (user has list-all permission)
        allPaymentsForDue = await db
          .select(baseDueSelect)
          .from(payments)
          .leftJoin(user, eq(payments.userId, user.id))
          .leftJoin(
            paymentCategories,
            eq(payments.categoryId, paymentCategories.id)
          )
          .where(eq(payments.categoryId, 1)) // Only maintenance payments (categoryId = 1)
      }

      // Transform to PaymentPeriod format, filtering out invalid records
      const paymentPeriods: PaymentPeriod[] = allPaymentsForDue
        .filter(
          payment => payment.userId && payment.userName && payment.houseNumber
        )
        .map(payment => ({
          userId: payment.userId,
          userName: payment.userName || 'Unknown',
          houseNumber: payment.houseNumber || 'Unknown',
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
          paymentDate: payment.paymentDate,
          categoryId: payment.categoryId,
        }))

      const dueResult = calculateAllMaintenanceDue(paymentPeriods)
      maintenanceDueData = dueResult.usersWithDue as MaintenanceDueType[]
    } catch (err) {
      console.error('Error calculating maintenance due:', err)
      dueCalculationError =
        err instanceof Error
          ? err.message
          : 'Failed to calculate maintenance due'
      maintenanceDueData = []
    }
  }

  // Calculate totals from actual data
  const totalBalance = finalPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const currentMonthPayments = finalPayments.filter(payment => {
    if (!payment.payment_date) return false
    const paymentDate = new Date(payment.payment_date)
    return (
      paymentDate.getMonth() === currentMonth &&
      paymentDate.getFullYear() === currentYear
    )
  })

  const lastMonthPayments = finalPayments.filter(payment => {
    if (!payment.payment_date) return false
    const paymentDate = new Date(payment.payment_date)
    return (
      paymentDate.getMonth() === lastMonth &&
      paymentDate.getFullYear() === lastMonthYear
    )
  })

  const monthlySpent = currentMonthPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const lastMonthSpent = lastMonthPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const monthlyChange =
    lastMonthSpent > 0
      ? ((monthlySpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0
  const monthlyReceived = monthlySpent // For now, assuming same as spent

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/payments')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Maintenance Payments</h1>
              <p className="text-muted-foreground">
                Track Maintenance, and manage maintenance.
              </p>
            </div>
            <div className="flex gap-2">
              <form action={refreshData}>
                <Button variant="outline" size="sm" type="submit">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </form>

              {
                <ClientOnly
                  fallback={
                    <Button disabled size="sm">
                      Loading...
                    </Button>
                  }
                >
                  <ServerElementGuard
                    permissions={{ payment: ['export'] }}
                    loadingFallback={
                      <Button disabled size="sm">
                        Loading...
                      </Button>
                    }
                    unauthorizedFallback={<span hidden>No access</span>}
                  >
                    <ExportDropdown
                      data={finalPayments.map(payment => ({
                        id: payment.id,
                        amount: payment.amount,
                        paymentDate: payment.payment_date,
                        userName: payment.user_name,
                        houseNumber: payment.house_number,
                        category: payment.category_name,
                        paymentType: payment.payment_type,
                        intervalType: payment.interval_type,
                        periodStart: payment.period_start,
                        periodEnd: payment.period_end,
                        notes: payment.notes,
                        createdAt: payment.created_at,
                      }))}
                    />
                  </ServerElementGuard>
                </ClientOnly>
              }
              {
                <ClientOnly
                  fallback={
                    <Button disabled size="sm">
                      Loading...
                    </Button>
                  }
                >
                  <ServerElementGuard
                    permissions={{ payment: ['add'] }}
                    loadingFallback={
                      <Button disabled size="sm">
                        Loading...
                      </Button>
                    }
                    unauthorizedFallback={<span hidden>No access</span>}
                  >
                    <AddPaymentForm users={users} categories={categories} />
                  </ServerElementGuard>
                </ClientOnly>
              }
            </div>
          </div>

          {/* Balance Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Maintenance
                </CardTitle>
                <CreditCard className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalBalance)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Available for spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month Maintenance Received
                </CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyReceived)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {monthlyChange >= 0 ? '+' : ''}
                  {monthlyChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Interface for Payments, Due, and Analytics */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="due">Maintenance Due</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-4">
              {error && !finalPayments.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Error Loading Payments</CardTitle>
                    <CardDescription>
                      There was an error loading payment data. Check console for
                      details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground py-8 text-center">
                      <p>Failed to load payment data</p>
                      <p className="mt-2 text-sm">Error: {error}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Maintenance Payments ({finalPayments.length})
                    </CardTitle>
                    <CardDescription>
                      Detailed view of all maintenance payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable columns={columns} data={finalPayments} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="due" className="space-y-4">
              {dueCalculationError ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Error Loading Due Data</CardTitle>
                    <CardDescription>
                      There was an error calculating maintenance due amounts.
                      Check console for details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground py-8 text-center">
                      <p>Failed to calculate maintenance due data</p>
                      <p className="mt-2 text-sm">
                        Error: {dueCalculationError}
                      </p>
                      <form action={refreshData} className="mt-4">
                        <Button variant="outline" size="sm" type="submit">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Maintenance Due ({maintenanceDueData.length})
                    </CardTitle>
                    <CardDescription>
                      Residents with overdue maintenance payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceDueTable
                      columns={dueColumns}
                      data={maintenanceDueData}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <ClientOnly
                fallback={
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">
                        Loading analytics...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <ServerElementGuard
                  anyPermissions={[
                    { payment: ['list-all'] },
                    { payment: ['list-own'] },
                  ]}
                  loadingFallback={
                    <Card>
                      <CardContent className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">
                          Loading analytics...
                        </div>
                      </CardContent>
                    </Card>
                  }
                  unauthorizedFallback={
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                          You don&apos;t have permission to view payment
                          analytics.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  }
                >
                  <PaymentAnalytics payments={finalPayments} />
                </ServerElementGuard>
              </ClientOnly>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
