import { z } from 'zod'

// Expense schema for form validation
export const addExpenseSchema = z.object({
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
  expenseDate: z.string().min(1, {
    message: 'Please select an expense date.',
  }),
  notes: z.string().optional().or(z.literal('')),
})

// Expense schema for server action (with transformed types)
export const addExpenseServerSchema = z.object({
  categoryId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1)),
  amount: z
    .string()
    .transform(val => parseFloat(val))
    .pipe(z.number().positive()),
  expenseDate: z.string().min(1),
  notes: z.string().optional(),
})

// Type exports
export type AddExpenseData = z.infer<typeof addExpenseSchema>
export type AddExpenseServerData = z.infer<typeof addExpenseServerSchema>
