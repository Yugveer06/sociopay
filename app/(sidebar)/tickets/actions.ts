'use server'

import { db } from '@/db/drizzle'
import { ticketMessages, tickets } from '@/db/schema'
import { validatedAction } from '@/lib/action-helpers'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/server-permissions'
import {
  CreateTicketData,
  createTicketSchema,
  TicketMessageData,
  ticketMessageSchema,
} from '@/lib/zod/tickets'
import { eq } from 'drizzle-orm'
import { revalidatePath as revalidate, revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { ZodError } from 'zod'

async function createTicketAction(formData: CreateTicketData) {
  try {
    const data = createTicketSchema.parse(formData)

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      console.log('[tickets:createTicket] no session user')
      return { success: false, message: 'Not authenticated' }
    }
    console.log('[tickets:createTicket] session user id:', session.user.id)

    const insertRes = await db
      .insert(tickets)
      .values({
        userId: session.user.id,
        title: data.title,
        description: data.body,
        priority: data.priority ?? 'medium',
      })
      .returning()

    const created = insertRes[0]
    console.log(
      '[tickets:createTicket] insertRes:',
      insertRes?.length ? insertRes[0] : insertRes
    )
    if (!created) {
      console.log('[tickets:createTicket] no created row in insertRes')
      return { success: false, message: 'Failed to create' }
    }

    await db.insert(ticketMessages).values({
      ticketId: created.id,
      userId: session.user.id,
      body: data.body,
    })

    try {
      revalidatePath('/tickets')
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Created', data: { id: created.id } }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return { success: false, message: 'Validation failed', errors }
    }
    console.error('createTicket server action error', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
      // include stack in dev to help debugging (remove in production)
      errorStack: error instanceof Error ? error.stack : undefined,
    }
  }
}

// Delete ticket server action
export async function deleteTicket(ticketId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Optional: check permissions here (e.g., checkServerPermission)

    const res = await db
      .delete(tickets)
      .where(eq(tickets.id, ticketId))
      .returning()
    if (res.length === 0) return { success: false, message: 'Ticket not found' }

    try {
      revalidatePath('/tickets')
    } catch {}

    return { success: true, message: 'Deleted' }
  } catch (err) {
    console.error('Delete ticket error', err)
    return { success: false, message: 'Server error' }
  }
}

async function createTicketMessageAction(obj: TicketMessageData) {
  try {
    const data = ticketMessageSchema.parse(obj)

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Check ticket exists and isn't closed — we don't add messages to tombstones (polite robots only)
    const rows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, data.ticketId))
    const ticket = rows[0]
    if (!ticket) return { success: false, message: 'Ticket not found' }
    if (ticket.status === 'closed') {
      try {
        revalidate(`/tickets/${ticket.id}`)
      } catch {
        // ignore revalidate errors
      }
      return {
        success: false,
        message: 'Cannot send message in a closed ticket!',
      }
    }

    const insertRes = await db
      .insert(ticketMessages)
      .values({
        ticketId: data.ticketId,
        userId: session.user.id,
        body: data.body,
      })
      .returning()

    const created = insertRes[0]
    if (!created) return { success: false, message: 'Failed to create message' }

    try {
      revalidatePath(`/tickets/${data.ticketId}`)
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Created', data: { id: created.id } }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return { success: false, message: 'Validation failed', errors }
    }
    console.error('createTicketMessage server action error', error)
    return { success: false, message: 'Server error' }
  }
}
export async function claimTicket(ticketId: string, status = 'in_progress') {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Ensure the current user has assign permission
    await requirePermission({ tickets: ['assign'] })

    if (!ticketId) return { success: false, message: 'Missing ticketId' }

    // Check current ticket state first — don't stomp someone else's claim (polite robots only)
    const rows = await db.select().from(tickets).where(eq(tickets.id, ticketId))
    const existing = rows[0]
    if (!existing) return { success: false, message: 'Ticket not found' }

    // Prevent claiming closed tickets
    if (existing.status === 'closed') {
      try {
        revalidate(`/tickets/${ticketId}`)
      } catch {
        // ignore revalidate errors
      }
      return { success: false, message: 'Cannot claim a closed ticket' }
    }

    if (existing.claimedBy) {
      try {
        revalidate(`/tickets/${ticketId}`)
      } catch {
        // ignore revalidate errors
      }
      return {
        success: false,
        message: 'Ticket already claimed',
      }
    }

    const updates: Record<string, unknown> = {
      claimedBy: session.user.id,
    }
    if (status) updates.status = status

    const res = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, ticketId))
      .returning()

    if (res.length === 0) return { success: false, message: 'Ticket not found' }

    try {
      revalidate(`/tickets/${ticketId}`)
      revalidate('/tickets')
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Ticket claimed', data: res[0] }
  } catch (error) {
    console.error('claimTicket error', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    }
  }
}

// Unclaim (remove claimed_by) - only users with tickets: ['assign'] can do this
export async function unclaimTicket(ticketId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Ensure the current user has assign permission
    await requirePermission({ tickets: ['assign'] })

    if (!ticketId) return { success: false, message: 'Missing ticketId' }

    // Check ticket exists and isn't closed — we don't unclaim tombstones (polite robots only)
    const rows = await db.select().from(tickets).where(eq(tickets.id, ticketId))
    const ticket = rows[0]
    if (!ticket) return { success: false, message: 'Ticket not found' }
    if (ticket.status === 'closed') {
      try {
        revalidate(`/tickets/${ticketId}`)
      } catch {
        // ignore revalidate errors
      }
      return { success: false, message: 'Cannot unclaim a closed ticket' }
    }

    const res = await db
      .update(tickets)
      .set({ claimedBy: null })
      .where(eq(tickets.id, ticketId))
      .returning()

    if (res.length === 0) return { success: false, message: 'Ticket not found' }

    try {
      revalidate(`/tickets/${ticketId}`)
      revalidate('/tickets')
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Ticket unclaimed', data: res[0] }
  } catch (error) {
    console.error('unclaimTicket error', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    }
  }
}

// Close ticket - set status to 'closed' and closedAt timestamp
export async function closeTicket(ticketId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Ensure the current user has assign permission (reuse assign permission)
    await requirePermission({ tickets: ['assign'] })

    if (!ticketId) return { success: false, message: 'Missing ticketId' }

    const res = await db
      .update(tickets)
      .set({ status: 'closed', closedAt: new Date() })
      .where(eq(tickets.id, ticketId))
      .returning()

    if (res.length === 0) return { success: false, message: 'Ticket not found' }

    try {
      revalidate(`/tickets/${ticketId}`)
      revalidate('/tickets')
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Ticket closed', data: res[0] }
  } catch (error) {
    console.error('closeTicket error', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    }
  }
}

// Reopen ticket - set status to 'open' and clear closedAt
export async function reopenTicket(ticketId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, message: 'Not authenticated' }

    // Ensure the current user has assign permission (reuse assign permission)
    await requirePermission({ tickets: ['assign'] })

    if (!ticketId) return { success: false, message: 'Missing ticketId' }

    const res = await db
      .update(tickets)
      .set({ status: 'open', closedAt: null })
      .where(eq(tickets.id, ticketId))
      .returning()

    if (res.length === 0) return { success: false, message: 'Ticket not found' }

    try {
      revalidate(`/tickets/${ticketId}`)
      revalidate('/tickets')
    } catch {
      // ignore revalidate errors
    }

    return { success: true, message: 'Ticket reopened', data: res[0] }
  } catch (error) {
    console.error('reopenTicket error', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    }
  }
}

export const createTicket = validatedAction(
  createTicketSchema,
  createTicketAction
)

export const createTicketMessage = validatedAction(
  ticketMessageSchema,
  createTicketMessageAction
)
