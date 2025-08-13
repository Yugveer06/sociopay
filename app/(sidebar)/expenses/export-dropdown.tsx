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
        // Import jsPDF dynamically (client-side only)
        const { jsPDF } = await import('jspdf')
        const autoTable = (await import('jspdf-autotable')).default

        const doc = new jsPDF()

        // Add title
        doc.setFontSize(16)
        doc.text('Society Expenses Report', 14, 15)

        // Add generation date
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

        // Calculate total expenses
        const totalExpenses = (result.data as ExpenseData[]).reduce(
          (sum: number, expense: ExpenseData) => sum + expense.amount,
          0
        )
        doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 14, 32)

        // Prepare table data
        const tableData = (result.data as ExpenseData[]).map(
          (expense: ExpenseData) => [
            expense.id,
            `₹${expense.amount.toFixed(2)}`,
            expense.expenseDate || '',
            expense.category,
            expense.notes || '',
            expense.createdAt
              ? new Date(expense.createdAt).toLocaleDateString()
              : '',
          ]
        )

        // Add table
        autoTable(doc, {
          head: [
            ['ID', 'Amount', 'Expense Date', 'Category', 'Notes', 'Created At'],
          ],
          body: tableData,
          startY: 42,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [220, 53, 69], // Red color for expenses
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 25 }, // ID
            1: { cellWidth: 25 }, // Amount
            2: { cellWidth: 30 }, // Expense Date
            3: { cellWidth: 30 }, // Category
            4: { cellWidth: 50 }, // Notes
            5: { cellWidth: 30 }, // Created At
          },
          margin: { left: 14, right: 14 },
        })

        // Save the PDF
        doc.save(result.filename || 'society-expenses.pdf')
        toast.success('PDF file downloaded successfully')
      } else {
        toast.error(result.message || 'Failed to export PDF')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('An error occurred while exporting PDF')
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
