'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Payment } from './columns'

interface PaymentAnalyticsProps {
  payments: Payment[]
}

interface PaymentTypeStats {
  cash: {
    count: number
    amount: number
    percentage: number
  }
  cheque: {
    count: number
    amount: number
    percentage: number
  }
  upi: {
    count: number
    amount: number
    percentage: number
  }
}

export function PaymentAnalytics({ payments }: PaymentAnalyticsProps) {
  // Calculate payment type statistics
  const calculateStats = (): PaymentTypeStats => {
    const stats: PaymentTypeStats = {
      cash: { count: 0, amount: 0, percentage: 0 },
      cheque: { count: 0, amount: 0, percentage: 0 },
      upi: { count: 0, amount: 0, percentage: 0 },
    }

    const totalCount = payments.length

    payments.forEach(payment => {
      const type = payment.payment_type || 'cash' // Default to cash if null
      if (type in stats) {
        stats[type as keyof PaymentTypeStats].count += 1
        stats[type as keyof PaymentTypeStats].amount += payment.amount
      }
    })

    // Calculate percentages
    Object.keys(stats).forEach(key => {
      const typedKey = key as keyof PaymentTypeStats
      stats[typedKey].percentage =
        totalCount > 0 ? (stats[typedKey].count / totalCount) * 100 : 0
    })

    return stats
  }

  const stats = calculateStats()
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  // Get icon for payment type
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'cheque':
        return <CreditCard className="h-4 w-4" />
      case 'upi':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  // Get color scheme for payment type
  const getTypeColors = (type: string) => {
    switch (type) {
      case 'cash':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800',
        }
      case 'cheque':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800',
        }
      case 'upi':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
          badge: 'bg-purple-100 text-purple-800',
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
        }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-muted-foreground h-5 w-5" />
        <h3 className="text-lg font-semibold">Payment Method Analytics</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(stats).map(([type, data]) => {
          const colors = getTypeColors(type)
          const amountPercentage =
            totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0

          return (
            <Card
              key={type}
              className={`${colors.bg} ${colors.border} border-2`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colors.text}`}>
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(type)}
                    {type.toUpperCase()}
                  </div>
                </CardTitle>
                <Badge variant="outline" className={colors.badge}>
                  {data.percentage.toFixed(1)}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {formatCurrency(data.amount)}
                    </div>
                    <p className={`text-xs ${colors.text} opacity-70`}>
                      {amountPercentage.toFixed(1)}% of total amount
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${colors.text}`}>
                      Transactions:
                    </span>
                    <Badge variant="secondary" className={colors.badge}>
                      {data.count}
                    </Badge>
                  </div>
                  {data.count > 0 && (
                    <div className="text-muted-foreground text-xs">
                      Avg: {formatCurrency(data.amount / data.count)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-indigo-800">
            💡 Payment Flow Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Total Payments:</span>
              <div className="font-semibold text-indigo-800">
                {payments.length}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <div className="font-semibold text-indigo-800">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Most Popular:</span>
              <div className="font-semibold text-indigo-800 capitalize">
                {Object.entries(stats).reduce(
                  (max, [type, data]) =>
                    data.count >
                    (stats[max as keyof PaymentTypeStats]?.count || 0)
                      ? type
                      : max,
                  'cash'
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Highest Value:</span>
              <div className="font-semibold text-indigo-800 capitalize">
                {Object.entries(stats).reduce(
                  (max, [type, data]) =>
                    data.amount >
                    (stats[max as keyof PaymentTypeStats]?.amount || 0)
                      ? type
                      : max,
                  'cash'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
