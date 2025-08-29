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
import { LoaderCircle, TicketX } from 'lucide-react'
import { closeTicket } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
}

export default function CloseDialog({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function handleClose() {
    try {
      setLoading(true)
      const res = await closeTicket(id)
      if (res?.success) {
        toast.success(res.message || 'Ticket closed')
        router.refresh()
      } else {
        toast.error(res?.message || 'Failed to close ticket')
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
            <TicketX className="mr-2 h-4 w-4" />
          )}
          Close
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to <strong>close</strong> this ticket? Closed
            tickets are marked as complete.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleClose} asChild>
            <Button variant="destructive" disabled={loading}>
              {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Close
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
