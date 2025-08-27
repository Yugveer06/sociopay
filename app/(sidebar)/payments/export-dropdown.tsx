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
import { useTableExport } from '@/hooks/use-table-export'

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
  const { exportToPDF } = useTableExport({
    companyName: 'SUKOON',
    companySubtitle: 'C.O.P. HOUSING SOC LTD',
  })
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
        // Use react-pdf implementation
        const paymentsData = (result.data as PaymentData[]).map(payment => ({
          ID: payment.id,
          Amount: payment.amount,
          'Payment Date': payment.paymentDate || '',
          'User Name': payment.userName,
          'House Number': payment.houseNumber,
          Category: payment.category,
          'Interval Type': payment.intervalType || '',
          'Period Start': payment.periodStart || '',
          'Period End': payment.periodEnd || '',
          Notes: payment.notes || '',
          'Created At': payment.createdAt,
        }))

        await exportToPDF(
          paymentsData,
          'maintenance-payments-report',
          'Maintenance Payments Report',
          'Complete payment records with details'
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
