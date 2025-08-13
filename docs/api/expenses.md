# Expense System API Documentation

## Overview

The expense system manages community expenses including maintenance costs, utilities, repairs, and other operational expenses. It provides comprehensive tracking, categorization, and reporting capabilities for community financial management.

## Database Schema

### Expenses Table

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INTEGER NOT NULL REFERENCES expense_categories(id),
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Expense Categories Table

```sql
CREATE TABLE expense_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);
```

## Server Actions

### Add Expense

**Function**: `addExpense(data: AddExpenseData)`  
**Location**: `app/(sidebar)/expenses/actions.ts`

Creates a new expense record for the community.

#### Parameters

```typescript
interface AddExpenseData {
  categoryId: string // Expense category ID (converted to integer)
  amount: string // Expense amount as string (e.g., "2500.00")
  expenseDate: string // Date when expense occurred (ISO date string)
  notes?: string // Additional notes (optional)
}
```

#### Validation Schema

```typescript
const addExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  expenseDate: z.string().min(1, 'Expense date is required'),
  notes: z.string().optional(),
})
```

#### Response

```typescript
interface ActionState {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
```

#### Example Usage

```typescript
import { addExpense } from '@/app/(sidebar)/expenses/actions'

const handleAddExpense = async (formData: FormData) => {
  const result = await addExpense({
    categoryId: formData.get('categoryId') as string,
    amount: formData.get('amount') as string,
    expenseDate: formData.get('expenseDate') as string,
    notes: formData.get('notes') as string,
  })

  if (result.success) {
    toast.success('Expense added successfully!')
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

### Export Expenses to CSV

**Function**: `exportExpensesToCSV()`  
**Location**: `app/(sidebar)/expenses/actions.ts`

Exports all expense records to CSV format with complete category information.

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

| Column       | Description                       |
| ------------ | --------------------------------- |
| ID           | Expense unique identifier         |
| Amount       | Expense amount                    |
| Expense Date | Date when expense occurred        |
| Category     | Expense category name             |
| Notes        | Additional expense notes          |
| Created At   | Timestamp when record was created |

#### Example Usage

```typescript
import { exportExpensesToCSV } from '@/app/(sidebar)/expenses/actions'

const handleExportCSV = async () => {
  const result = await exportExpensesToCSV()

  if (result.success && result.data) {
    // Create and download CSV file
    const blob = new Blob([result.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename || 'expenses.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  } else {
    toast.error(result.message || 'Export failed')
  }
}
```

### Export Expenses to PDF

**Function**: `exportExpensesToPDF()`  
**Location**: `app/(sidebar)/expenses/actions.ts`

Exports expense data in a format suitable for PDF generation. The actual PDF creation is handled client-side using jsPDF.

#### Response

```typescript
interface ExportResult {
  success: boolean
  message?: string
  data?: ExpenseExportData[]
  filename?: string
}

interface ExpenseExportData {
  id: string
  amount: number
  expenseDate: string | null
  category: string
  notes: string
  createdAt: string
}
```

#### Example Usage

```typescript
import { exportExpensesToPDF } from '@/app/(sidebar)/expenses/actions'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const handleExportPDF = async () => {
  const result = await exportExpensesToPDF()

  if (result.success && result.data) {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text('Expense Records', 20, 20)

    // Add table
    doc.autoTable({
      head: [['Date', 'Category', 'Amount', 'Notes']],
      body: result.data.map(expense => [
        expense.expenseDate || '',
        expense.category,
        `₹${expense.amount.toFixed(2)}`,
        expense.notes || '',
      ]),
      startY: 30,
    })

    // Save PDF
    doc.save(result.filename || 'expenses.pdf')
  } else {
    toast.error(result.message || 'Export failed')
  }
}
```

## Data Queries

### Get Expenses with Categories

```typescript
import { db } from '@/lib/db'
import { expenses, expenseCategories } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

const getExpensesWithCategories = async () => {
  return await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      expenseDate: expenses.expenseDate,
      notes: expenses.notes,
      createdAt: expenses.createdAt,
      category: {
        id: expenseCategories.id,
        name: expenseCategories.name,
        description: expenseCategories.description,
      },
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .orderBy(desc(expenses.expenseDate))
}
```

### Get Expense Summary by Category

```typescript
import { sum, count } from 'drizzle-orm'

const getExpenseSummaryByCategory = async () => {
  return await db
    .select({
      categoryName: expenseCategories.name,
      totalAmount: sum(expenses.amount),
      expenseCount: count(expenses.id),
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .groupBy(expenseCategories.name)
}
```

### Get Recent Expenses

```typescript
const getRecentExpenses = async (limit: number = 10) => {
  return await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      expenseDate: expenses.expenseDate,
      notes: expenses.notes,
      categoryName: expenseCategories.name,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .orderBy(desc(expenses.createdAt))
    .limit(limit)
}
```

## Form Components

### Add Expense Form

**Location**: `app/(sidebar)/expenses/add-expense-form.tsx`

React component for adding new expenses with form validation and user feedback.

#### Features

- **Category Selection**: Dropdown with available expense categories
- **Amount Input**: Numeric input with validation
- **Date Picker**: Date selection for expense date
- **Notes Field**: Optional text area for additional information
- **Real-time Validation**: Client-side validation with Zod schema
- **Loading States**: Visual feedback during form submission
- **Error Handling**: Display of validation and server errors
- **Popover Interface**: Clean popover-based form interface

#### Usage

```typescript
import { AddExpenseForm } from '@/app/(sidebar)/expenses/add-expense-form'

<AddExpenseForm
  categories={expenseCategories}
  onSuccess={() => {
    // Handle successful expense addition
    router.refresh()
  }}
/>
```

#### Form Schema

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

## Data Table Component

### Expense Data Table

**Location**: `app/(sidebar)/expenses/data-table.tsx`

Advanced data table component for displaying and managing expense records.

#### Features

- **Sortable Columns**: Click column headers to sort data
- **Filtering**: Search and filter expenses by various criteria
- **Pagination**: Navigate through large datasets
- **Row Selection**: Select multiple expenses for bulk operations
- **Export Options**: CSV and PDF export buttons
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Skeleton loading during data fetch

#### Columns

| Column       | Description         | Sortable | Filterable |
| ------------ | ------------------- | -------- | ---------- |
| Expense Date | Date of expense     | ✓        | ✓          |
| Category     | Expense category    | ✓        | ✓          |
| Amount       | Expense amount      | ✓        | ✓          |
| Notes        | Additional notes    | -        | ✓          |
| Actions      | Edit/Delete options | -        | -          |

#### Usage

```typescript
import { ExpenseDataTable } from '@/app/(sidebar)/expenses/data-table'

<ExpenseDataTable
  data={expenses}
  categories={categories}
  onExpenseUpdate={() => {
    // Refresh data after updates
  }}
/>
```

## Security Considerations

### Authentication

All expense operations require user authentication:

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

- All authenticated users can add expenses (community expenses)
- Export functions require authentication
- Category management restricted to admin users (if implemented)
- Expense modifications may require admin privileges

### Data Validation

- All inputs validated using Zod schemas
- SQL injection prevention through parameterized queries
- Type safety enforced throughout the application
- Amount validation prevents negative or invalid values

### Audit Trail

- All expenses include creation timestamps
- Expense modifications logged (if implemented)
- Export activities can be logged for compliance
- Category changes tracked for accountability

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (category_id, expense_date)
- Efficient joins using Drizzle ORM
- Pagination for large datasets
- Connection pooling for database connections

### Query Optimization

```typescript
// Efficient expense queries with proper joins
const optimizedExpenseQuery = db
  .select({
    // Select only needed columns
    id: expenses.id,
    amount: expenses.amount,
    expenseDate: expenses.expenseDate,
    categoryName: expenseCategories.name,
  })
  .from(expenses)
  .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
  .orderBy(desc(expenses.expenseDate))
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
  const result = await db.insert(expenses).values(data).returning()
  return { success: true, data: result[0] }
} catch (error) {
  console.error('Expense creation failed:', error)

  if (error.code === '23503') {
    return { success: false, message: 'Invalid category selected' }
  }

  if (error.code === '23505') {
    return { success: false, message: 'Duplicate expense detected' }
  }

  return { success: false, message: 'Failed to create expense' }
}
```

### Client-Side Error Handling

```typescript
const handleSubmit = async (data: AddExpenseData) => {
  try {
    const result = await addExpense(data)

    if (result.success) {
      toast.success('Expense added successfully!')
      form.reset()
    } else {
      toast.error(result.message)

      // Handle field-specific errors
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof AddExpenseData, {
            message: messages[0],
          })
        })
      }
    }
  } catch (error) {
    toast.error('An unexpected error occurred')
    console.error('Expense submission error:', error)
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
