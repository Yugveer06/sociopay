# Payment System API Documentation

## Overview

The payment system manages community member payments including maintenance fees, special assessments, and other community-related payments. It provides comprehensive tracking, categorization, and reporting capabilities.

## Database Schema

### Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id),
  category_id INTEGER NOT NULL REFERENCES payment_categories(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  interval_type interval_type,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Categories Table

```sql
CREATE TABLE payment_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);
```

### Interval Type Enum

```sql
CREATE TYPE interval_type AS ENUM (
  'monthly',
  'quarterly',
  'half_yearly',
  'annually'
);
```

## Server Actions

### Add Payment

**Function**: `addPayment(data: AddPaymentData)`  
**Location**: `app/(sidebar)/payments/actions.ts`

Creates a new payment record for a community member.

#### Parameters

```typescript
interface AddPaymentData {
  userId: string // User ID from authenticated session
  categoryId: string // Payment category ID (converted to integer)
  amount: string // Payment amount as string (e.g., "1500.00")
  paymentDate: Date // Date when payment was made
  periodStart?: Date // Start date of payment period (optional)
  periodEnd?: Date // End date of payment period (optional)
  intervalType?: IntervalType // Payment frequency (optional)
  notes?: string // Additional notes (optional)
}

type IntervalType = 'monthly' | 'quarterly' | 'half_yearly' | 'annually'
```

#### Validation Schema

```typescript
const addPaymentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  paymentDate: z.date(),
  periodStart: z.date().optional(),
  periodEnd: z.date().optional(),
  intervalType: z
    .enum(['monthly', 'quarterly', 'half_yearly', 'annually'])
    .optional(),
  notes: z.string().optional(),
})
```

#### Response

```typescript
interface ActionState {
  success: boolean
  message: string
  data?: {
    payment: Payment
  }
  errors?: Record<string, string[]>
}
```

#### Example Usage

```typescript
import { addPayment } from '@/app/(sidebar)/payments/actions'

const handleAddPayment = async (formData: FormData) => {
  const result = await addPayment({
    userId: session.user.id,
    categoryId: formData.get('categoryId') as string,
    amount: formData.get('amount') as string,
    paymentDate: new Date(formData.get('paymentDate') as string),
    intervalType: 'monthly',
    notes: formData.get('notes') as string,
  })

  if (result.success) {
    toast.success('Payment added successfully!')
    // Handle success (redirect, refresh data, etc.)
  } else {
    toast.error(result.message)
    // Handle errors
  }
}
```

#### Error Handling

The action performs comprehensive validation and error handling:

- **Authentication Check**: Verifies user is logged in
- **Data Validation**: Validates all input fields using Zod schema
- **Type Conversion**: Safely converts string inputs to appropriate types
- **Database Constraints**: Handles foreign key and unique constraint violations
- **User-Friendly Messages**: Returns clear error messages for different failure scenarios

Common error scenarios:

- Invalid category ID
- Invalid amount (non-numeric or negative)
- Missing required fields
- Database connection issues
- Foreign key constraint violations

### Export Payments to CSV

**Function**: `exportPaymentsToCSV()`  
**Location**: `app/(sidebar)/payments/actions.ts`

Exports all payment records to CSV format with complete user and category information.

#### Response

```typescript
interface ExportResult {
  success: boolean
  message?: string
  data?: string // CSV content as string
  filename?: string // Suggested filename
}
```

#### CSV Format

The exported CSV includes the following columns:

| Column        | Description                                  |
| ------------- | -------------------------------------------- |
| ID            | Payment unique identifier                    |
| Amount (INR)  | Payment amount in Indian Rupees              |
| Payment Date  | Date when payment was made                   |
| User Name     | Full name of the paying member               |
| House Number  | Member's house number (A-1, B-9, etc.)       |
| Category      | Payment category name                        |
| Interval Type | Payment frequency (monthly, quarterly, etc.) |
| Period Start  | Start date of payment period                 |
| Period End    | End date of payment period                   |
| Notes         | Additional payment notes                     |
| Created At    | Timestamp when record was created            |

#### Example Usage

```typescript
import { exportPaymentsToCSV } from '@/app/(sidebar)/payments/actions'

const handleExportCSV = async () => {
  const result = await exportPaymentsToCSV()

  if (result.success && result.data) {
    // Create and download CSV file
    const blob = new Blob([result.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename || 'payments.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  } else {
    toast.error(result.message || 'Export failed')
  }
}
```

### Export Payments to PDF

**Function**: `exportPaymentsToPDF()`  
**Location**: `app/(sidebar)/payments/actions.ts`

Exports payment data in a format suitable for PDF generation. The actual PDF creation is handled client-side using jsPDF.

#### Response

```typescript
interface ExportResult {
  success: boolean
  message?: string
  data?: PaymentExportData[]
  filename?: string
}

interface PaymentExportData {
  id: string
  amount: number
  paymentDate: string | null
  userName: string
  houseNumber: string
  category: string
  intervalType: string
  periodStart: string
  periodEnd: string
  notes: string
  createdAt: string
}
```

#### Example Usage

```typescript
import { exportPaymentsToPDF } from '@/app/(sidebar)/payments/actions'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const handleExportPDF = async () => {
  const result = await exportPaymentsToPDF()

  if (result.success && result.data) {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text('Payment Records', 20, 20)

    // Add table
    doc.autoTable({
      head: [['Date', 'Member', 'House', 'Category', 'Amount', 'Notes']],
      body: result.data.map(payment => [
        payment.paymentDate || '',
        payment.userName,
        payment.houseNumber,
        payment.category,
        `₹${payment.amount.toFixed(2)}`,
        payment.notes || '',
      ]),
      startY: 30,
    })

    // Save PDF
    doc.save(result.filename || 'payments.pdf')
  } else {
    toast.error(result.message || 'Export failed')
  }
}
```

## Data Queries

### Get User Payments

```typescript
import { db } from '@/lib/db'
import { payments, user, paymentCategories } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

const getUserPayments = async (userId: string) => {
  return await db
    .select({
      id: payments.id,
      amount: payments.amount,
      paymentDate: payments.paymentDate,
      periodStart: payments.periodStart,
      periodEnd: payments.periodEnd,
      intervalType: payments.intervalType,
      notes: payments.notes,
      createdAt: payments.createdAt,
      category: {
        id: paymentCategories.id,
        name: paymentCategories.name,
        description: paymentCategories.description,
      },
    })
    .from(payments)
    .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.paymentDate))
}
```

### Get Payment Summary by Category

```typescript
import { sum, count } from 'drizzle-orm'

const getPaymentSummaryByCategory = async () => {
  return await db
    .select({
      categoryName: paymentCategories.name,
      totalAmount: sum(payments.amount),
      paymentCount: count(payments.id),
    })
    .from(payments)
    .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
    .groupBy(paymentCategories.name)
}
```

### Get Recent Payments

```typescript
const getRecentPayments = async (limit: number = 10) => {
  return await db
    .select({
      id: payments.id,
      amount: payments.amount,
      paymentDate: payments.paymentDate,
      notes: payments.notes,
      userName: user.name,
      houseNumber: user.houseNumber,
      categoryName: paymentCategories.name,
    })
    .from(payments)
    .leftJoin(user, eq(payments.userId, user.id))
    .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
}
```

## Form Components

### Add Payment Form

**Location**: `app/(sidebar)/payments/add-payment-form.tsx`

React component for adding new payments with form validation and user feedback.

#### Features

- **Category Selection**: Dropdown with available payment categories
- **Amount Input**: Numeric input with validation
- **Date Picker**: Date selection for payment date and periods
- **Interval Selection**: Optional payment frequency selection
- **Notes Field**: Optional text area for additional information
- **Real-time Validation**: Client-side validation with Zod schema
- **Loading States**: Visual feedback during form submission
- **Error Handling**: Display of validation and server errors

#### Usage

```typescript
import { AddPaymentForm } from '@/app/(sidebar)/payments/add-payment-form'

<AddPaymentForm
  categories={paymentCategories}
  onSuccess={() => {
    // Handle successful payment addition
    router.refresh()
  }}
/>
```

## Data Table Component

### Payment Data Table

**Location**: `app/(sidebar)/payments/data-table.tsx`

Advanced data table component for displaying and managing payment records.

#### Features

- **Sortable Columns**: Click column headers to sort data
- **Filtering**: Search and filter payments by various criteria
- **Pagination**: Navigate through large datasets
- **Row Selection**: Select multiple payments for bulk operations
- **Export Options**: CSV and PDF export buttons
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Skeleton loading during data fetch

#### Columns

| Column       | Description                  | Sortable | Filterable |
| ------------ | ---------------------------- | -------- | ---------- |
| Payment Date | Date of payment              | ✓        | ✓          |
| Member       | User name and house number   | ✓        | ✓          |
| Category     | Payment category             | ✓        | ✓          |
| Amount       | Payment amount in INR        | ✓        | ✓          |
| Interval     | Payment frequency            | ✓        | ✓          |
| Period       | Payment period (start - end) | ✓        | -          |
| Notes        | Additional notes             | -        | ✓          |
| Actions      | Edit/Delete options          | -        | -          |

#### Usage

```typescript
import { PaymentDataTable } from '@/app/(sidebar)/payments/data-table'

<PaymentDataTable
  data={payments}
  categories={categories}
  onPaymentUpdate={() => {
    // Refresh data after updates
  }}
/>
```

## Security Considerations

### Authentication

All payment operations require user authentication:

```typescript
const session = await auth.api.getSession({
  headers: await headers(),
})

if (!session) {
  return {
    success: false,
    message: 'You must be logged in to perform this action',
  }
}
```

### Authorization

- Users can only view their own payments (unless admin)
- Payment creation requires valid user session
- Export functions require authentication
- Category management restricted to admin users

### Data Validation

- All inputs validated using Zod schemas
- SQL injection prevention through parameterized queries
- Type safety enforced throughout the application
- Amount validation prevents negative or invalid values

### Audit Trail

- All payments include creation timestamps
- User associations tracked for accountability
- Payment modifications logged (if implemented)
- Export activities can be logged for compliance

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (user_id, payment_date, category_id)
- Efficient joins using Drizzle ORM
- Pagination for large datasets
- Connection pooling for database connections

### Query Optimization

```typescript
// Efficient payment queries with proper joins
const optimizedPaymentQuery = db
  .select({
    // Select only needed columns
    id: payments.id,
    amount: payments.amount,
    paymentDate: payments.paymentDate,
    categoryName: paymentCategories.name,
    userName: user.name,
  })
  .from(payments)
  .leftJoin(paymentCategories, eq(payments.categoryId, paymentCategories.id))
  .leftJoin(user, eq(payments.userId, user.id))
  .where(eq(payments.userId, userId))
  .orderBy(desc(payments.paymentDate))
  .limit(50) // Limit results for performance
```

### Client-Side Optimization

- React.memo for expensive components
- useCallback for event handlers
- Debounced search inputs
- Virtual scrolling for large datasets (if needed)
- Lazy loading of export functionality

## Error Handling

### Server-Side Errors

```typescript
try {
  const result = await db.insert(payments).values(data).returning()
  return { success: true, data: result[0] }
} catch (error) {
  console.error('Payment creation failed:', error)

  if (error.code === '23503') {
    return { success: false, message: 'Invalid category selected' }
  }

  if (error.code === '23505') {
    return { success: false, message: 'Duplicate payment detected' }
  }

  return { success: false, message: 'Failed to create payment' }
}
```

### Client-Side Error Handling

```typescript
const handleSubmit = async (data: AddPaymentData) => {
  try {
    const result = await addPayment(data)

    if (result.success) {
      toast.success('Payment added successfully!')
      form.reset()
    } else {
      toast.error(result.message)

      // Handle field-specific errors
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof AddPaymentData, {
            message: messages[0],
          })
        })
      }
    }
  } catch (error) {
    toast.error('An unexpected error occurred')
    console.error('Payment submission error:', error)
  }
}
```

## Best Practices

### Data Entry

1. **Validate Early**: Validate data on both client and server
2. **Clear Feedback**: Provide immediate feedback for user actions
3. **Default Values**: Use sensible defaults (current date, etc.)
4. **Auto-complete**: Suggest values where appropriate
5. **Confirmation**: Confirm destructive actions

### Data Display

1. **Pagination**: Always paginate large datasets
2. **Sorting**: Allow sorting by relevant columns
3. **Filtering**: Provide useful filter options
4. **Export**: Enable data export for reporting
5. **Responsive**: Ensure mobile-friendly display

### Performance

1. **Lazy Loading**: Load data as needed
2. **Caching**: Cache frequently accessed data
3. **Debouncing**: Debounce search and filter inputs
4. **Optimization**: Optimize database queries
5. **Monitoring**: Monitor performance metrics

### Security

1. **Authentication**: Always verify user authentication
2. **Authorization**: Check user permissions
3. **Validation**: Validate all inputs thoroughly
4. **Sanitization**: Sanitize data before storage
5. **Audit**: Log important actions for audit trails
