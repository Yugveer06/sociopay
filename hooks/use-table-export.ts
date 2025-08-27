'use client'

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { TableDocument, TableData } from '@/components/export/table-document'

interface UseTableExportOptions {
  companyName?: string
  companySubtitle?: string
}

export const useTableExport = (options: UseTableExportOptions = {}) => {
  const exportToPDF = async (
    data: TableData[],
    filename: string,
    title: string,
    subtitle?: string,
    columns?: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available to export')
        return {
          success: false,
          message: 'No data available to export',
        }
      }

      // Create the PDF document
      const doc = TableDocument({
        title,
        subtitle,
        data,
        columns,
        companyName: options.companyName || 'SUKOON',
        companySubtitle: options.companySubtitle || 'C.O.P. HOUSING SOC LTD',
      })

      // Generate the PDF blob
      const blob = await pdf(doc).toBlob()

      // Create filename with timestamp if not provided
      const finalFilename = filename.endsWith('.pdf')
        ? filename
        : `${filename}-${Date.now()}.pdf`

      // Download the file
      saveAs(blob, finalFilename)

      toast.success('PDF exported successfully!')
      return {
        success: true,
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      const message = 'Failed to export PDF'
      toast.error(message)
      return {
        success: false,
        message,
      }
    }
  }

  const exportToCSV = async (
    data: TableData[],
    filename: string,
    columns?: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available to export')
        return {
          success: false,
          message: 'No data available to export',
        }
      }

      // Use provided columns or extract from first data item
      const csvColumns =
        columns || (data.length > 0 ? Object.keys(data[0]) : [])

      // Create CSV header
      const header = csvColumns.join(',')

      // Create CSV rows
      const rows = data.map(row =>
        csvColumns
          .map(col => {
            const value = row[col]
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = String(value || '')
            if (
              stringValue.includes(',') ||
              stringValue.includes('"') ||
              stringValue.includes('\n')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(',')
      )

      // Combine header and rows
      const csvContent = [header, ...rows].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const finalFilename = filename.endsWith('.csv')
        ? filename
        : `${filename}-${Date.now()}.csv`

      saveAs(blob, finalFilename)

      toast.success('CSV exported successfully!')
      return {
        success: true,
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      const message = 'Failed to export CSV'
      toast.error(message)
      return {
        success: false,
        message,
      }
    }
  }

  const exportToJSON = async (
    data: TableData[],
    filename: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available to export')
        return {
          success: false,
          message: 'No data available to export',
        }
      }

      // Create JSON content
      const jsonContent = JSON.stringify(data, null, 2)

      // Create blob and download
      const blob = new Blob([jsonContent], {
        type: 'application/json;charset=utf-8;',
      })
      const finalFilename = filename.endsWith('.json')
        ? filename
        : `${filename}-${Date.now()}.json`

      saveAs(blob, finalFilename)

      toast.success('JSON exported successfully!')
      return {
        success: true,
      }
    } catch (error) {
      console.error('Error exporting JSON:', error)
      const message = 'Failed to export JSON'
      toast.error(message)
      return {
        success: false,
        message,
      }
    }
  }

  return {
    exportToPDF,
    exportToCSV,
    exportToJSON,
  }
}
