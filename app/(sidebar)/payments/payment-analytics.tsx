'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import React from 'react'
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

  // No per-component theme: use shared tokens and UI components consistently

  return (
    <div className="w-full">
      <div className="grid gap-4 py-4 md:grid-cols-3">
        {Object.entries(stats).map(([type, data]) => {
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {React.cloneElement(getPaymentIcon(type), {
                      className: `h-4 w-4 text-muted-foreground`,
                    })}
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : type}
                  </div>
                </CardTitle>
                <Badge variant="outline">{data.percentage.toFixed(1)}%</Badge>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(data.amount)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {data.count} Transactions
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Flow Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Total Payments:</span>
                <div className="text-foreground font-semibold">
                  {payments.length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="text-foreground font-semibold">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Most Popular:</span>
                <div className="text-foreground font-semibold capitalize">
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
                <div className="text-foreground font-semibold capitalize">
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
    </div>
  )
}
