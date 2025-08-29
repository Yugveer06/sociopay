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
import { LoaderCircle, TicketMinus } from 'lucide-react'
import { unclaimTicket } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
}

export default function UnclaimDialog({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function handleUnclaim() {
    try {
      setLoading(true)
      const res = await unclaimTicket(id)
      if (res?.success) {
        toast.success(res.message || 'Ticket unassigned')
        // refresh current route to pick up server changes
        router.refresh()
      } else {
        toast.error(res?.message || 'Failed to unassign ticket')
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
        <Button size="sm" variant="destructive" disabled={loading}>
          {loading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TicketMinus className="mr-2 h-4 w-4" />
          )}
          Unclaim
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unassign ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to <strong>unassign</strong> this ticket? This
            will remove the <strong>assignment</strong> from your account and
            make the ticket available for other <strong>admins</strong> to
            claim. Any <strong>draft notes</strong>
            or <strong>messages</strong> will remain attached to the ticket; the{' '}
            <strong>ticket status</strong> will not be changed by
            <strong> unassigning</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleUnclaim} asChild>
            <Button variant="destructive" disabled={loading}>
              {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Unclaim
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
