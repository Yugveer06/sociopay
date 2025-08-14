import { pgTable, uuid, numeric, timestamp } from 'drizzle-orm/pg-core'

// Society Funds Table
export const societyFunds = pgTable('society_funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalFunds: numeric('total_funds', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
})
