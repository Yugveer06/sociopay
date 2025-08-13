import { z } from 'zod'

// Define the schemas for auth actions
export const signInSchema = z.object({
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
})

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, {
      message: 'Full name must be at least 2 characters.',
    }),
    houseNumber: z.string().regex(/^[A-Z]-\d{1,2}$/, {
      message: 'Please enter a valid house number (e.g., A-1, B-9, C-23).',
    }),
    email: z.email({
      message: 'Please enter a valid email address.',
    }),
    phone: z.string().regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit phone number.',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Please confirm your password.',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
})

export const resetPasswordSchema = z
  .object({
    email: z.email({
      message: 'Please enter a valid email address.',
    }),
    otp: z.string().length(6, {
      message: 'OTP must be exactly 6 digits.',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Please confirm your password.',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

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

export type SignInData = z.infer<typeof signInSchema>
export type SignUpData = z.infer<typeof signUpSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type AddPaymentData = z.infer<typeof addPaymentSchema>
export type AddPaymentServerData = z.infer<typeof addPaymentServerSchema>
export type AddExpenseData = z.infer<typeof addExpenseSchema>
export type AddExpenseServerData = z.infer<typeof addExpenseServerSchema>
