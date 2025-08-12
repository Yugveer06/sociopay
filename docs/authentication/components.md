# Authentication Components

## Login Page (`app/(auth)/login/page.tsx`)

### Overview

The login page provides a secure authentication interface for community members to access their accounts.

### Features

-   Email/password authentication
-   Form validation with real-time feedback
-   Loading states during authentication
-   Password visibility toggle with eye icons
-   Animated UI with Framer Motion
-   Interactive dot background with mouse tracking
-   Error handling and display
-   Responsive design with backdrop blur effect
-   Forgot password link integration

### Component Structure

```typescript
export default function LoginPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
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

	const MotionCard = m.create(Card);

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

-   **Type**: Password input with visibility toggle
-   **Validation**: Minimum 6 characters
-   **Placeholder**: "Enter your password"
-   **Required**: Yes
-   **Features**:
    -   Eye/EyeOff icons for show/hide password
    -   Forgot password link
    -   Relative positioning for toggle button

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

#### Password Visibility State

-   `showPassword`: Boolean controlling password visibility
-   Toggle button with Eye/EyeOff icons
-   Maintains security while improving UX

### User Experience

#### Success Flow

1. User enters valid credentials
2. Form validates input
3. Loading state activated
4. Authentication successful
5. Redirect to `/dashboard`

#### Error Flow

1. Invalid credentials or validation errors
2. Error message displayed
3. Form remains accessible for retry
4. Field-specific errors highlighted

### Styling

-   **Layout**: Centered card with interactive dot background
-   **Card**: Backdrop blur effect with semi-transparent background
-   **Typography**: Geist font family
-   **Colors**: Tailwind CSS color palette with destructive variants
-   **Responsive**: Mobile-first design
-   **Animations**: Framer Motion for smooth transitions

### Navigation

-   **Sign Up Link**: Links to `/signup` page
-   **Post-Login Redirect**: `/dashboard`

## Signup Page (`app/(auth)/signup/page.tsx`)

### Overview

The signup page allows new community members to create accounts with custom fields specific to residential communities.

### Features

-   Extended form with community-specific fields
-   House number validation
-   Phone number validation
-   Password confirmation with visibility toggles
-   Real-time validation feedback
-   Animated UI with Framer Motion
-   Interactive dot background
-   Organized form sections with visual separators
-   Responsive grid layout

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

### Validation Schemas

#### Sign In Schema

```typescript
export const signInSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});
```

#### Sign Up Schema

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

#### Password Reset Schemas

```typescript
export const forgotPasswordSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
});

export const resetPasswordSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		otp: z.string().length(6, {
			message: "OTP must be exactly 6 digits.",
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
import { DotBackground } from "@/components/ui/dot-background";

// Icons and animations
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { motion as m } from "motion/react";
import Link from "next/link";

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
