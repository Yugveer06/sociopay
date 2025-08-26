'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, File, FileText } from 'lucide-react'
import { exportPaymentsToCSV, exportPaymentsToPDF } from './actions'
import { toast } from 'sonner'

interface ExportDropdownProps {
  data: Array<{
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
  }>
}

type PaymentData = {
  id: string
  amount: number
  paymentDate: string | null
  userName: string
  houseNumber: string
  category: string
  intervalType: string
  periodStart: string
  periodEnd: string
  notes: string
  createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ExportDropdown({ data: _ }: ExportDropdownProps) {
  const handleCSVExport = async () => {
    try {
      const result = await exportPaymentsToCSV()

      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || 'maintenance-payments.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('CSV file downloaded successfully')
      } else {
        toast.error(result.message || 'Failed to export CSV')
      }
    } catch (error) {
      console.error('CSV export error:', error)
      toast.error('Failed to export CSV file')
    }
  }

  const handlePDFExport = async () => {
    try {
      const result = await exportPaymentsToPDF()

      if (result.success && result.data) {
        // Import jsPDF dynamically (client-side only)
        const { jsPDF } = await import('jspdf')
        const autoTable = (await import('jspdf-autotable')).default

        const doc = new jsPDF()

        // Add title
        doc.setFontSize(16)
        doc.text('Maintenance Payments Report', 14, 15)

        // Add generation date
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

        // Prepare table data
        const tableData = (result.data as PaymentData[]).map(
          (payment: PaymentData) => [
            payment.id,
            `₹${payment.amount.toFixed(2)}`,
            payment.paymentDate || '',
            payment.userName,
            payment.houseNumber,
            payment.category,
            payment.intervalType || '',
            payment.notes || '',
          ]
        )

        // Add table
        autoTable(doc, {
          head: [
            [
              'ID',
              'Amount',
              'Date',
              'User',
              'House',
              'Category',
              'Type',
              'Notes',
            ],
          ],
          body: tableData,
          startY: 35,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 20 }, // ID
            1: { cellWidth: 25 }, // Amount
            2: { cellWidth: 25 }, // Date
            3: { cellWidth: 30 }, // User
            4: { cellWidth: 20 }, // House
            5: { cellWidth: 25 }, // Category
            6: { cellWidth: 20 }, // Type
            7: { cellWidth: 35 }, // Notes
          },
          margin: { left: 14, right: 14 },
        })

        // Save the PDF
        doc.save(result.filename || 'maintenance-payments.pdf')
        toast.success('PDF file downloaded successfully')
      } else {
        toast.error(result.message || 'Failed to export PDF')
      }
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF file')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport}>
          <File className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDFExport}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
