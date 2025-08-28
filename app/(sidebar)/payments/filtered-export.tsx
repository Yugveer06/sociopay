'use client'

import { Button } from '@/components/ui/button'
import { useTableExport } from '@/hooks/use-table-export'
import { Download } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Payment } from './columns'

interface FilteredExportProps {
  filteredData: Payment[]
  selectedMonth?: Date
}

export function FilteredExport({
  filteredData,
  selectedMonth,
}: FilteredExportProps) {
  const [isPending, startTransition] = useTransition()

  const { exportToPDF } = useTableExport({
    companyName: 'SUKOON',
    companySubtitle: 'CO.OP. HOUSING SOC LTD',
  })

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export')
      return
    }

    startTransition(async () => {
      try {
        // Transform the filtered data for export
        const exportData = filteredData.map(payment => ({
          ID: payment.id,
          Amount: `₹${payment.amount.toLocaleString('en-IN')}`,
          'Payment Date': payment.payment_date
            ? new Date(payment.payment_date).toLocaleDateString('en-IN')
            : '',
          'User Name': payment.user_name,
          'House Number': payment.house_number,
          Category: payment.category_name,
          'Payment Type': payment.payment_type || '',
          'Interval Type': payment.interval_type || '',
          'Period Start': payment.period_start
            ? new Date(payment.period_start).toLocaleDateString('en-IN')
            : '',
          'Period End': payment.period_end
            ? new Date(payment.period_end).toLocaleDateString('en-IN')
            : '',
          Notes: payment.notes || '',
          'Created At': payment.created_at
            ? new Date(payment.created_at).toLocaleDateString('en-IN')
            : '',
        }))

        // Generate filename and title based on whether a month is selected
        let filename: string
        let title: string
        let subtitle: string

        if (selectedMonth) {
          const monthYear = selectedMonth.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })
          filename = `monthly-payments-${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`
          title = `${monthYear} Payment Report`
          subtitle = `Complete payment records for ${monthYear} with details`
        } else {
          filename = `filtered-payments-${new Date().toISOString().split('T')[0]}`
          title = 'Filtered Payment Report'
          subtitle = `Complete payment records with applied filters (${filteredData.length} records)`
        }

        await exportToPDF(exportData, filename, title, subtitle)
        toast.success('PDF exported successfully!')
      } catch (error) {
        console.error('Export error:', error)
        toast.error('PDF export failed')
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      disabled={isPending || filteredData.length === 0}
      className="ml-2"
    >
      <Download className="mr-2 h-4 w-4" />
      {isPending ? 'Exporting...' : `Export Filtered (${filteredData.length})`}
    </Button>
  )
}
