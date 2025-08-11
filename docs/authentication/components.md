# Authentication Components

## Login Page (`app/(auth)/login/page.tsx`)

### Overview

The login page provides a secure authentication interface for community members to access their accounts.

### Features

-   Email/password authentication
-   Form validation with real-time feedback
-   Loading states during authentication
-   Error handling and display
-   Responsive design with Tailwind CSS

### Component Structure

```typescript
export default function LoginPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [actionResult, setActionResult] = useState<{
		success: boolean;
		message: string;
		errors?: Record<string, string[]>;
	} | null>(null);

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// ... component implementation
}
```

### Form Fields

#### Email Field

-   **Type**: Email input with validation
-   **Validation**: Must be valid email format
-   **Placeholder**: "Enter your email"
-   **Required**: Yes

#### Password Field

-   **Type**: Password input
-   **Validation**: Minimum 6 characters
-   **Placeholder**: "Enter your password"
-   **Required**: Yes

### State Management

#### Form State

-   Managed by React Hook Form
-   Zod schema validation
-   Real-time validation feedback

#### Loading State

-   `isPending`: Boolean indicating form submission
-   `startTransition`: React transition for non-blocking updates
-   Button disabled during submission

#### Error State

-   `actionResult`: Contains success/error information
-   Field-specific errors displayed under inputs
-   General errors shown in alert banner

### User Experience

#### Success Flow

1. User enters valid credentials
2. Form validates input
3. Loading state activated
4. Authentication successful
5. Redirect to `/dashboard/user`

#### Error Flow

1. Invalid credentials or validation errors
2. Error message displayed
3. Form remains accessible for retry
4. Field-specific errors highlighted

### Styling

-   **Layout**: Centered card on gray background
-   **Card**: White background with shadow
-   **Typography**: Geist font family
-   **Colors**: Tailwind CSS color palette
-   **Responsive**: Mobile-first design

### Navigation

-   **Sign Up Link**: Links to `/signup` page
-   **Post-Login Redirect**: `/dashboard/user`

## Signup Page (`app/(auth)/signup/page.tsx`)

### Overview

The signup page allows new community members to create accounts with custom fields specific to residential communities.

### Features

-   Extended form with community-specific fields
-   House number validation
-   Phone number validation
-   Password confirmation
-   Real-time validation feedback

### Form Fields

#### Personal Information

-   **Full Name**: Text input, minimum 2 characters
-   **Email**: Email validation
-   **Phone**: 10-digit number validation

#### Community Information

-   **House Number**: Format validation (A-1, B-9, etc.)
-   **Unique Constraint**: Must be unique across community

#### Security

-   **Password**: Minimum 6 characters
-   **Confirm Password**: Must match password

### Validation Schema

```typescript
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
```

### Component Architecture

Both authentication components follow the same architectural pattern:

1. **Form Management**: React Hook Form with Zod validation
2. **State Management**: React hooks for loading and error states
3. **Server Actions**: Type-safe server actions for authentication
4. **Error Handling**: Comprehensive error display and field validation
5. **Navigation**: Programmatic routing after successful authentication

### Shared Dependencies

```typescript
// Form handling
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI components
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Navigation and state
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
```

### Accessibility

-   **Form Labels**: Proper labeling for screen readers
-   **Error Messages**: Descriptive error messages
-   **Focus Management**: Logical tab order
-   **ARIA Attributes**: Proper ARIA labeling where needed

### Performance

-   **Code Splitting**: Client-side components with dynamic imports
-   **Optimistic Updates**: React transitions for smooth UX
-   **Validation**: Client-side validation before server submission
-   **Loading States**: Clear feedback during async operations
