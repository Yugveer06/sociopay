'use client'

import { Button } from '@/components/ui/button'
import { useTableExport } from '@/hooks/use-table-export'
import { IconDownload } from '@tabler/icons-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Expense } from './columns'

interface ExpenseFilteredExportProps {
  filteredData: Expense[]
  selectedMonth?: Date
}

export function ExpenseFilteredExport({
  filteredData,
  selectedMonth,
}: ExpenseFilteredExportProps) {
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
        const exportData = filteredData.map(expense => ({
          ID: expense.id,
          Amount: `₹${expense.amount.toLocaleString('en-IN')}`,
          'Expense Date': expense.expense_date
            ? new Date(expense.expense_date).toLocaleDateString('en-IN')
            : '',
          Category: expense.category_name,
          Notes: expense.notes || '',
          'Created At': expense.created_at
            ? new Date(expense.created_at).toLocaleDateString('en-IN')
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
          filename = `monthly-expenses-${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`
          title = `${monthYear} Expense Report`
          subtitle = `Complete expense records for ${monthYear} with details`
        } else {
          filename = `filtered-expenses-${new Date().toISOString().split('T')[0]}`
          title = 'Filtered Expense Report'
          subtitle = `Complete expense records with applied filters (${filteredData.length} records)`
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
      <IconDownload className="mr-2 h-4 w-4" />
      {isPending ? 'Exporting...' : `Export Filtered (${filteredData.length})`}
    </Button>
  )
}
