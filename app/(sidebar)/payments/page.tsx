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
import { desc, eq } from 'drizzle-orm'
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

export default async function PaymentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch payments with user and category data using Drizzle
  let paymentsData: Payment[] = []
  let users: Array<{ id: string; name: string; houseNumber: string }> = []
  let categories: Array<{ id: number; name: string }> = []
  let error: string | null = null

  try {
    // Fetch payments
    const result = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        created_at: payments.createdAt,
        interval_type: payments.intervalType,
        notes: payments.notes,
        payment_date: payments.paymentDate,
        period_start: payments.periodStart,
        period_end: payments.periodEnd,
        user_id: payments.userId,
        user_name: user.name,
        house_number: user.houseNumber,
        category_name: paymentCategories.name,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .leftJoin(
        paymentCategories,
        eq(payments.categoryId, paymentCategories.id)
      )
      .orderBy(desc(payments.paymentDate))

    // Fetch all users for the form
    const usersResult = await db
      .select({
        id: user.id,
        name: user.name,
        houseNumber: user.houseNumber,
      })
      .from(user)

    // Fetch all categories for the form
    const categoriesResult = await db
      .select({
        id: paymentCategories.id,
        name: paymentCategories.name,
      })
      .from(paymentCategories)

    users = usersResult
    categories = categoriesResult

    // Transform the data to match our Payment type
    paymentsData = result.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount || '0'),
      created_at: payment.created_at?.toISOString() || null,
      interval_type: payment.interval_type,
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

  try {
    // Fetch all payments with category information for due calculation
    const allPaymentsForDue = await db
      .select({
        userId: payments.userId,
        userName: user.name,
        houseNumber: user.houseNumber,
        periodStart: payments.periodStart,
        periodEnd: payments.periodEnd,
        paymentDate: payments.paymentDate,
        categoryId: payments.categoryId,
        categoryName: paymentCategories.name,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .leftJoin(
        paymentCategories,
        eq(payments.categoryId, paymentCategories.id)
      )
      .where(eq(payments.categoryId, 1)) // Only maintenance payments (categoryId = 1)

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
      err instanceof Error ? err.message : 'Failed to calculate maintenance due'
    maintenanceDueData = []
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

              <ExportDropdown
                data={finalPayments.map(payment => ({
                  id: payment.id,
                  amount: payment.amount,
                  paymentDate: payment.payment_date,
                  userName: payment.user_name,
                  houseNumber: payment.house_number,
                  category: payment.category_name,
                  intervalType: payment.interval_type,
                  periodStart: payment.period_start,
                  periodEnd: payment.period_end,
                  notes: payment.notes,
                  createdAt: payment.created_at,
                }))}
              />
              <AddPaymentForm users={users} categories={categories} />
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

          {/* Tabbed Interface for Payments and Due */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="due">Maintenance Due</TabsTrigger>
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
          </Tabs>
        </div>
      </div>
    </div>
  )
}
