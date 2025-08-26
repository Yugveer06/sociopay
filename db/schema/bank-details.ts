import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

/**
 * Bank Details table for traditional payment methods
 * For those who prefer the classic cheque route! 🏦📝
 */
export const bankDetails = pgTable('bank_details', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bankName: text('bank_name').notNull(),
  branchName: text('branch_name').notNull(),
  accountHolderName: text('account_holder_name').notNull(),
  accountNumber: text('account_number').notNull(),
  ifscCode: text('ifsc_code').notNull(),
  additionalInfo: text('additional_info'), // For notes like "FIFTH CHARACTER IS ZERO"
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// (validation schemas moved to `lib/zod/bank-details.ts`)
