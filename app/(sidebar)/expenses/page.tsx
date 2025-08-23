import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { expenseCategories, expenses } from '@/db/schema'
import { auth } from '@/lib/auth'
import {
  IconArrowUpRight,
  IconCreditCard,
  IconRefresh,
} from '@tabler/icons-react'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AddExpenseForm } from './add-expense-form'
import { columns, Expense } from './columns'
import { DataTable } from './data-table'
import { ExportDropdown } from './export-dropdown'
import { ElementGuard, PageGuard } from '@/components/guards'

export default async function ExpensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch expenses with category data using Drizzle
  let expensesData: Expense[] = []
  let categories: Array<{ id: number; name: string }> = []
  let error: string | null = null

  try {
    // Fetch expenses
    const result = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        created_at: expenses.createdAt,
        notes: expenses.notes,
        expense_date: expenses.expenseDate,
        category_name: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .orderBy(desc(expenses.expenseDate))

    // Fetch all categories for the form
    const categoriesResult = await db
      .select({
        id: expenseCategories.id,
        name: expenseCategories.name,
      })
      .from(expenseCategories)

    categories = categoriesResult

    // Transform the data to match our Expense type
    expensesData = result.map(expense => ({
      id: expense.id,
      amount: parseFloat(expense.amount || '0'),
      created_at: expense.created_at?.toISOString() || null,
      notes: expense.notes,
      expense_date: expense.expense_date || null,
      category_name: expense.category_name || 'Uncategorized',
    }))
  } catch (err) {
    console.error('Error fetching expenses:', err)
    error = err instanceof Error ? err.message : 'Unknown error occurred'
  }

  // Use the fetched expenses data or fallback to sample data
  const finalExpenses: Expense[] = expensesData.length > 0 ? expensesData : []

  // Calculate totals from actual data
  const totalExpenses = finalExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const currentMonthExpenses = finalExpenses.filter(expense => {
    if (!expense.expense_date) return false
    const expenseDate = new Date(expense.expense_date)
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    )
  })

  const lastMonthExpenses = finalExpenses.filter(expense => {
    if (!expense.expense_date) return false
    const expenseDate = new Date(expense.expense_date)
    return (
      expenseDate.getMonth() === lastMonth &&
      expenseDate.getFullYear() === lastMonthYear
    )
  })

  const monthlySpent = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const lastMonthSpent = lastMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const monthlyChange =
    lastMonthSpent > 0
      ? ((monthlySpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0

  // Get average daily expenses this month

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/expenses')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <PageGuard permissions={{ expenses: ['list'] }}>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Society Expenses</h1>
                <p className="text-muted-foreground">
                  Track and manage society expenses and expenditures.
                </p>
              </div>
              <div className="flex gap-2">
                <form action={refreshData}>
                  <Button variant="outline" size="sm" type="submit">
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </form>

                <ElementGuard
                  permissions={{ expenses: ['export'] }}
                  loadingFallback={
                    <Button disabled size="sm">
                      Loading...
                    </Button>
                  }
                  unauthorizedFallback={<span hidden>No access</span>}
                >
                  <ExportDropdown
                    data={finalExpenses.map(expense => ({
                      id: expense.id,
                      amount: expense.amount,
                      expenseDate: expense.expense_date,
                      category: expense.category_name,
                      notes: expense.notes,
                      createdAt: expense.created_at,
                    }))}
                  />
                </ElementGuard>
                <ElementGuard
                  permissions={{ expenses: ['add'] }}
                  loadingFallback={
                    <Button disabled size="sm">
                      Loading...
                    </Button>
                  }
                  unauthorizedFallback={<span hidden>No access</span>}
                >
                  <AddExpenseForm categories={categories} />
                </ElementGuard>
              </div>
            </div>

            {/* Expense Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <IconCreditCard className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Total society expenditure
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Month Spent
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
            </div>

            {/* Expenses Table */}
            {error && !finalExpenses.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error Loading Expenses</CardTitle>
                  <CardDescription>
                    There was an error loading expense data. Check console for
                    details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground py-8 text-center">
                    <p>Failed to load expense data</p>
                    <p className="mt-2 text-sm">Error: {error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Society Expenses ({finalExpenses.length})
                  </CardTitle>
                  <CardDescription>
                    Detailed view of all society expenses and expenditures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable columns={columns} data={finalExpenses} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageGuard>
  )
}
