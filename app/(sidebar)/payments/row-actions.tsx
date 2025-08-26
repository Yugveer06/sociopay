'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Receipt, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
import { useState } from 'react'
import { toast } from 'sonner'
import { deletePayment, generatePaymentReceipt } from './actions'
import { Payment } from './columns'
import { ElementGuard } from '@/components/guards'
import { ClientOnly } from '@/components/client-only'

type ReceiptData = {
  id: string
  amount: number
  paymentDate: string | null
  userName: string
  houseNumber: string
  category: string
  paymentType: string
  intervalType: string
  periodStart: string
  periodEnd: string
  notes: string
  createdAt: string
}

interface RowActionsProps {
  payment: Payment
}

export function RowActions({ payment }: RowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleGenerateReceipt = async () => {
    setIsLoading(true)
    try {
      const result = await generatePaymentReceipt(payment.id)

      if (result.success && result.data) {
        const receiptData = result.data as ReceiptData

        // Generate PDF receipt
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height

        // Header background
        doc.setFillColor(59, 130, 246) // Blue background
        doc.rect(0, 0, pageWidth, 50, 'F')

        // Header text
        doc.setTextColor(255, 255, 255) // White text
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('PAYMENT RECEIPT', pageWidth / 2, 25, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('SocioPay Management System', pageWidth / 2, 35, {
          align: 'center',
        })

        // Reset text color to black
        doc.setTextColor(0, 0, 0)

        // Receipt info box
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.rect(15, 60, pageWidth - 30, 30, 'S')

        // Receipt details in box
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Receipt ID:', 20, 70)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.id, 50, 70)

        doc.setFont('helvetica', 'bold')
        doc.text('Issue Date:', 20, 80)
        doc.setFont('helvetica', 'normal')
        doc.text(new Date().toLocaleDateString('en-IN'), 50, 80)

        doc.setFont('helvetica', 'bold')
        doc.text('Status:', pageWidth - 80, 70)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(34, 197, 94) // Green color
        doc.text('PAID', pageWidth - 50, 70)
        doc.setTextColor(0, 0, 0) // Reset to black

        // Payment details section
        let yPosition = 110

        // Section header
        doc.setFillColor(249, 250, 251) // Light gray background
        doc.rect(15, yPosition - 5, pageWidth - 30, 15, 'F')
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('PAYMENT DETAILS', 20, yPosition + 5)

        yPosition += 25

        // Payment info in two columns
        const leftCol = 20
        const rightCol = pageWidth / 2 + 10

        doc.setFontSize(11)

        // Left column
        doc.setFont('helvetica', 'bold')
        doc.text('Paid By:', leftCol, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.userName, leftCol, yPosition + 10)

        doc.setFont('helvetica', 'bold')
        doc.text('House Number:', leftCol, yPosition + 25)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.houseNumber, leftCol, yPosition + 35)

        doc.setFont('helvetica', 'bold')
        doc.text('Category:', leftCol, yPosition + 50)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.category, leftCol, yPosition + 60)

        doc.setFont('helvetica', 'bold')
        doc.text('Payment Type:', leftCol, yPosition + 75)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.paymentType.toUpperCase(), leftCol, yPosition + 85)

        // Right column
        doc.setFont('helvetica', 'bold')
        doc.text('Payment Date:', rightCol, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(receiptData.paymentDate || 'N/A', rightCol, yPosition + 10)

        if (receiptData.intervalType) {
          doc.setFont('helvetica', 'bold')
          doc.text('Interval Type:', rightCol, yPosition + 25)
          doc.setFont('helvetica', 'normal')
          doc.text(
            receiptData.intervalType.replace('_', ' ').toUpperCase(),
            rightCol,
            yPosition + 35
          )
        }

        // Period info (if available)
        if (receiptData.periodStart && receiptData.periodEnd) {
          doc.setFont('helvetica', 'bold')
          doc.text('Service Period:', rightCol, yPosition + 50)
          doc.setFont('helvetica', 'normal')
          const periodText = `${receiptData.periodStart} to ${receiptData.periodEnd}`
          doc.text(periodText, rightCol, yPosition + 60)
        }

        // Amount section (highlighted)
        yPosition += 115
        doc.setFillColor(34, 197, 94) // Green background
        doc.rect(15, yPosition - 5, pageWidth - 30, 25, 'F')

        doc.setTextColor(255, 255, 255) // White text
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('AMOUNT PAID', 20, yPosition + 5)

        // Fix rupee symbol by using Rs. instead of ₹
        const amountText = `Rs. ${receiptData.amount.toFixed(2)}`
        doc.setFontSize(20)
        doc.text(amountText, pageWidth - 20, yPosition + 8, { align: 'right' })

        doc.setTextColor(0, 0, 0) // Reset to black

        // Notes section (if available)
        if (receiptData.notes) {
          yPosition += 40
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Notes:', 20, yPosition)

          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          // Split long notes into multiple lines
          const splitNotes = doc.splitTextToSize(
            receiptData.notes,
            pageWidth - 40
          )
          doc.text(splitNotes, 20, yPosition + 10)
        }

        // Footer section
        const footerY = pageHeight - 40
        doc.setDrawColor(200, 200, 200)
        doc.line(15, footerY - 10, pageWidth - 15, footerY - 10)

        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 100, 100)
        doc.text(
          'This is a computer generated receipt. No signature required.',
          pageWidth / 2,
          footerY,
          { align: 'center' }
        )
        doc.text(
          `Generated on: ${new Date().toLocaleString('en-IN')}`,
          pageWidth / 2,
          footerY + 8,
          { align: 'center' }
        )
        doc.text(
          'SocioPay Management System - Making payments simple and secure',
          pageWidth / 2,
          footerY + 16,
          { align: 'center' }
        )

        // Download the PDF
        doc.save(`receipt-${payment.id}.pdf`)

        toast.success('Receipt generated and downloaded successfully!')
      } else {
        toast.error(result.message || 'Failed to generate receipt')
      }
    } catch (error) {
      console.error('Error generating receipt:', error)
      toast.error('Failed to generate receipt')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deletePayment(payment.id)

      if (result.success) {
        toast.success('Payment deleted successfully!')
        setShowDeleteDialog(false)
      } else {
        toast.error(result.message || 'Failed to delete payment')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Failed to delete payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={handleGenerateReceipt}
            disabled={isLoading}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Generate Receipt
          </DropdownMenuItem>
          <ClientOnly fallback={<span hidden>Loading...</span>}>
            <ElementGuard
              permissions={{ payment: ['delete'] }}
              loadingFallback={<span hidden>Loading...</span>}
              unauthorizedFallback={<span hidden>No Access!</span>}
            >
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </ElementGuard>
          </ClientOnly>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              payment record for <strong>{payment.user_name}</strong> (House{' '}
              {payment.house_number}) amounting to{' '}
              <strong>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(payment.amount)}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLoading ? 'Deleting...' : 'Delete Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
