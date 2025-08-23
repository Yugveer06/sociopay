'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { IconDots, IconTrash } from '@tabler/icons-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteExpense } from './actions'
import { usePermissions } from '@/components/guards'

interface ExpenseActionsProps {
  expenseId: string
  expenseAmount: number
  expenseCategory: string
}

export function ExpenseActions({
  expenseId,
  expenseAmount,
  expenseCategory,
}: ExpenseActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { checkPermission } = usePermissions()

  const handleDelete = async () => {
    const allowed = await checkPermission({ expenses: ['delete'] })
    if (!allowed) {
      toast.error('You do not have permission to delete this expense.')
      return
    }
    startTransition(async () => {
      try {
        const result = await deleteExpense({ id: expenseId })

        if (result.success) {
          toast.success(result.message)
          setShowDeleteDialog(false)
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error('Error deleting expense:', error)
        toast.error('Failed to delete expense. Please try again.')
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <IconDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Are you sure you want to delete this expense? This action cannot
                be undone.
                <div className="bg-muted mt-3 rounded-lg p-3">
                  <div className="text-sm font-medium">Expense Details:</div>
                  <div className="text-muted-foreground text-sm">
                    Amount:{' '}
                    <span className="font-medium text-red-600">
                      {formatCurrency(expenseAmount)}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Category:{' '}
                    <span className="font-medium">{expenseCategory}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
