'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconDownload,
  IconFileTypeCsv,
  IconFileText,
  IconFileTypePdf,
} from '@tabler/icons-react'
import { useTransition } from 'react'
import { exportMembers } from './actions'
import { toast } from 'sonner'
import { PermissionGuard } from '@/components/guards'

type ExportData = {
  ID: string
  Name: string
  Email: string
  'House Number': string
  Phone: string
  Role: string
  'House Ownership': string
  'Account Status': string
  'Ban Reason': string
  'Ban Expires': string
  'Email Verified': string
  'Member Since': string
  'Last Updated': string
}

type PDFExportData = Omit<
  ExportData,
  'ID' | 'Ban Reason' | 'Ban Expires' | 'Email Verified'
>

export function ExportMembersButton() {
  const [isPending, startTransition] = useTransition()

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    startTransition(async () => {
      try {
        const result = await exportMembers({ format })

        if (result.success && result.data) {
          if (format === 'pdf') {
            // Handle PDF generation on client side
            await generatePDF(
              JSON.parse(result.data.content),
              result.data.filename
            )
            toast.success(result.message || 'PDF export completed successfully')
          } else {
            // Handle CSV and JSON downloads
            const blob = new Blob([result.data.content], {
              type: result.data.contentType,
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = result.data.filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success(result.message || 'Export completed successfully')
          }
        } else {
          toast.error(result.message || 'Export failed')
        }
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Failed to export data. Please try again.')
      }
    })
  }

  const generatePDF = async (data: PDFExportData[], filename: string) => {
    // Dynamically import jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text('Society Members Report', 14, 22)

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Prepare table data
    const headers = Object.keys(data[0] || {})
    const rows = data.map(item =>
      headers.map(header => item[header as keyof PDFExportData] || '')
    )

    // Generate table - because even PDFs deserve a good table! 📋
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Nice blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
      },
      margin: { top: 40 },
    })

    // Save the PDF
    doc.save(filename)
  }

  return (
    <PermissionGuard permissions={{ members: ['export'] }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            <IconDownload className="mr-2 h-4 w-4" />
            {isPending ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <IconFileTypeCsv className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <IconFileText className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <IconFileTypePdf className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGuard>
  )
}
