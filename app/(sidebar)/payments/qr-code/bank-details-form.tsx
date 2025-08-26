'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertBankDetailsSchema } from '@/lib/zod/bank-details'
import type { NewBankDetails, BankDetails } from '@/lib/zod/bank-details'
import {
  createBankDetailsAction,
  updateBankDetailsAction,
  deleteBankDetailsAction,
} from './bank-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Edit, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface BankDetailsFormProps {
  existingBankDetails?: BankDetails | null
}

/**
 * Bank Details Form Component
 * Where bank admins meet form wizardry! 🏦🎭
 */
export function BankDetailsForm({ existingBankDetails }: BankDetailsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm<NewBankDetails>({
    resolver: zodResolver(insertBankDetailsSchema),
    defaultValues: {
      bankName: existingBankDetails?.bankName || 'BANK OF BARODA',
      branchName: existingBankDetails?.branchName || 'JUHAPURA',
      accountHolderName:
        existingBankDetails?.accountHolderName || 'sukun-3 co.op.hou.soc.ltd.',
      accountNumber: existingBankDetails?.accountNumber || '39560100022854',
      ifscCode: existingBankDetails?.ifscCode || 'BARB0JUHAPU',
      additionalInfo:
        existingBankDetails?.additionalInfo || '(FIFTH CHARACTER IS ZERO)',
    },
  })

  const onSubmit = (data: NewBankDetails) => {
    startTransition(async () => {
      try {
        const action = existingBankDetails
          ? updateBankDetailsAction
          : createBankDetailsAction
        const result = await action(data)

        if (result.success) {
          toast.success(result.message)
          setIsDialogOpen(false)
          form.reset()
        } else {
          toast.error(result.message)
        }
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  const handleDelete = () => {
    if (!existingBankDetails) return

    startTransition(async () => {
      try {
        const result = await deleteBankDetailsAction({
          id: existingBankDetails.id,
        })

        if (result.success) {
          toast.success(result.message)
          setIsDeleteDialogOpen(false)
        } else {
          toast.error(result.message)
        }
      } catch {
        toast.error('Failed to delete bank details.')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Main Action Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            {existingBankDetails ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Update Bank Details
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Bank Details
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {existingBankDetails ? 'Update Bank Details' : 'Add Bank Details'}
            </DialogTitle>
            <DialogDescription>
              {existingBankDetails
                ? 'Update the bank account information for payments'
                : 'Add bank account information for traditional payments'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                {...form.register('bankName')}
                placeholder="BANK OF BARODA"
              />
              {form.formState.errors.bankName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                {...form.register('branchName')}
                placeholder="JUHAPURA"
              />
              {form.formState.errors.branchName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.branchName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                {...form.register('accountHolderName')}
                placeholder="sukun-3 co.op.hou.soc.ltd."
              />
              {form.formState.errors.accountHolderName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.accountHolderName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                {...form.register('accountNumber')}
                placeholder="39560100022854"
              />
              {form.formState.errors.accountNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.accountNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                {...form.register('ifscCode')}
                placeholder="BARB0JUHAPU"
                className="font-mono"
              />
              {form.formState.errors.ifscCode && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.ifscCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">
                Additional Information (Optional)
              </Label>
              <Textarea
                id="additionalInfo"
                {...form.register('additionalInfo')}
                placeholder="(FIFTH CHARACTER IS ZERO)"
                rows={2}
              />
              {form.formState.errors.additionalInfo && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.additionalInfo.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending
                  ? existingBankDetails
                    ? 'Updating...'
                    : 'Creating...'
                  : existingBankDetails
                    ? 'Update Details'
                    : 'Create Details'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Button for existing bank details */}
      {existingBankDetails && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Bank Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Bank Details</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete these bank details? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
