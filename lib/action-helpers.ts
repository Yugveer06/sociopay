import { z } from 'zod'

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
