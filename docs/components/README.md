# Components Documentation

## Overview

SocioPay uses a component-based architecture with shadcn/ui components and custom authentication components.

## Component Architecture

```
components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx     # Button component
│   ├── card.tsx       # Card components
│   ├── form.tsx       # Form components
│   └── input.tsx      # Input component
└── [custom]/          # Custom application components
```

## UI Components (shadcn/ui)

### Button Component

**Location**: `components/ui/button.tsx`

**Usage**:

```typescript
import { Button } from "@/components/ui/button";

<Button variant='default' size='default'>
	Click me
</Button>;
```

**Variants**:

-   `default` - Primary button style
-   `destructive` - Red button for dangerous actions
-   `outline` - Outlined button
-   `secondary` - Secondary button style
-   `ghost` - Transparent button
-   `link` - Link-styled button

**Sizes**:

-   `default` - Standard size
-   `sm` - Small button
-   `lg` - Large button
-   `icon` - Icon-only button

### Card Components

**Location**: `components/ui/card.tsx`

**Components**:

-   `Card` - Main card container
-   `CardHeader` - Card header section
-   `CardTitle` - Card title
-   `CardDescription` - Card description
-   `CardContent` - Card body content
-   `CardFooter` - Card footer section

**Usage**:

```typescript
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

<Card>
	<CardHeader>
		<CardTitle>Title</CardTitle>
		<CardDescription>Description</CardDescription>
	</CardHeader>
	<CardContent>Content goes here</CardContent>
</Card>;
```

### Form Components

**Location**: `components/ui/form.tsx`

**Components**:

-   `Form` - Form provider wrapper
-   `FormField` - Individual form field
-   `FormItem` - Form field container
-   `FormLabel` - Form field label
-   `FormControl` - Form control wrapper
-   `FormDescription` - Field description
-   `FormMessage` - Error/validation message

**Usage with React Hook Form**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

const form = useForm({
	resolver: zodResolver(schema),
});

<Form {...form}>
	<form onSubmit={form.handleSubmit(onSubmit)}>
		<FormField
			control={form.control}
			name='fieldName'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Label</FormLabel>
					<FormControl>
						<Input {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</form>
</Form>;
```

### Input Component

**Location**: `components/ui/input.tsx`

**Usage**:

```typescript
import { Input } from "@/components/ui/input";

<Input
	type='email'
	placeholder='Enter email'
	value={value}
	onChange={onChange}
/>;
```

**Types**:

-   `text` - Default text input
-   `email` - Email input with validation
-   `password` - Password input (masked)
-   `tel` - Telephone number input
-   `number` - Numeric input

## Authentication Components

### Login Page Component

**Location**: `app/(auth)/login/page.tsx`

**Features**:

-   Email/password authentication form
-   Real-time validation with Zod
-   Loading states and error handling
-   Responsive design

**Key Props**:

```typescript
// Form state
const form = useForm<z.infer<typeof signInSchema>>({
	resolver: zodResolver(signInSchema),
	defaultValues: {
		email: "",
		password: "",
	},
});

// Loading state
const [isPending, startTransition] = useTransition();

// Error state
const [actionResult, setActionResult] = useState<{
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
} | null>(null);
```

### Signup Page Component

**Location**: `app/(auth)/signup/page.tsx`

**Features**:

-   Extended registration form
-   Community-specific field validation
-   Password confirmation
-   House number format validation

**Form Fields**:

-   Full Name (text)
-   House Number (validated format)
-   Email (email validation)
-   Phone (10-digit validation)
-   Password (minimum 6 characters)
-   Confirm Password (must match)

## Component Patterns

### Form Validation Pattern

All forms follow this pattern:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";

// 1. Define schema
const schema = z.object({
	field: z.string().min(1, "Required"),
});

// 2. Component with form state
export default function FormComponent() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState(null);

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: { field: "" },
	});

	// 3. Submit handler
	function onSubmit(values: z.infer<typeof schema>) {
		startTransition(async () => {
			const result = await serverAction(values);
			setResult(result);

			if (result.success) {
				// Handle success
			} else if (result.errors) {
				// Set field errors
				Object.entries(result.errors).forEach(([field, messages]) => {
					form.setError(field as any, {
						type: "manual",
						message: messages[0],
					});
				});
			}
		});
	}

	// 4. Render form
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				{/* Form fields */}
			</form>
		</Form>
	);
}
```

### Error Display Pattern

Consistent error display across components:

```typescript
// Global error message
{
	actionResult && !actionResult.success && (
		<div className='mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
			{actionResult.message}
		</div>
	);
}

// Field-specific errors via FormMessage
<FormField
	control={form.control}
	name='fieldName'
	render={({ field }) => (
		<FormItem>
			<FormLabel>Label</FormLabel>
			<FormControl>
				<Input {...field} />
			</FormControl>
			<FormMessage /> {/* Displays field errors */}
		</FormItem>
	)}
/>;
```

### Loading State Pattern

Consistent loading states:

```typescript
const [isPending, startTransition] = useTransition();

// In submit handler
startTransition(async () => {
	// Async operation
});

// In button
<Button type='submit' disabled={isPending}>
	{isPending ? "Loading..." : "Submit"}
</Button>;
```

## Styling Conventions

### Tailwind CSS Classes

Common class patterns used throughout components:

```typescript
// Layout
"flex min-h-screen items-center justify-center";
"w-full max-w-md";
"space-y-6";

// Colors
"bg-gray-50"; // Light background
"text-gray-900"; // Dark text
"text-gray-600"; // Muted text
"text-red-600"; // Error text
"bg-red-50"; // Error background
"border-red-200"; // Error border

// Interactive states
"hover:text-blue-500";
"focus:ring-2 focus:ring-blue-500";
"disabled:opacity-50";
```

### Component Styling

```typescript
// Card styling
<Card className='w-full max-w-md'>
	<CardHeader className='text-center'>
		<CardTitle className='text-3xl font-bold text-gray-900'>
			Title
		</CardTitle>
		<CardDescription className='mt-2 text-gray-600'>
			Description
		</CardDescription>
	</CardHeader>
	<CardContent>{/* Content */}</CardContent>
</Card>
```

## Accessibility

### Form Accessibility

-   **Labels**: All inputs have associated labels
-   **Error Messages**: Linked to form fields via aria-describedby
-   **Focus Management**: Logical tab order
-   **Screen Reader Support**: Proper ARIA attributes

### Button Accessibility

-   **Disabled State**: Proper disabled attribute and styling
-   **Loading State**: Clear indication of loading status
-   **Keyboard Navigation**: Full keyboard support

## Performance Optimization

### Code Splitting

Components are automatically code-split by Next.js:

```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
	loading: () => <div>Loading...</div>,
});
```

### React Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
	// Component implementation
});

// Use useCallback for event handlers
const handleSubmit = useCallback(
	data => {
		// Handle submit
	},
	[dependency]
);
```

## Testing Considerations

### Component Testing

```typescript
// Example test structure
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";

describe("LoginPage", () => {
	it("renders login form", () => {
		render(<LoginPage />);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});

	it("shows validation errors", async () => {
		render(<LoginPage />);
		fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

		await screen.findByText(/please enter a valid email/i);
	});
});
```

### Form Testing

-   Test form validation
-   Test submission handling
-   Test error states
-   Test loading states
-   Test accessibility features

## Best Practices

### Component Organization

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Build complex UIs from simple components
3. **Reusability**: Create reusable components in `/components/ui`
4. **Type Safety**: Use TypeScript for all components

### State Management

1. **Local State**: Use useState for component-specific state
2. **Form State**: Use React Hook Form for form management
3. **Server State**: Use server actions for data mutations
4. **Loading States**: Always provide loading feedback

### Error Handling

1. **Graceful Degradation**: Handle errors without breaking UI
2. **User Feedback**: Provide clear error messages
3. **Field Validation**: Show validation errors inline
4. **Global Errors**: Display global errors prominently
