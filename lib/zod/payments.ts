import { z } from 'zod'

// Payment schema for form validation
export const addPaymentSchema = z.object({
  userId: z.string().min(1, {
    message: 'Please select a user.',
  }),
  categoryId: z.string().min(1, {
    message: 'Please select a category.',
  }),
  amount: z
    .string()
    .min(1, {
      message: 'Please enter an amount.',
    })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number.',
    }),
  paymentDate: z.string().min(1, {
    message: 'Please select a payment date.',
  }),
  periodStart: z.string().optional().or(z.literal('')),
  periodEnd: z.string().optional().or(z.literal('')),
  intervalType: z
    .enum(['monthly', 'quarterly', 'half_yearly', 'annually'])
    .optional(),
  notes: z.string().optional().or(z.literal('')),
})

// Payment schema for server action (with transformed types)
export const addPaymentServerSchema = z.object({
  userId: z.string().min(1),
  categoryId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1)),
  amount: z
    .string()
    .transform(val => parseFloat(val))
    .pipe(z.number().positive()),
  paymentDate: z.string().min(1),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  intervalType: z
    .enum(['monthly', 'quarterly', 'half_yearly', 'annually'])
    .optional(),
  notes: z.string().optional(),
})

// Type exports
export type AddPaymentData = z.infer<typeof addPaymentSchema>
export type AddPaymentServerData = z.infer<typeof addPaymentServerSchema>
