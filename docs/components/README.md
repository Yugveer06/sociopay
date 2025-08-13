# Components Documentation

## Overview

SocioPay uses a component-based architecture with shadcn/ui components, custom application components, and advanced data visualization components.

## Component Architecture

```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx        # Button component
│   ├── card.tsx          # Card components
│   ├── form.tsx          # Form components
│   ├── input.tsx         # Input component
│   ├── sidebar.tsx       # Sidebar navigation components
│   ├── table.tsx         # Table components
│   ├── tabs.tsx          # Tab components
│   └── ...               # Other UI primitives
├── app-sidebar.tsx       # Main application sidebar
├── nav-main.tsx          # Main navigation component
├── nav-user.tsx          # User navigation component
├── data-table.tsx        # Advanced data table with drag-and-drop
├── chart-area-interactive.tsx # Interactive area chart
├── section-cards.tsx     # Dashboard summary cards
└── [feature]/            # Feature-specific components
    ├── add-payment-form.tsx
    ├── add-expense-form.tsx
    └── export-dropdown.tsx
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

- `default` - Primary button style
- `destructive` - Red button for dangerous actions
- `outline` - Outlined button
- `secondary` - Secondary button style
- `ghost` - Transparent button
- `link` - Link-styled button

**Sizes**:

- `default` - Standard size
- `sm` - Small button
- `lg` - Large button
- `icon` - Icon-only button

### Card Components

**Location**: `components/ui/card.tsx`

**Components**:

- `Card` - Main card container
- `CardHeader` - Card header section
- `CardTitle` - Card title
- `CardDescription` - Card description
- `CardContent` - Card body content
- `CardFooter` - Card footer section

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

- `Form` - Form provider wrapper
- `FormField` - Individual form field
- `FormItem` - Form field container
- `FormLabel` - Form field label
- `FormControl` - Form control wrapper
- `FormDescription` - Field description
- `FormMessage` - Error/validation message

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

- `text` - Default text input
- `email` - Email input with validation
- `password` - Password input (masked)
- `tel` - Telephone number input
- `number` - Numeric input

### DotBackground Component

**Location**: `components/ui/dot-background.tsx`

**Purpose**: Interactive animated background with dot pattern that responds to mouse movement.

**Usage**:

```typescript
import { DotBackground } from "@/components/ui/dot-background";

<DotBackground>
	<YourContent />
</DotBackground>;
```

**Features**:

- **Mouse Tracking**: Dot pattern highlights follow mouse movement
- **Dark Mode Support**: Automatic color adaptation for dark/light themes
- **Smooth Animations**: Uses Framer Motion for fluid interactions
- **Radial Gradient Mask**: Creates spotlight effect around mouse cursor
- **Responsive Design**: Adapts to different screen sizes

**Implementation Details**:

- Uses `useMotionValue` for smooth mouse tracking
- Applies CSS mask for circular highlight effect
- Base dot pattern with interactive overlay
- Automatic theme-aware color switching

## Application Components

### App Sidebar (`components/app-sidebar.tsx`)

**Purpose**: Main application navigation sidebar with collapsible functionality.

**Features**:

- Collapsible sidebar with icon-only mode
- Dynamic navigation items
- User profile section with random avatar assignment
- Society branding header

**Usage**:

```typescript
import { AppSidebar } from '@/components/app-sidebar'

<AppSidebar />
```

**Navigation Items**:

- Dashboard - Overview and analytics
- Payments - Member payment management
- Expenses - Community expense tracking
- Society Members - Member directory

### Data Table (`components/data-table.tsx`)

**Purpose**: Advanced data table with drag-and-drop reordering, filtering, and export capabilities.

**Features**:

- **Drag & Drop**: Reorder rows using @dnd-kit
- **Column Management**: Show/hide columns dynamically
- **Pagination**: Configurable page sizes
- **Row Selection**: Multi-select with bulk actions
- **Responsive Design**: Mobile-friendly with drawer details
- **Export Options**: CSV and PDF export functionality
- **Interactive Charts**: Embedded chart visualization in row details

**Usage**:

```typescript
import { DataTable } from '@/components/data-table'

<DataTable data={tableData} />
```

**Props**:

```typescript
interface DataTableProps {
  data: Array<{
    id: number
    header: string
    type: string
    status: string
    target: string
    limit: string
    reviewer: string
  }>
}
```

### Chart Area Interactive (`components/chart-area-interactive.tsx`)

**Purpose**: Interactive area chart for displaying financial data trends.

**Features**:

- Responsive chart design
- Multiple data series support
- Interactive tooltips
- Time-based data visualization
- Theme-aware colors

**Usage**:

```typescript
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

<ChartAreaInteractive />
```

### Section Cards (`components/section-cards.tsx`)

**Purpose**: Dashboard summary cards displaying key metrics.

**Features**:

- Financial summary cards
- Trend indicators
- Responsive grid layout
- Icon-based visual hierarchy

**Usage**:

```typescript
import { SectionCards } from '@/components/section-cards'

<SectionCards />
```

### Navigation Components

#### Nav Main (`components/nav-main.tsx`)

**Purpose**: Main navigation menu with icon and text labels.

**Props**:

```typescript
interface NavMainProps {
  items: Array<{
    title: string
    url: string
    icon?: LucideIcon
  }>
}
```

#### Nav User (`components/nav-user.tsx`)

**Purpose**: User profile section in sidebar with avatar and user info.

**Props**:

```typescript
interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}
```

## Feature-Specific Components

### Payment Components

#### Payments Page (`app/(sidebar)/payments/page.tsx`)

**Purpose**: Main payments page displaying maintenance payments with overview cards and data management.

**Features**:

- **Financial Overview**: Summary cards showing total maintenance, monthly expenses, and monthly received
- **Data Fetching**: Server-side data fetching with Drizzle ORM joins
- **Error Handling**: Graceful error handling with fallback sample data
- **Refresh Action**: Server action to refresh payment data
- **Responsive Layout**: Mobile-friendly grid layout with proper spacing
- **Authentication**: Protected route with session verification
- **Export Functionality**: CSV and PDF export capabilities

**Key Metrics**:

- Total Maintenance: Sum of all payment amounts
- Monthly Expenses: Current month payments with percentage change from last month
- Monthly Received: Current month maintenance received

**Layout Structure**:

```typescript
<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
  <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
    <div className="flex flex-col gap-6">
      {/* Header with actions */}
      {/* Balance overview cards */}
      {/* Payments data table */}
    </div>
  </div>
</div>
```

#### Payments Loading Component (`app/(sidebar)/payments/loading.tsx`)

**Purpose**: Loading skeleton for the payments page that matches the exact layout structure.

**Features**:

- **Layout Consistency**: Mirrors the exact structure of the main payments page
- **Responsive Design**: Matches mobile and desktop layouts with proper spacing
- **Comprehensive Skeletons**: Includes skeletons for all page sections:
  - Header with title, description, and action buttons
  - Three balance overview cards with icons and metrics
  - Data table with search input, table headers, rows, and pagination
- **Proper Spacing**: Uses the same gap and padding classes as the main page
- **Skeleton Variety**: Different skeleton sizes for various content types

**Layout Structure**:

```typescript
<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
  <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Balance Overview Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton with search, headers, rows, and pagination */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center py-4">
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="rounded-md border">
              {/* Table headers and rows */}
            </div>
            <div className="flex items-center justify-between px-2">
              {/* Pagination skeleton */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

**Usage**:

```typescript
// Automatically used by Next.js when loading the payments page
// File: app/(sidebar)/payments/loading.tsx
export default function PaymentsLoading() {
  return (
    // Loading skeleton that matches payments page layout
  )
}
```

#### Add Payment Form (`app/(sidebar)/payments/add-payment-form.tsx`)

**Purpose**: Form for adding new member payments.

**Features**:

- Category selection
- Amount validation
- Date picker integration
- Period and interval selection
- Notes field

**Form Schema**:

```typescript
const addPaymentSchema = z.object({
  userId: z.string(),
  categoryId: z.string(),
  amount: z.string().min(1),
  paymentDate: z.date(),
  periodStart: z.date().optional(),
  periodEnd: z.date().optional(),
  intervalType: z
    .enum(['monthly', 'quarterly', 'half_yearly', 'annually'])
    .optional(),
  notes: z.string().optional(),
})
```

#### Export Dropdown (`app/(sidebar)/payments/export-dropdown.tsx`)

**Purpose**: Export options for payment data.

**Features**:

- CSV export with full data
- PDF export with formatting
- Loading states during export
- Error handling

### Expense Components

#### Add Expense Form (`app/(sidebar)/expenses/add-expense-form.tsx`)

**Purpose**: Form for recording community expenses with popover interface.

**Features**:

- **Category Selection**: Dropdown with available expense categories
- **Amount Input**: Numeric input with step validation (0.01)
- **Date Picker**: Calendar component for expense date selection
- **Notes Field**: Optional text input for additional information
- **Popover Interface**: Clean popover-based form interface
- **Real-time Validation**: Client-side validation with Zod schema
- **Loading States**: Visual feedback during form submission
- **Error Handling**: Display of validation and server errors

**Usage**:

```typescript
import { AddExpenseForm } from '@/app/(sidebar)/expenses/add-expense-form'

<AddExpenseForm
  categories={expenseCategories}
/>
```

**Form Schema**:

```typescript
const addExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category.'),
  amount: z
    .string()
    .min(1, 'Please enter an amount.')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number.',
    }),
  expenseDate: z.string().min(1, 'Please select an expense date.'),
  notes: z.string().optional(),
})
```

#### Expense Data Table (`app/(sidebar)/expenses/data-table.tsx`)

**Purpose**: Advanced data table for expense management with TanStack Table.

**Features**:

- **Sortable Columns**: Click headers to sort by expense date, amount, category
- **Column Filtering**: Filter by category name
- **Column Visibility**: Show/hide columns dynamically
- **Row Selection**: Multi-select with selection count
- **Pagination**: Navigate through large datasets
- **Responsive Design**: Mobile-friendly layout

**Usage**:

```typescript
import { DataTable } from '@/app/(sidebar)/expenses/data-table'
import { columns } from '@/app/(sidebar)/expenses/columns'

<DataTable columns={columns} data={expenses} />
```

#### Expense Columns (`app/(sidebar)/expenses/columns.tsx`)

**Purpose**: Column definitions for expense data table.

**Columns**:

- **Expense Date**: Sortable date with relative time display
- **Amount**: Sortable currency amount in INR (red color for expenses)
- **Category**: Badge display of expense category
- **Notes**: Truncated notes with full text on hover

**Type Definition**:

```typescript
export type Expense = {
  id: string
  amount: number
  created_at: string | null
  notes: string | null
  expense_date: string | null
  category_name: string
}
```

#### Export Dropdown (`app/(sidebar)/expenses/export-dropdown.tsx`)

**Purpose**: Export options for expense data with CSV and PDF generation.

**Features**:

- **CSV Export**: Server-side CSV generation with download
- **PDF Export**: Client-side PDF generation using jsPDF
- **Dynamic Import**: Lazy loading of PDF libraries
- **Error Handling**: Toast notifications for success/failure
- **File Naming**: Automatic filename generation with dates

**Usage**:

```typescript
import { ExportDropdown } from '@/app/(sidebar)/expenses/export-dropdown'

<ExportDropdown
  data={expenses.map(expense => ({
    id: expense.id,
    amount: expense.amount,
    expenseDate: expense.expense_date,
    category: expense.category_name,
    notes: expense.notes,
    createdAt: expense.created_at,
  }))}
/>
```

#### Expenses Page (`app/(sidebar)/expenses/page.tsx`)

**Purpose**: Main expenses page with overview cards and data management.

**Features**:

- **Financial Overview**: Summary cards showing total expenses, monthly spending, and daily averages
- **Data Fetching**: Server-side data fetching with Drizzle ORM
- **Error Handling**: Graceful error handling with fallback data
- **Refresh Action**: Server action to refresh data
- **Responsive Layout**: Mobile-friendly grid layout
- **Authentication**: Protected route with session verification

**Key Metrics**:

- Total Expenses: Sum of all expense amounts
- Monthly Spending: Current month expenses with percentage change
- Daily Average: Average daily expense for current month

**Usage**:

```typescript
// Server component with data fetching
export default async function ExpensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch expenses and categories
  const expensesData = await db
    .select({...})
    .from(expenses)
    .leftJoin(expenseCategories, ...)
    .orderBy(desc(expenses.expenseDate))

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Overview cards */}
      {/* Data table */}
    </div>
  )
}
```

## Authentication Components

### Login Page Component

**Location**: `app/(auth)/login/page.tsx`

**Features**:

- Email/password authentication form
- Real-time validation with Zod
- Loading states and error handling
- Responsive design

**Key Props**:

```typescript
// Form state
const form = useForm<z.infer<typeof signInSchema>>({
  resolver: zodResolver(signInSchema),
  defaultValues: {
    email: '',
    password: '',
  },
})

// Loading state
const [isPending, startTransition] = useTransition()

// Error state
const [actionResult, setActionResult] = useState<{
  success: boolean
  message: string
  errors?: Record<string, string[]>
} | null>(null)
```

### Signup Page Component

**Location**: `app/(auth)/signup/page.tsx`

**Features**:

- Extended registration form
- Community-specific field validation
- Password confirmation
- House number format validation

**Form Fields**:

- Full Name (text)
- House Number (validated format)
- Email (email validation)
- Phone (10-digit validation)
- Password (minimum 6 characters)
- Confirm Password (must match)

## Component Patterns

### Loading State Pattern

All pages with complex layouts should have corresponding loading components that match the exact structure:

```typescript
// File: app/(sidebar)/[feature]/loading.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeatureLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header skeleton - matches page header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-80" />
            </div>
            <div className="flex gap-2">
              {/* Action button skeletons */}
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* Overview cards skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-24" />
                  <Skeleton className="h-3 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data table skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search input skeleton */}
                <div className="flex items-center py-4">
                  <Skeleton className="h-10 w-64" />
                </div>

                {/* Table skeleton */}
                <div className="rounded-md border">
                  {/* Table header */}
                  <div className="flex border-b bg-muted/50 p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>

                  {/* Table rows */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex border-b p-4 last:border-0">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <div key={j} className="flex-1">
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Pagination skeleton */}
                <div className="flex items-center justify-between px-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex w-24 items-center justify-center">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**Loading Component Best Practices**:

1. **Layout Consistency**: Loading skeletons should match the exact layout structure of the actual page
2. **Responsive Design**: Use the same responsive classes and breakpoints
3. **Proper Spacing**: Match gap, padding, and margin classes exactly
4. **Skeleton Variety**: Use different skeleton sizes for different content types:
   - `h-8 w-64` for page titles
   - `h-4 w-80` for descriptions
   - `h-9 w-20` for buttons
   - `h-4 w-4` for icons
   - `h-8 w-24` for large numbers/amounts
   - `h-3 w-36` for small text/percentages
5. **Card Structure**: Include proper Card, CardHeader, and CardContent components
6. **Table Skeletons**: Show realistic table structure with headers and multiple rows
7. **Pagination Skeletons**: Include pagination controls that match the data table

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
'flex min-h-screen items-center justify-center'
'w-full max-w-md'
'space-y-6'

// Colors
'bg-gray-50' // Light background
'text-gray-900' // Dark text
'text-gray-600' // Muted text
'text-red-600' // Error text
'bg-red-50' // Error background
'border-red-200' // Error border

// Interactive states
'hover:text-blue-500'
'focus:ring-2 focus:ring-blue-500'
'disabled:opacity-50'
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

- **Labels**: All inputs have associated labels
- **Error Messages**: Linked to form fields via aria-describedby
- **Focus Management**: Logical tab order
- **Screen Reader Support**: Proper ARIA attributes

### Button Accessibility

- **Disabled State**: Proper disabled attribute and styling
- **Loading State**: Clear indication of loading status
- **Keyboard Navigation**: Full keyboard support

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
})

// Use useCallback for event handlers
const handleSubmit = useCallback(
  data => {
    // Handle submit
  },
  [dependency]
)
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

- Test form validation
- Test submission handling
- Test error states
- Test loading states
- Test accessibility features

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
