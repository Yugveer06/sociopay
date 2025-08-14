import { pgTable, text, serial } from 'drizzle-orm/pg-core'

// Category Tables
export const paymentCategories = pgTable('payment_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

export const expenseCategories = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

// Category Relations are defined in the respective payment/expense schema files
