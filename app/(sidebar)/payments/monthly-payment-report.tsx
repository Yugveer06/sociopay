'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MonthSelector } from '@/components/ui/month-selector'
import { useTableExport } from '@/hooks/use-table-export'
import { Download, FileText, RefreshCw } from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { exportMonthlyPaymentsToPDF } from './actions'
import { PaymentsDataTable } from './payments-data-table'
import { Payment } from './columns'

interface MonthlyPaymentReportProps {
  users: Array<{ id: string; name: string; houseNumber: string }>
  categories: Array<{ id: number; name: string }>
}

type MonthlyPaymentData = {
  id: string
  amount: number
  paymentDate: string | null
  userName: string
  houseNumber: string
  category: string
  paymentType: string | null
  intervalType: string | null
  periodStart: string | null
  periodEnd: string | null
  notes: string | null
  createdAt: string | null
}

export function MonthlyPaymentReport({
  users,
  categories,
}: MonthlyPaymentReportProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(
    new Date() // Default to current month
  )
  const [monthlyPayments, setMonthlyPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { exportToPDF } = useTableExport({
    companyName: 'SUKOON',
    companySubtitle: 'CO.OP. HOUSING SOC LTD',
  })

  // Format month for display
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  // Fetch monthly payments when month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchMonthlyPayments(selectedMonth)
    }
  }, [selectedMonth])

  const fetchMonthlyPayments = async (month: Date) => {
    setIsLoading(true)
    try {
      const result = await exportMonthlyPaymentsToPDF(month)

      if (result.success && result.data) {
        // Transform the data to match Payment type with proper type casting
        const transformedPayments: Payment[] = (
          result.data as MonthlyPaymentData[]
        ).map(payment => ({
          id: payment.id,
          amount: payment.amount,
          created_at: payment.createdAt,
          interval_type: payment.intervalType as
            | 'monthly'
            | 'quarterly'
            | 'half_yearly'
            | 'annually'
            | null,
          payment_type: payment.paymentType as 'cash' | 'cheque' | 'upi' | null,
          notes: payment.notes,
          payment_date: payment.paymentDate,
          period_start: payment.periodStart,
          period_end: payment.periodEnd,
          user_id: '', // We don't need this for display
          user_name: payment.userName,
          house_number: payment.houseNumber,
          category_name: payment.category,
        }))

        setMonthlyPayments(transformedPayments)
      } else {
        toast.error(result.message || 'Failed to fetch monthly payments')
        setMonthlyPayments([])
      }
    } catch (error) {
      console.error('Error fetching monthly payments:', error)
      toast.error('Failed to fetch monthly payments')
      setMonthlyPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month to export')
      return
    }

    startTransition(async () => {
      try {
        const result = await exportMonthlyPaymentsToPDF(selectedMonth)

        if (result.success && result.data) {
          // Use react-pdf implementation for better formatting
          const paymentsData = (result.data as MonthlyPaymentData[]).map(
            payment => ({
              ID: payment.id,
              Amount: `₹${payment.amount.toLocaleString('en-IN')}`,
              'Payment Date': payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                : '',
              'User Name': payment.userName,
              'House Number': payment.houseNumber,
              Category: payment.category,
              'Payment Type': payment.paymentType || '',
              'Interval Type': payment.intervalType || '',
              'Period Start': payment.periodStart
                ? new Date(payment.periodStart).toLocaleDateString('en-IN')
                : '',
              'Period End': payment.periodEnd
                ? new Date(payment.periodEnd).toLocaleDateString('en-IN')
                : '',
              Notes: payment.notes || '',
              'Created At': payment.createdAt
                ? new Date(payment.createdAt).toLocaleDateString('en-IN')
                : '',
            })
          )

          const monthTitle = formatMonth(selectedMonth)
          await exportToPDF(
            paymentsData,
            `monthly-payments-${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`,
            `${monthTitle} Payment Report`,
            `Complete payment records for ${monthTitle} with details`
          )

          toast.success('PDF exported successfully!')
        } else {
          toast.error(result.message || 'Export failed')
        }
      } catch (error) {
        console.error('Export error:', error)
        toast.error('PDF export failed')
      }
    })
  }

  const handleRefresh = () => {
    if (selectedMonth) {
      fetchMonthlyPayments(selectedMonth)
    }
  }

  // Calculate monthly totals
  const monthlyTotal = monthlyPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const paymentCount = monthlyPayments.length

  return (
    <div className="space-y-6">
      {/* Month Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Month for Detailed Report</CardTitle>
          <CardDescription>
            Choose a specific month to view and export complete payment records
            with full details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md flex-1">
              <label className="mb-2 block text-sm font-medium">
                Select Month & Year
              </label>
              <MonthSelector
                mode="single"
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                startYear={2020}
                endYear={2030}
                className="bg-background w-full rounded-lg border"
                buttonVariant="outline"
                formatters={{
                  formatMonth: date =>
                    date.toLocaleDateString('en-US', { month: 'short' }),
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || !selectedMonth}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleExportPDF}
                disabled={
                  isPending || !selectedMonth || monthlyPayments.length === 0
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {isPending ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>

          {selectedMonth && (
            <div className="bg-muted/50 mt-4 rounded-lg p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {formatMonth(selectedMonth)} Summary
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Detailed payment records for the selected month
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      ₹{monthlyTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-muted-foreground">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{paymentCount}</div>
                    <div className="text-muted-foreground">Payments</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Payments Table */}
      {selectedMonth && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formatMonth(selectedMonth)} Payment Records (
              {monthlyPayments.length})
            </CardTitle>
            <CardDescription>
              Complete payment details for {formatMonth(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                <span>Loading payment records...</span>
              </div>
            ) : monthlyPayments.length > 0 ? (
              <PaymentsDataTable
                payments={monthlyPayments}
                users={users}
                categories={categories}
              />
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg">No payments found</p>
                <p className="text-sm">
                  No payment records found for {formatMonth(selectedMonth)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
