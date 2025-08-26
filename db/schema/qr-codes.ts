import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

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

// (validation schemas moved to `lib/zod/qr-codes.ts`)
