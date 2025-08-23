'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} = RechartsPrimitive

interface AreaChartData {
  month: string
  payments: number
  expenses: number
  netBalance: number
}

interface PieChartData {
  category: string
  amount: number
  fill?: string
}

interface TransactionData {
  type: 'payment' | 'expense'
  amount: number
  date: string
  userName: string
  notes: string | null
}

// Area Chart for Financial Overview (Payments vs Expenses)
export function DashboardAreaChart({ data }: { data: AreaChartData[] }) {
  const chartConfig = {
    payments: {
      label: 'Payments',
      color: 'hsl(142 76% 36%)', // Green color for payments
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(346 87% 43%)', // Red color for expenses
    },
    netBalance: {
      label: 'Net Balance',
      color: 'hsl(221 83% 53%)', // Blue color for net balance
    },
  } satisfies ChartConfig

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>
          Monthly payments, expenses, and net balance trends over the last 6
          months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] w-full sm:min-h-[300px]"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrency}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'payments'
                  ? 'Payments'
                  : name === 'expenses'
                    ? 'Expenses'
                    : 'Net Balance',
              ]}
            />
            <Legend />
            <Area
              dataKey="expenses"
              type="bump"
              fill="hsl(346 87% 43%)"
              fillOpacity={0.4}
              stroke="hsl(346 87% 43%)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="payments"
              type="bump"
              fill="hsl(142 76% 36%)"
              fillOpacity={0.4}
              stroke="hsl(142 76% 36%)"
              strokeWidth={2}
              stackId="b"
            />
            <Area
              dataKey="netBalance"
              type="bump"
              fill="hsl(221 83% 53%)"
              fillOpacity={0.2}
              stroke="hsl(221 83% 53%)"
              strokeWidth={3}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Pie Chart for Category Distribution
export function DashboardPieChart({
  data,
  title,
  description,
}: {
  data: PieChartData[]
  title: string
  description: string
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const predefinedColors = [
    'hsl(142 76% 36%)', // Green
    'hsl(346 87% 43%)', // Red
    'hsl(221 83% 53%)', // Blue
    'hsl(48 96% 53%)', // Yellow
    'hsl(262 83% 58%)', // Purple
    'hsl(175 60% 47%)', // Teal
    'hsl(24 70% 50%)', // Orange
    'hsl(339 82% 52%)', // Pink
  ]

  const chartConfig = data.reduce((config, item, index) => {
    config[item.category.toLowerCase().replace(/\s+/g, '_')] = {
      label: item.category,
      color: predefinedColors[index % predefinedColors.length],
    }
    return config
  }, {} as ChartConfig)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] min-h-[180px] w-full sm:max-h-[250px] sm:min-h-[200px] lg:max-h-[300px] lg:min-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              formatter={(value: number) => [formatCurrency(value)]}
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={40}
              outerRadius={80}
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Maintenance Payment Status Pie Chart
interface MaintenanceStatusData {
  status: string
  count: number
  fill: string
}

export function DashboardMaintenanceStatusChart({
  data,
}: {
  data: MaintenanceStatusData[]
}) {
  const chartConfig = {
    paid: {
      label: 'Paid',
      color: 'hsl(142 76% 36%)', // Green for paid
    },
    overdue: {
      label: 'Overdue',
      color: 'hsl(346 87% 43%)', // Red for overdue
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Maintenance Payment Status</CardTitle>
        <CardDescription>
          Current status of maintenance payments by members
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] min-h-[180px] w-full sm:max-h-[250px] sm:min-h-[200px] lg:max-h-[300px] lg:min-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              formatter={(value: number) => [
                `${value} member${value === 1 ? '' : 's'}`,
                '',
              ]}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={90}
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border bg-green-50 p-2 sm:p-3 dark:bg-green-950/20">
            <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
              {data.find(item => item.status === 'Paid')?.count || 0}
            </div>
            <div className="text-xs text-green-600/80 sm:text-sm">
              Members Paid
            </div>
          </div>
          <div className="rounded-lg border bg-red-50 p-2 sm:p-3 dark:bg-red-950/20">
            <div className="text-lg font-bold text-red-600 sm:text-xl lg:text-2xl">
              {data.find(item => item.status === 'Overdue')?.count || 0}
            </div>
            <div className="text-xs text-red-600/80 sm:text-sm">
              Members Overdue
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Transactions List
export function DashboardRecentTransactions({
  data,
  title,
  description,
}: {
  data: TransactionData[]
  title: string
  description: string
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-2">
          {data.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No recent transactions
            </p>
          ) : (
            data.map((transaction, index) => (
              <div
                key={index}
                className="bg-muted/30 hover:bg-muted/50 flex items-start justify-between gap-3 rounded-lg p-3 transition-colors"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      transaction.type === 'payment'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p
                        className="truncate text-sm font-medium"
                        title={transaction.userName}
                      >
                        {transaction.userName}
                      </p>
                      <p
                        className={`text-sm font-semibold sm:text-right ${
                          transaction.type === 'payment'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'payment' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    {transaction.notes && (
                      <p
                        className="text-muted-foreground line-clamp-2 text-xs leading-relaxed"
                        title={transaction.notes}
                      >
                        {transaction.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        {formatDate(transaction.date)}
                      </p>
                      <p className="text-muted-foreground text-xs capitalize sm:hidden">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
