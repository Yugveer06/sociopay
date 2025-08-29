import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tickets } from './tickets'
import { user } from './auth'

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const ticketMessageRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  user: one(user, {
    fields: [ticketMessages.userId],
    references: [user.id],
  }),
}))
