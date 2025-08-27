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
import { MoreHorizontal, Receipt, Trash2, Edit, Eye } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deletePayment, generatePaymentReceipt } from './actions'
import { Payment } from './columns'
import { EditPaymentForm } from './edit-payment-form'
import { ElementGuard } from '@/components/guards'
import { useReceiptGenerator } from '@/hooks/use-receipt-generator'
import { ReceiptPreview } from '@/components/receipt/receipt-preview'
import { ReceiptData } from '@/components/receipt/payment-receipt'

interface RowActionsProps {
  payment: Payment
  users: Array<{ id: string; name: string; houseNumber: string }>
  categories: Array<{ id: number; name: string }>
}

export function RowActions({ payment, users, categories }: RowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { downloadReceipt } = useReceiptGenerator({
    companyName: 'SUKOON',
    companySubtitle: 'CO.OP. HOUSING SOC LTD',
  })

  const handleGenerateReceipt = async () => {
    setIsLoading(true)
    try {
      const result = await generatePaymentReceipt(payment.id)

      if (result.success && result.data) {
        const receiptData = result.data as ReceiptData

        // Download the receipt using react-pdf
        await downloadReceipt(receiptData, `receipt-${payment.id}.pdf`)
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
          <ReceiptPreview
            data={{
              id: payment.id,
              amount: payment.amount,
              paymentDate: payment.payment_date,
              userName: payment.user_name,
              houseNumber: payment.house_number,
              category: payment.category_name,
              paymentType: payment.payment_type || 'unknown',
              intervalType: payment.interval_type || undefined,
              periodStart: payment.period_start || undefined,
              periodEnd: payment.period_end || undefined,
              notes: payment.notes || '',
              createdAt: payment.created_at || new Date().toISOString(),
            }}
            trigger={
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Receipt
              </DropdownMenuItem>
            }
            companyName="SUKOON"
            companySubtitle="CO.OP. HOUSING SOC LTD"
          />
          <ElementGuard
            permissions={{ payment: ['edit'] }}
            loadingFallback={<span hidden>Loading...</span>}
            unauthorizedFallback={<span hidden>No Access!</span>}
          >
            <DropdownMenuSeparator />
            <EditPaymentForm
              payment={payment}
              users={users}
              categories={categories}
              trigger={
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Payment
                </DropdownMenuItem>
              }
            />
          </ElementGuard>
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
