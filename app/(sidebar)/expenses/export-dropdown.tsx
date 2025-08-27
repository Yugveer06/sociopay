'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconDownload, IconFile, IconFileTypePdf } from '@tabler/icons-react'
import { exportExpensesToCSV, exportExpensesToPDF } from './actions'
import { toast } from 'sonner'
import { useTableExport } from '@/hooks/use-table-export'

interface ExportDropdownProps {
  data: Array<{
    id: string
    amount: number
    expenseDate: string | null
    category: string
    notes: string | null
    createdAt: string | null
  }>
}

type ExpenseData = {
  id: string
  amount: number
  expenseDate: string | null
  category: string
  notes: string
  createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ExportDropdown({ data: _ }: ExportDropdownProps) {
  const { exportToPDF } = useTableExport({
    companyName: 'SUKOON',
    companySubtitle: 'CO.OP. HOUSING SOC LTD',
  })
  const handleCSVExport = async () => {
    try {
      const result = await exportExpensesToCSV()

      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || 'society-expenses.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('CSV file downloaded successfully')
      } else {
        toast.error(result.message || 'Failed to export CSV')
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('An error occurred while exporting CSV')
    }
  }

  const handlePDFExport = async () => {
    try {
      const result = await exportExpensesToPDF()

      if (result.success && result.data) {
        // Use react-pdf implementation
        const expensesData = (result.data as ExpenseData[]).map(expense => ({
          ID: expense.id,
          Amount: expense.amount,
          'Expense Date': expense.expenseDate || '',
          Category: expense.category,
          Notes: expense.notes || '',
          'Created At': expense.createdAt,
        }))

        // Calculate total for subtitle
        const totalExpenses = (result.data as ExpenseData[]).reduce(
          (sum: number, expense: ExpenseData) => sum + expense.amount,
          0
        )

        await exportToPDF(
          expensesData,
          'society-expenses-report',
          'Society Expenses Report',
          `Total Expenses: ₹${totalExpenses.toFixed(2)}`
        )
      } else {
        toast.error(result.message || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('PDF export failed')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconDownload className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport}>
          <IconFile className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDFExport}>
          <IconFileTypePdf className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
