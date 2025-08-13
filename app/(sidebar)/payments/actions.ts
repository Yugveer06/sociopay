'use server'

import { db } from '@/lib/db'
import { payments } from '@/lib/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import { addPaymentSchema, AddPaymentData } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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
