'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { TicketMessageData, ticketMessageSchema } from '@/lib/zod/tickets'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createTicketMessage } from '../actions'
import { toast } from 'sonner'

export default function MessageForm({ ticketId }: { ticketId: string }) {
  const router = useRouter()

  const form = useForm<TicketMessageData>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: { ticketId, body: '' },
  })

  const { handleSubmit, reset, register, control, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: TicketMessageData) {
    try {
      const { success, message } = await createTicketMessage(values)
      if (success) {
        router.refresh()
        reset({ ticketId, body: '' })
        toast.success(message)
      } else {
        toast.error(message)
      }
    } catch (err) {
      console.error('createTicketMessage threw', err)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* ensure ticketId is registered so it's included in the submission */}
        <input type="hidden" {...register('ticketId')} />

        <FormField
          control={control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  id="reply-body"
                  className="mt-2 h-28 font-mono"
                  placeholder="Type your reply..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
