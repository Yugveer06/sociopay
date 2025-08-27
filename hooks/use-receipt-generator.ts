'use client'

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import {
  PaymentReceipt,
  ReceiptData,
} from '@/components/receipt/payment-receipt'

interface UseReceiptGeneratorOptions {
  companyName?: string
  companySubtitle?: string
}

export const useReceiptGenerator = (
  options: UseReceiptGeneratorOptions = {}
) => {
  const generateReceipt = async (
    data: ReceiptData,
    filename?: string
  ): Promise<{ success: boolean; message?: string; blob?: Blob }> => {
    try {
      // Create the PDF document
      const doc = PaymentReceipt({
        data,
        companyName: options.companyName || 'SUKOON',
        companySubtitle: options.companySubtitle || 'CO.OP. HOUSING SOC LTD',
      })

      // Generate the PDF blob
      const blob = await pdf(doc).toBlob()

      return {
        success: true,
        blob,
      }
    } catch (error) {
      console.error('Error generating receipt:', error)
      return {
        success: false,
        message: 'Failed to generate receipt PDF',
      }
    }
  }

  const downloadReceipt = async (
    data: ReceiptData,
    filename?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await generateReceipt(data, filename)

      if (!result.success || !result.blob) {
        toast.error(result.message || 'Failed to generate receipt')
        return {
          success: false,
          message: result.message,
        }
      }

      // Create filename if not provided
      const finalFilename = filename || `receipt-${data.id}-${Date.now()}.pdf`

      // Download the file
      saveAs(result.blob, finalFilename)

      toast.success('Receipt downloaded successfully!')
      return {
        success: true,
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      const message = 'Failed to download receipt'
      toast.error(message)
      return {
        success: false,
        message,
      }
    }
  }

  const previewReceipt = async (
    data: ReceiptData
  ): Promise<{ success: boolean; message?: string; url?: string }> => {
    try {
      const result = await generateReceipt(data)

      if (!result.success || !result.blob) {
        return {
          success: false,
          message: result.message,
        }
      }

      // Create object URL for preview
      const url = URL.createObjectURL(result.blob)

      return {
        success: true,
        url,
      }
    } catch (error) {
      console.error('Error creating receipt preview:', error)
      return {
        success: false,
        message: 'Failed to create receipt preview',
      }
    }
  }

  return {
    generateReceipt,
    downloadReceipt,
    previewReceipt,
  }
}
