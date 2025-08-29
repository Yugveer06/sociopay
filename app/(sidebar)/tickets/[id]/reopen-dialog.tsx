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
import { LoaderCircle, TicketPlus } from 'lucide-react'
import { reopenTicket } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
}

export default function ReopenDialog({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function handleReopen() {
    try {
      setLoading(true)
      const res = await reopenTicket(id)
      if (res?.success) {
        toast.success(res.message || 'Ticket reopened')
        router.refresh()
      } else {
        toast.error(res?.message || 'Failed to reopen ticket')
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
            <TicketPlus className="mr-2 h-4 w-4" />
          )}
          Reopen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reopen ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to <strong>reopen</strong> this ticket? This
            will change the ticket status back to <strong>open</strong> and make
            it available for work.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleReopen} asChild>
            <Button disabled={loading}>
              {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reopen
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
