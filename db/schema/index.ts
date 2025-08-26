// Export all tables and relations
export * from './auth'
export * from './categories'
export * from './payments'
export * from './expenses'
export * from './funds'
export * from './kyc-documents'
export * from './qr-codes'
export * from './bank-details'

// Import for cross-references
import { relations } from 'drizzle-orm'
import { user } from './auth'
import { payments } from './payments'
import { expenses } from './expenses'
import { kycDocuments } from './kyc-documents'
import { paymentCategories, expenseCategories } from './categories'

// Complete the user relations with payments
export const userPaymentRelations = relations(user, ({ many }) => ({
  payments: many(payments),
  kycDocuments: many(kycDocuments),
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

// KYC Document relations
export const kycDocumentRelations = relations(kycDocuments, ({ one }) => ({
  user: one(user, {
    fields: [kycDocuments.userId],
    references: [user.id],
  }),
  uploadedByUser: one(user, {
    fields: [kycDocuments.uploadedBy],
    references: [user.id],
  }),
}))
