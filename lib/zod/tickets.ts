import { z } from 'zod'

export const ticketPriority = z.enum(['low', 'medium', 'high', 'urgent'])

export const createTicketSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  body: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters' }),
  priority: ticketPriority.optional(),
})

export type CreateTicketData = z.infer<typeof createTicketSchema>

export const ticketMessageSchema = z.object({
  ticketId: z.string().min(1, { message: 'ticketId is required' }),
  body: z.string().min(1, { message: 'Message cannot be empty' }),
})

export type TicketMessageData = z.infer<typeof ticketMessageSchema>
