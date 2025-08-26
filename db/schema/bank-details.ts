import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

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

// Zod schemas for validation
export const insertBankDetailsSchema = createInsertSchema(bankDetails, {
  bankName: z
    .string()
    .min(1, 'Bank name is required')
    .max(100, 'Bank name must be less than 100 characters'),
  branchName: z
    .string()
    .min(1, 'Branch name is required')
    .max(100, 'Branch name must be less than 100 characters'),
  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required')
    .max(150, 'Account holder name must be less than 150 characters'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .max(20, 'Account number must be less than 20 characters')
    .regex(/^[0-9]+$/, 'Account number must contain only digits'),
  ifscCode: z
    .string()
    .min(11, 'IFSC code must be 11 characters')
    .max(11, 'IFSC code must be 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'),
  additionalInfo: z
    .string()
    .max(500, 'Additional info must be less than 500 characters')
    .optional(),
})

export const selectBankDetailsSchema = createSelectSchema(bankDetails)

export type BankDetails = z.infer<typeof selectBankDetailsSchema>
export type NewBankDetails = z.infer<typeof insertBankDetailsSchema>
