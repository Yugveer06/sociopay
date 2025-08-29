import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './auth'

export const ticketStatus = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'closed',
])

export const ticketPriority = pgEnum('ticket_priority', [
  'low',
  'medium',
  'high',
  'urgent',
])

// Tickets table
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  // user who created the ticket
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  claimedBy: text('claimed_by').references(() => user.id),
  title: text('title').notNull(),
  description: text('description'),
  status: ticketStatus('status').notNull().default('open'),
  priority: ticketPriority('priority').notNull().default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  closedAt: timestamp('closed_at'),
})

// Relations for quick joins in queries
export const ticketRelations = relations(tickets, ({ one }) => ({
  user: one(user, {
    fields: [tickets.userId],
    references: [user.id],
  }),
  claimedByUser: one(user, {
    fields: [tickets.claimedBy],
    references: [user.id],
  }),
}))
