import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db/drizzle'
import {
  expenseCategories,
  expenses,
  kycDocuments,
  paymentCategories,
  payments,
  user,
} from '@/db/schema'
import { auth } from '@/lib/auth'
import {
  calculateAllMaintenanceDue,
  PaymentPeriod,
} from '@/lib/maintenance-due-calculator'
import {
  IconCreditCard,
  IconRefresh,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'
import { desc, eq, gte, count, sum } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  DashboardAreaChart,
  DashboardMaintenanceStatusChart,
  DashboardPieChart,
  DashboardRecentTransactions,
} from './charts'

interface DashboardData {
  totalPayments: number
  totalExpenses: number
  totalDocuments: number
  activeMembers: number
  netBalance: number
  monthlyNetBalance: number
  paymentsByMonth: Array<{
    month: string
    payments: number
    expenses: number
    netBalance: number
  }>
  paymentsByCategory: Array<{
    category: string
    amount: number
    fill?: string
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    fill?: string
  }>
  recentTransactions: Array<{
    type: 'payment' | 'expense'
    amount: number
    date: string
    userName: string
    notes: string | null
  }>
  maintenanceStatus: Array<{
    status: string
    count: number
    fill: string
  }>
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    // Get total payment amount
    const totalPaymentsResult = await db
      .select({
        total: sum(payments.amount),
      })
      .from(payments)

    const totalPayments = Number(totalPaymentsResult[0]?.total || 0)

    // Get total expense amount
    const totalExpensesResult = await db
      .select({
        total: sum(expenses.amount),
      })
      .from(expenses)

    const totalExpenses = Number(totalExpensesResult[0]?.total || 0)

    // Get total documents count
    const totalDocumentsResult = await db
      .select({
        count: count(),
      })
      .from(kycDocuments)

    const totalDocuments = Number(totalDocumentsResult[0]?.count || 0)

    // Get active members count (not banned)
    const activeMembersResult = await db
      .select({
        count: count(),
      })
      .from(user)
      .where(eq(user.banned, false))

    const activeMembers = Number(activeMembersResult[0]?.count || 0)

    // Get payments and expenses by month (last 6 months) - simplified approach
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoString = sixMonthsAgo.toISOString().split('T')[0] // YYYY-MM-DD format

    // Get all payments from last 6 months
    const recentPayments = await db
      .select({
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        categoryId: payments.categoryId,
      })
      .from(payments)
      .where(gte(payments.paymentDate, sixMonthsAgoString))
      .orderBy(payments.paymentDate)

    // Get all expenses from last 6 months
    const recentExpenses = await db
      .select({
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        categoryId: expenses.categoryId,
      })
      .from(expenses)
      .where(gte(expenses.expenseDate, sixMonthsAgoString))
      .orderBy(expenses.expenseDate)

    // Get recent payments with user names for transactions list
    const recentPaymentsWithUsers = await db
      .select({
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        notes: payments.notes,
        userName: user.name,
        userId: payments.userId,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .orderBy(desc(payments.paymentDate))
      .limit(10)

    // Get recent expenses (no user names needed for expenses as they're society-level)
    const recentExpensesForTransactions = await db
      .select({
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        notes: expenses.notes,
      })
      .from(expenses)
      .orderBy(desc(expenses.expenseDate))
      .limit(5)

    // Group by month manually
    const monthlyData = new Map<
      string,
      { payments: number; expenses: number; netBalance: number }
    >()

    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyData.set(monthKey, { payments: 0, expenses: 0, netBalance: 0 })
    }

    // Process payments
    recentPayments.forEach(payment => {
      if (payment.paymentDate && payment.amount) {
        const monthKey = payment.paymentDate.slice(0, 7) // Extract YYYY-MM from YYYY-MM-DD
        const existing = monthlyData.get(monthKey)
        if (existing) {
          existing.payments += Number(payment.amount)
          existing.netBalance = existing.payments - existing.expenses
        }
      }
    })

    // Process expenses
    recentExpenses.forEach(expense => {
      if (expense.expenseDate && expense.amount) {
        const monthKey = expense.expenseDate.slice(0, 7) // Extract YYYY-MM from YYYY-MM-DD
        const existing = monthlyData.get(monthKey)
        if (existing) {
          existing.expenses += Number(expense.amount)
          existing.netBalance = existing.payments - existing.expenses
        }
      }
    })

    const paymentsByMonth = Array.from(monthlyData.entries()).map(
      ([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        payments: data.payments,
        expenses: data.expenses,
        netBalance: data.netBalance,
      })
    )

    // Get payments by category - simplified
    const allPayments = await db
      .select({
        amount: payments.amount,
        categoryId: payments.categoryId,
      })
      .from(payments)

    const allPaymentCategories = await db
      .select({
        id: paymentCategories.id,
        name: paymentCategories.name,
      })
      .from(paymentCategories)

    // Group payments by category
    const paymentsByCategoryMap = new Map<number, number>()
    allPayments.forEach(payment => {
      if (payment.amount && payment.categoryId) {
        const existing = paymentsByCategoryMap.get(payment.categoryId) || 0
        paymentsByCategoryMap.set(
          payment.categoryId,
          existing + Number(payment.amount)
        )
      }
    })

    const colors = [
      'hsl(142 76% 36%)', // Green
      'hsl(346 87% 43%)', // Red
      'hsl(221 83% 53%)', // Blue
      'hsl(48 96% 53%)', // Yellow
      'hsl(262 83% 58%)', // Purple
      'hsl(175 60% 47%)', // Teal
      'hsl(24 70% 50%)', // Orange
      'hsl(339 82% 52%)', // Pink
    ]

    const paymentsByCategory = allPaymentCategories
      .map((category, index) => ({
        category: category.name,
        amount: paymentsByCategoryMap.get(category.id) || 0,
        fill: colors[index % colors.length],
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    // Get expenses by category - simplified
    const allExpenses = await db
      .select({
        amount: expenses.amount,
        categoryId: expenses.categoryId,
      })
      .from(expenses)

    const allExpenseCategories = await db
      .select({
        id: expenseCategories.id,
        name: expenseCategories.name,
      })
      .from(expenseCategories)

    // Group expenses by category
    const expensesByCategoryMap = new Map<number, number>()
    allExpenses.forEach(expense => {
      if (expense.amount && expense.categoryId) {
        const existing = expensesByCategoryMap.get(expense.categoryId) || 0
        expensesByCategoryMap.set(
          expense.categoryId,
          existing + Number(expense.amount)
        )
      }
    })

    const expensesByCategory = allExpenseCategories
      .map((category, index) => ({
        category: category.name,
        amount: expensesByCategoryMap.get(category.id) || 0,
        fill: colors[index % colors.length],
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    // Calculate net balance
    const netBalance = totalPayments - totalExpenses

    // Calculate current month net balance
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentMonthData = paymentsByMonth.find(data => {
      const dataDate = new Date(data.month + ' 01, ' + currentYear)
      return (
        dataDate.getMonth() === currentMonth &&
        dataDate.getFullYear() === currentYear
      )
    })
    const monthlyNetBalance = currentMonthData?.netBalance || 0

    // Get recent transactions with user names
    const recentPaymentTransactions = recentPaymentsWithUsers.map(payment => ({
      type: 'payment' as const,
      amount: Number(payment.amount),
      date: payment.paymentDate || '',
      userName: payment.userName || 'Unknown User',
      notes: payment.notes,
    }))

    const recentExpenseTransactions = recentExpensesForTransactions.map(
      (expense: {
        amount: string
        expenseDate: string | null
        notes: string | null
      }) => ({
        type: 'expense' as const,
        amount: Number(expense.amount),
        date: expense.expenseDate || '',
        userName: 'Society', // For expenses, we show "Society" as the entity
        notes: expense.notes,
      })
    )

    const recentTransactions = [
      ...recentPaymentTransactions,
      ...recentExpenseTransactions,
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)

    // Calculate maintenance payment status
    let maintenanceStatus = [
      { status: 'Paid', count: 0, fill: 'hsl(142 76% 36%)' }, // Green
      { status: 'Overdue', count: 0, fill: 'hsl(346 87% 43%)' }, // Red
    ]

    try {
      // Fetch maintenance payments for due calculation (categoryId = 1 for maintenance)
      const maintenancePayments = await db
        .select({
          userId: payments.userId,
          userName: user.name,
          houseNumber: user.houseNumber,
          periodStart: payments.periodStart,
          periodEnd: payments.periodEnd,
          paymentDate: payments.paymentDate,
          categoryId: payments.categoryId,
        })
        .from(payments)
        .leftJoin(user, eq(payments.userId, user.id))
        .leftJoin(
          paymentCategories,
          eq(payments.categoryId, paymentCategories.id)
        )
        .where(eq(payments.categoryId, 1)) // Only maintenance payments

      // Transform to PaymentPeriod format
      const paymentPeriods: PaymentPeriod[] = maintenancePayments
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
      const overdueCount = dueResult.usersWithDue.length
      const paidCount = activeMembers - overdueCount

      maintenanceStatus = [
        {
          status: 'Paid',
          count: Math.max(0, paidCount),
          fill: 'hsl(142 76% 36%)',
        },
        { status: 'Overdue', count: overdueCount, fill: 'hsl(346 87% 43%)' },
      ]
    } catch (error) {
      console.error('Error calculating maintenance status:', error)
      // Keep default values
    }

    return {
      totalPayments,
      totalExpenses,
      totalDocuments,
      activeMembers,
      netBalance,
      monthlyNetBalance,
      paymentsByMonth,
      paymentsByCategory,
      expensesByCategory,
      recentTransactions,
      maintenanceStatus,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Return fallback data
    return {
      totalPayments: 0,
      totalExpenses: 0,
      totalDocuments: 0,
      activeMembers: 0,
      netBalance: 0,
      monthlyNetBalance: 0,
      paymentsByMonth: [],
      paymentsByCategory: [],
      expensesByCategory: [],
      recentTransactions: [],
      maintenanceStatus: [
        { status: 'Paid', count: 0, fill: 'hsl(142 76% 36%)' },
        { status: 'Overdue', count: 0, fill: 'hsl(346 87% 43%)' },
      ],
    }
  }
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const dashboardData = await getDashboardData()

  // Calculate month-over-month changes
  const currentMonthPayments =
    dashboardData.paymentsByMonth[dashboardData.paymentsByMonth.length - 1]
      ?.payments || 0
  const lastMonthPayments =
    dashboardData.paymentsByMonth[dashboardData.paymentsByMonth.length - 2]
      ?.payments || 0
  const paymentsChange =
    lastMonthPayments > 0
      ? ((currentMonthPayments - lastMonthPayments) / lastMonthPayments) * 100
      : 0

  const currentMonthExpenses =
    dashboardData.paymentsByMonth[dashboardData.paymentsByMonth.length - 1]
      ?.expenses || 0
  const lastMonthExpenses =
    dashboardData.paymentsByMonth[dashboardData.paymentsByMonth.length - 2]
      ?.expenses || 0
  const expensesChange =
    lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/dashboard')
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
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Society management overview and key metrics.
              </p>
            </div>
            <form action={refreshData}>
              <Button variant="outline" size="sm" type="submit">
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </form>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Payments
                </CardTitle>
                <IconWallet className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600 sm:text-2xl">
                  {formatCurrency(dashboardData.totalPayments)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {paymentsChange >= 0 ? '+' : ''}
                  {paymentsChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <IconCreditCard className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600 sm:text-2xl">
                  {formatCurrency(dashboardData.totalExpenses)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {expensesChange >= 0 ? '+' : ''}
                  {expensesChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Balance
                </CardTitle>
                <IconTrendingUp
                  className={`h-4 w-4 ${dashboardData.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl font-bold sm:text-2xl ${dashboardData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(dashboardData.netBalance)}
                </div>
                <p className="text-muted-foreground text-xs">
                  This month: {formatCurrency(dashboardData.monthlyNetBalance)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Members
                </CardTitle>
                <IconUsers className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-600 sm:text-2xl">
                  {dashboardData.activeMembers}
                </div>
                <p className="text-muted-foreground text-xs">Society members</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview Area Chart */}
          <DashboardAreaChart data={dashboardData.paymentsByMonth} />

          {/* Charts Grid */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {/* Payments by Category Pie Chart */}
            <DashboardPieChart
              data={dashboardData.paymentsByCategory}
              title="Payments by Category"
              description="Distribution of maintenance payments by category"
            />

            {/* Expenses by Category Pie Chart */}
            <DashboardPieChart
              data={dashboardData.expensesByCategory}
              title="Expenses by Category"
              description="Distribution of society expenses by category"
            />
          </div>

          {/* Additional Charts */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {/* Maintenance Payment Status */}
            <DashboardMaintenanceStatusChart
              data={dashboardData.maintenanceStatus}
            />

            {/* Recent Transactions */}
            <DashboardRecentTransactions
              data={dashboardData.recentTransactions}
              title="Recent Transactions"
              description="Latest payments by residents and society expenses"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
