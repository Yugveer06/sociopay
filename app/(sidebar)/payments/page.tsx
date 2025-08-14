import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { payments, user, paymentCategories } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCreditCard,
  IconFilter,
  IconRefresh,
} from '@tabler/icons-react'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { columns, Payment } from './columns'
import { DataTable } from './data-table'
import { AddPaymentForm } from './add-payment-form'
import { ExportDropdown } from './export-dropdown'

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
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </form>
              <Button variant="outline" size="sm">
                <IconFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Maintenance
                </CardTitle>
                <IconCreditCard className="text-muted-foreground h-4 w-4" />
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
                  This Month Expense
                </CardTitle>
                <IconArrowUpRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthlySpent)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {monthlyChange >= 0 ? '+' : ''}
                  {monthlyChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month Maintenance Received
                </CardTitle>
                <IconArrowDownLeft className="h-4 w-4 text-green-500" />
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

          {/* Maintenance Payments Table */}
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
        </div>
      </div>
    </div>
  )
}
