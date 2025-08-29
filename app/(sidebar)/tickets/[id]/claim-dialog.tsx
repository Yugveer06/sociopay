'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LoaderCircle, TicketCheck } from 'lucide-react'
import { claimTicket } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
}

export default function ClaimDialog({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function handleClaim() {
    try {
      setLoading(true)
      const res = await claimTicket(id)
      if (res?.success) {
        toast.success(res.message || 'Ticket claimed')
        router.refresh()
      } else {
        toast.error(res?.message || 'Failed to claim ticket')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="default" disabled={loading}>
          {loading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TicketCheck className="mr-2 h-4 w-4" />
          )}
          Claim
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Claim ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to <strong>claim</strong> this ticket? This
            will assign the ticket to your account and mark it as{' '}
            <strong>in progress</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleClaim} asChild>
            <Button disabled={loading}>
              {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Claim
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
