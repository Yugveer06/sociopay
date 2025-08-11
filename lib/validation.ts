import { z } from "zod";

export type ActionState<T = any> = {
	success: boolean;
	message: string;
	data?: T;
	errors?: Record<string, string[]>;
};

export function validatedAction<T extends z.ZodSchema, K>(
	schema: T,
	action: (data: z.infer<T>) => Promise<ActionState<K>>
) {
	return async (formData: z.infer<T>): Promise<ActionState<K>> => {
		try {
			// Validate the form data
			const validatedData = schema.parse(formData);

			// Execute the action with validated data
			return await action(validatedData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Return validation errors
				const errors = error.flatten().fieldErrors;
				return {
					success: false,
					message: "Validation failed",
					errors,
				};
			}

			// Handle other errors
			return {
				success: false,
				message:
					error instanceof Error
						? error.message
						: "An unknown error occurred",
			};
		}
	};
}

// Define the schemas for auth actions
export const signInSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});

export const signUpSchema = z
	.object({
		fullName: z.string().min(2, {
			message: "Full name must be at least 2 characters.",
		}),
		houseNumber: z.string().regex(/^[A-Z]-\d{1,2}$/, {
			message:
				"Please enter a valid house number (e.g., A-1, B-9, C-23).",
		}),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		phone: z.string().regex(/^[0-9]{10}$/, {
			message: "Please enter a valid 10-digit phone number.",
		}),
		password: z.string().min(6, {
			message: "Password must be at least 6 characters.",
		}),
		confirmPassword: z.string().min(6, {
			message: "Please confirm your password.",
		}),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
