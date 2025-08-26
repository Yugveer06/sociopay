import { z } from 'zod'

// Client-safe and server Zod schemas for bank details
export const insertBankDetailsSchema = z.object({
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

// For select/read shapes we keep a minimal shape matching the table columns
export const selectBankDetailsSchema = z.object({
  id: z.string(),
  bankName: z.string(),
  branchName: z.string(),
  accountHolderName: z.string(),
  accountNumber: z.string(),
  ifscCode: z.string(),
  additionalInfo: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type BankDetails = z.infer<typeof selectBankDetailsSchema>
export type NewBankDetails = z.infer<typeof insertBankDetailsSchema>
