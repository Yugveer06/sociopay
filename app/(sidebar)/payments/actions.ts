'use server'

import { db } from '@/db/drizzle'
import { payments } from '@/db/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import { addPaymentSchema, AddPaymentData } from '@/lib/zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { checkServerPermission } from '@/lib/server-permissions'

async function addPaymentAction(data: AddPaymentData): Promise<ActionState> {
  try {
    console.log('Server action received data:', data)

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to add payments',
      }
    }

    // Transform the form data to the correct types for database insertion
    const transformedData = {
      userId: data.userId,
      categoryId: parseInt(data.categoryId, 10),
      amount: parseFloat(data.amount),
      paymentDate: data.paymentDate,
      paymentType: data.paymentType,
      periodStart: data.periodStart || null,
      periodEnd: data.periodEnd || null,
      intervalType: data.intervalType || null,
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

    if (isNaN(transformedData.amount) || transformedData.amount <= 0) {
      return {
        success: false,
        message: 'Invalid amount entered',
      }
    }

    // Insert the payment into the database
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId: transformedData.userId,
        categoryId: transformedData.categoryId,
        amount: transformedData.amount.toString(),
        paymentDate: transformedData.paymentDate,
        paymentType: transformedData.paymentType,
        periodStart: transformedData.periodStart,
        periodEnd: transformedData.periodEnd,
        intervalType: transformedData.intervalType,
        notes: transformedData.notes,
      })
      .returning()

    // Revalidate the payments page to show the new payment
    revalidatePath('/payments')

    return {
      success: true,
      message: 'Payment added successfully',
      data: { payment: newPayment },
    }
  } catch (error) {
    console.error('Add payment error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add payment',
    }
  }
}

// Export the validated action using the form schema
export const addPayment = validatedAction(addPaymentSchema, addPaymentAction)

export async function exportPaymentsToCSV() {
  'use server'

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('You must be logged in to export payments')
    }

    // Fetch all payments with related data
    const { db } = await import('@/db/drizzle')
    const { payments, user, paymentCategories } = await import('@/db/schema')
    const { eq, desc } = await import('drizzle-orm')

    const result = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        created_at: payments.createdAt,
        interval_type: payments.intervalType,
        payment_type: payments.paymentType,
        notes: payments.notes,
        payment_date: payments.paymentDate,
        period_start: payments.periodStart,
        period_end: payments.periodEnd,
        user_id: payments.userId,
        user_name: user.name,
        house_number: user.houseNumber,
        category_name: paymentCategories.name,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .leftJoin(
        paymentCategories,
        eq(payments.categoryId, paymentCategories.id)
      )
      .orderBy(desc(payments.paymentDate))

    // Transform data for CSV
    const csvData = result.map(payment => ({
      ID: payment.id,
      Amount: payment.amount,
      'Payment Date': payment.payment_date,
      'User Name': payment.user_name || 'Unknown',
      'House Number': payment.house_number || 'Unknown',
      Category: payment.category_name || 'Uncategorized',
      'Payment Type': payment.payment_type || 'Unknown',
      'Interval Type': payment.interval_type || '',
      'Period Start': payment.period_start || '',
      'Period End': payment.period_end || '',
      Notes: payment.notes || '',
      'Created At': payment.created_at?.toISOString() || '',
    }))

    // Generate CSV content manually since csv-writer doesn't have a method to get content without writing to file
    const header = [
      'ID',
      'Amount (INR)',
      'Payment Date',
      'User Name',
      'House Number',
      'Category',
      'Payment Type',
      'Interval Type',
      'Period Start',
      'Period End',
      'Notes',
      'Created At',
    ]
    const csvContent = [
      header.join(','),
      ...csvData.map(row =>
        [
          row.ID,
          row.Amount,
          row['Payment Date'],
          `"${row['User Name']}"`,
          `"${row['House Number']}"`,
          `"${row.Category}"`,
          `"${row['Payment Type']}"`,
          row['Interval Type'],
          row['Period Start'],
          row['Period End'],
          `"${row.Notes}"`,
          row['Created At'],
        ].join(',')
      ),
    ].join('\n')

    return {
      success: true,
      data: csvContent,
      filename: `maintenance-payments-${new Date().toISOString().split('T')[0]}.csv`,
    }
  } catch (error) {
    console.error('Export CSV error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export CSV',
    }
  }
}

export async function exportPaymentsToPDF() {
  'use server'

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('You must be logged in to export payments')
    }

    // Note: PDF generation on server side with jsPDF is complex
    // We'll return the data and let the client handle PDF generation
    const { db } = await import('@/db/drizzle')
    const { payments, user, paymentCategories } = await import('@/db/schema')
    const { eq, desc } = await import('drizzle-orm')

    const result = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        created_at: payments.createdAt,
        interval_type: payments.intervalType,
        payment_type: payments.paymentType,
        notes: payments.notes,
        payment_date: payments.paymentDate,
        period_start: payments.periodStart,
        period_end: payments.periodEnd,
        user_id: payments.userId,
        user_name: user.name,
        house_number: user.houseNumber,
        category_name: paymentCategories.name,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .leftJoin(
        paymentCategories,
        eq(payments.categoryId, paymentCategories.id)
      )
      .orderBy(desc(payments.paymentDate))

    // Transform data for PDF
    const pdfData = result.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount || '0'),
      paymentDate: payment.payment_date,
      userName: payment.user_name || 'Unknown',
      houseNumber: payment.house_number || 'Unknown',
      category: payment.category_name || 'Uncategorized',
      paymentType: payment.payment_type || 'Unknown',
      intervalType: payment.interval_type || '',
      periodStart: payment.period_start || '',
      periodEnd: payment.period_end || '',
      notes: payment.notes || '',
      createdAt: payment.created_at?.toISOString() || '',
    }))

    return {
      success: true,
      data: pdfData,
      filename: `maintenance-payments-${new Date().toISOString().split('T')[0]}.pdf`,
    }
  } catch (error) {
    console.error('Export PDF error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export PDF',
    }
  }
}

export async function deletePayment(paymentId: string): Promise<ActionState> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to delete payments',
      }
    }

    // Check if user has permission to delete payments
    const permissionResult = await checkServerPermission({
      payment: ['delete'],
    })

    if (!permissionResult.success) {
      return {
        success: false,
        message: 'You do not have permission to delete payments',
      }
    }

    // Delete the payment from the database
    const deletedPayment = await db
      .delete(payments)
      .where(eq(payments.id, paymentId))
      .returning()

    if (deletedPayment.length === 0) {
      return {
        success: false,
        message: 'Payment not found',
      }
    }

    // Revalidate the payments page to reflect the deletion
    revalidatePath('/payments')

    return {
      success: true,
      message: 'Payment deleted successfully',
    }
  } catch (error) {
    console.error('Delete payment error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to delete payment',
    }
  }
}

export async function generatePaymentReceipt(
  paymentId: string
): Promise<ActionState> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to generate receipts',
      }
    }

    // Fetch the specific payment with related data
    const { user, paymentCategories } = await import('@/db/schema')

    const result = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        created_at: payments.createdAt,
        interval_type: payments.intervalType,
        payment_type: payments.paymentType,
        notes: payments.notes,
        payment_date: payments.paymentDate,
        period_start: payments.periodStart,
        period_end: payments.periodEnd,
        user_id: payments.userId,
        user_name: user.name,
        house_number: user.houseNumber,
        category_name: paymentCategories.name,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .leftJoin(
        paymentCategories,
        eq(payments.categoryId, paymentCategories.id)
      )
      .where(eq(payments.id, paymentId))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        message: 'Payment not found',
      }
    }

    const payment = result[0]

    // Transform data for receipt generation
    const receiptData = {
      id: payment.id,
      amount: parseFloat(payment.amount || '0'),
      paymentDate: payment.payment_date,
      userName: payment.user_name || 'Unknown',
      houseNumber: payment.house_number || 'Unknown',
      category: payment.category_name || 'Uncategorized',
      paymentType: payment.payment_type || 'Unknown',
      intervalType: payment.interval_type || '',
      periodStart: payment.period_start || '',
      periodEnd: payment.period_end || '',
      notes: payment.notes || '',
      createdAt: payment.created_at?.toISOString() || '',
    }

    return {
      success: true,
      data: receiptData,
      message: 'Receipt data generated successfully',
    }
  } catch (error) {
    console.error('Generate receipt error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to generate receipt',
    }
  }
}
