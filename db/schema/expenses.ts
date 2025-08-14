import {
  pgTable,
  uuid,
  numeric,
  date,
  integer,
  timestamp,
  text,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { expenseCategories } from './categories'

// Expenses Table
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => expenseCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: date('expense_date').defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Expense Relations
export const expenseRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}))
