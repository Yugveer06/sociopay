// Export all tables and relations
export * from './auth'
export * from './categories'
export * from './payments'
export * from './expenses'
export * from './funds'

// Import for cross-references
import { relations } from 'drizzle-orm'
import { user } from './auth'
import { payments } from './payments'
import { expenses } from './expenses'
import { paymentCategories, expenseCategories } from './categories'

// Complete the user relations with payments
export const userPaymentRelations = relations(user, ({ many }) => ({
  payments: many(payments),
}))

// Complete the category relations
export const paymentCategoryPaymentRelations = relations(
  paymentCategories,
  ({ many }) => ({
    payments: many(payments),
  })
)

export const expenseCategoryExpenseRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  })
)
