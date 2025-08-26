import {
  pgTable,
  text,
  uuid,
  numeric,
  date,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './auth'
import { paymentCategories } from './categories'

// Define enum for interval types
export const intervalTypeEnum = pgEnum('interval_type', [
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
])

// Define enum for payment types - because apparently we need to track how people pay their bills 💰
export const paymentTypeEnum = pgEnum('payment_type', ['cash', 'cheque', 'upi'])

// Payments Table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => paymentCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').defaultNow(),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  intervalType: intervalTypeEnum('interval_type'),
  paymentType: paymentTypeEnum('payment_type').notNull().default('cash'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Payment Relations
export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(user, {
    fields: [payments.userId],
    references: [user.id],
  }),
  category: one(paymentCategories, {
    fields: [payments.categoryId],
    references: [paymentCategories.id],
  }),
}))
