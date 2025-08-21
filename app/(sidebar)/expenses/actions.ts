'use server'

import { db } from '@/db/drizzle'
import { expenses, expenseCategories } from '@/db/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import {
  addExpenseSchema,
  AddExpenseData,
  deleteExpenseSchema,
  DeleteExpenseData,
} from '@/lib/zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'

async function addExpenseAction(data: AddExpenseData): Promise<ActionState> {
  try {
    console.log('Server action received data:', data)

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to add expenses',
      }
    }

    // Transform the form data to the correct types for database insertion
    const transformedData = {
      categoryId: parseInt(data.categoryId, 10),
      amount: data.amount.toString(), // Keep as string for database
      expenseDate: data.expenseDate,
      notes: data.notes || null,
    }

    console.log('Transformed data:', transformedData)

    // Validate the transformed data
    if (isNaN(transformedData.categoryId) || transformedData.categoryId <= 0) {
      return {
        success: false,
        message: 'Invalid category selected',
      }
    }

    if (
      isNaN(parseFloat(transformedData.amount)) ||
      parseFloat(transformedData.amount) <= 0
    ) {
      return {
        success: false,
        message: 'Invalid amount entered',
      }
    }

    // Insert the expense into the database
    const result = await db.insert(expenses).values(transformedData).returning()

    console.log('Database insert result:', result)

    if (result.length > 0) {
      revalidatePath('/expenses')
      return {
        success: true,
        message: 'Expense added successfully!',
      }
    } else {
      return {
        success: false,
        message: 'Failed to add expense. Please try again.',
      }
    }
  } catch (error) {
    console.error('Error adding expense:', error)

    // Check for common database errors
    if (error instanceof Error) {
      if (error.message.includes('violates foreign key constraint')) {
        return {
          success: false,
          message: 'Invalid category selected. Please refresh and try again.',
        }
      }

      if (error.message.includes('invalid input syntax')) {
        return {
          success: false,
          message: 'Invalid data format. Please check your inputs.',
        }
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

export const addExpense = validatedAction(addExpenseSchema, addExpenseAction)

// Delete expense action
async function deleteExpenseAction(
  data: DeleteExpenseData
): Promise<ActionState> {
  try {
    console.log('Delete expense action received data:', data)

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to delete expenses',
      }
    }

    // Delete the expense from the database
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, data.id))
      .returning()

    console.log('Database delete result:', result)

    if (result.length > 0) {
      revalidatePath('/expenses')
      return {
        success: true,
        message: 'Expense deleted successfully! 🗑️',
      }
    } else {
      return {
        success: false,
        message: 'Expense not found or already deleted.',
      }
    }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return {
      success: false,
      message:
        'An unexpected error occurred while deleting the expense. Please try again.',
    }
  }
}

export const deleteExpense = validatedAction(
  deleteExpenseSchema,
  deleteExpenseAction
)

export async function exportExpensesToCSV(): Promise<
  ActionState & { filename?: string; data?: string }
> {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to export expenses',
      }
    }

    // Fetch expenses with category data
    const result = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        expense_date: expenses.expenseDate,
        notes: expenses.notes,
        created_at: expenses.createdAt,
        category_name: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .orderBy(desc(expenses.expenseDate))

    // Create CSV content
    const csvHeaders = [
      'ID',
      'Amount',
      'Expense Date',
      'Category',
      'Notes',
      'Created At',
    ]

    const csvRows = [
      csvHeaders.join(','),
      ...result.map(expense =>
        [
          expense.id,
          expense.amount,
          expense.expense_date,
          expense.category_name || 'Uncategorized',
          expense.notes || '',
          expense.created_at,
        ]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ]

    const csvContent = csvRows.join('\n')
    const filename = `society-expenses-${new Date().toISOString().split('T')[0]}.csv`

    return {
      success: true,
      message: 'Expenses exported successfully',
      data: csvContent,
      filename,
    }
  } catch (error) {
    console.error('Error exporting expenses to CSV:', error)
    return {
      success: false,
      message: 'Failed to export expenses. Please try again.',
    }
  }
}

export async function exportExpensesToPDF(): Promise<
  ActionState & { filename?: string; data?: unknown }
> {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to export expenses',
      }
    }

    // Fetch expenses with category data
    const result = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        expense_date: expenses.expenseDate,
        notes: expenses.notes,
        created_at: expenses.createdAt,
        category_name: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .orderBy(desc(expenses.expenseDate))

    // Transform data for PDF
    const pdfData = result.map(expense => ({
      id: expense.id,
      amount: parseFloat(expense.amount || '0'),
      expenseDate: expense.expense_date,
      category: expense.category_name || 'Uncategorized',
      notes: expense.notes || '',
      createdAt: expense.created_at || '',
    }))

    return {
      success: true,
      message: 'Expenses exported successfully',
      data: pdfData,
      filename: `society-expenses-${new Date().toISOString().split('T')[0]}.pdf`,
    }
  } catch (error) {
    console.error('Error exporting expenses to PDF:', error)
    return {
      success: false,
      message: 'Failed to export expenses. Please try again.',
    }
  }
}
