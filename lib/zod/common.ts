import { z } from 'zod'

// Common validation utilities and types
export type ActionState<T = unknown> = {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export function validatedAction<T extends z.ZodSchema, K>(
  schema: T,
  action: (data: z.infer<T>) => Promise<ActionState<K>>
) {
  return async (formData: z.infer<T>): Promise<ActionState<K>> => {
    try {
      // Validate the form data
      const validatedData = schema.parse(formData)

      // Execute the action with validated data
      return await action(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Return validation errors
        const errors = error.flatten().fieldErrors
        return {
          success: false,
          message: 'Validation failed',
          errors,
        }
      }

      // Handle other errors
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }
}

// Reusable house number schema used across the app.
// Format: A-1, B-9, C-23 (single uppercase letter, a dash, then 1-2 digits)
// Accepts either Letter-Digits or Digits-Letter with a dash in between.
// Examples valid: A-1, A-10, 1-A, 10-A
// Examples invalid: 1A, A1, A-1A, 1A - 1
// Pattern explanation:
//  ^(?:[A-Z]-\d{1,2}|\d{1,2}-[A-Z])$  -> Either Letter-Dash-1-2Digits OR 1-2Digits-Dash-Letter
export const houseNumber = z
  .string()
  .regex(/^(?:[A-Z]-\d{1,2}|\d{1,2}-[A-Z])$/, {
    message:
      'Please enter a valid house number (examples: A-1, A-10, 1-A, 10-A). Use a dash between letter and number.',
  })
