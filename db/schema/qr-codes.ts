import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

/**
 * QR Codes table for UPI payment QR codes
 * Because who doesn't love scanning mysterious squares? 📱
 */
export const qrCodes = pgTable('qr_codes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  upiId: text('upi_id').notNull().unique(), // Ensure no duplicate UPI IDs
  merchantName: text('merchant_name').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Zod schemas for validation
export const insertQrCodeSchema = createInsertSchema(qrCodes, {
  upiId: z
    .string()
    .min(1, 'UPI ID is required')
    .regex(
      /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-_]{2,64}$/,
      'Please enter a valid UPI ID'
    ),
  merchantName: z
    .string()
    .min(1, 'Merchant name is required')
    .max(100, 'Merchant name must be less than 100 characters'),
})

export const selectQrCodeSchema = createSelectSchema(qrCodes)

export type QrCode = z.infer<typeof selectQrCodeSchema>
export type NewQrCode = z.infer<typeof insertQrCodeSchema>
