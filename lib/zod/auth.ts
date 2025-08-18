import { z } from 'zod'

// Authentication schemas
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
    houseOwnership: z.enum(['owner', 'renter'], {
      message: 'Please select your house ownership status.',
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

// Edit member schema (without password fields)
export const editMemberSchema = z.object({
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
  houseOwnership: z.enum(['owner', 'renter'], {
    message: 'Please select house ownership status.',
  }),
  role: z.enum(['user', 'admin'], {
    message: 'Please select a role.',
  }),
})

// Type exports
export type SignInData = z.infer<typeof signInSchema>
export type SignUpData = z.infer<typeof signUpSchema>
export type EditMemberData = z.infer<typeof editMemberSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
