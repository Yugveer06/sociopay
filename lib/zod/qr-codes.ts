import { z } from 'zod'

// Client-safe QR code schema used for form validation in browser components
export const insertQrCodeSchema = z.object({
  upiId: z
    .string()
    .min(1, 'UPI ID is required')
    .regex(
      /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-_]{2,64}$/, // same pattern as server
      'Please enter a valid UPI ID'
    ),
  merchantName: z
    .string()
    .min(1, 'Merchant name is required')
    .max(100, 'Merchant name must be less than 100 characters'),
})

export type NewQrCode = z.infer<typeof insertQrCodeSchema>

// Select/read shape for QR codes (matches DB table columns)
export const selectQrCodeSchema = z.object({
  id: z.string(),
  upiId: z.string(),
  merchantName: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type QrCode = z.infer<typeof selectQrCodeSchema>
