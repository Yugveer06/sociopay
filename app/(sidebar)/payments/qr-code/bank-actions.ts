'use server'

import { db } from '@/db/drizzle'
import { bankDetails } from '@/db/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import { insertBankDetailsSchema } from '@/lib/zod/bank-details'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { checkServerPermission } from '@/lib/server-permissions'
import { z } from 'zod'

// Delete Bank Details schema
const deleteBankDetailsSchema = z.object({
  id: z.string().min(1, 'Bank details ID is required'),
})

/**
 * Delete bank details - admin only action
 * Sometimes banks need to close their books! 🏦📚
 */
export const deleteBankDetailsAction = validatedAction(
  deleteBankDetailsSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to delete bank details',
        }
      }

      // Check if user has permission to delete bank details
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'], // Using same permission as QR codes for now
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to delete bank details',
        }
      }

      // Delete the bank details
      const result = await db
        .delete(bankDetails)
        .where(eq(bankDetails.id, data.id))
        .returning()

      if (result.length === 0) {
        return {
          success: false,
          message: 'Bank details not found',
        }
      }

      revalidatePath('/payments/qr-code')
      return {
        success: true,
        message: 'Bank details deleted successfully! 🗑️',
      }
    } catch (error) {
      console.error('Error deleting bank details:', error)
      return {
        success: false,
        message: 'Failed to delete bank details. Please try again.',
      }
    }
  }
)

/**
 * Create new bank details - admin only action
 * Let's add some traditional banking magic! 🏦✨
 */
export const createBankDetailsAction = validatedAction(
  insertBankDetailsSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to create bank details',
        }
      }

      // Check if user has permission to manage bank details (admin only for creation)
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'], // Using same permission as QR codes for now
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to create bank details',
        }
      }

      // Check if there's already an active bank detail entry
      const activeBankDetails = await getActiveBankDetails()
      if (activeBankDetails) {
        // Deactivate the existing one
        await db
          .update(bankDetails)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(bankDetails.id, activeBankDetails.id))
      }

      // Create new bank details
      const result = await db
        .insert(bankDetails)
        .values({
          ...data,
          isActive: true,
        })
        .returning()

      revalidatePath('/payments/qr-code')
      return {
        success: true,
        message: 'Bank details created successfully! 🏦',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating bank details:', error)

      // Handle unique constraint violation if any
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        return {
          success: false,
          message: 'Bank details with this account number already exist.',
        }
      }

      return {
        success: false,
        message: 'Failed to create bank details. Please try again.',
      }
    }
  }
)

/**
 * Update existing bank details - admin only action
 * Modernizing those bank account vibes! 🏦🔄
 */
export const updateBankDetailsAction = validatedAction(
  insertBankDetailsSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to update bank details',
        }
      }

      // Check if user has permission to manage bank details
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'], // Using same permission as QR codes for now
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to update bank details',
        }
      }

      // Get the currently active bank details
      const activeBankDetails = await getActiveBankDetails()

      if (!activeBankDetails) {
        // No existing bank details, create a new one
        return await createBankDetailsAction(data)
      }

      // Update the existing bank details
      const result = await db
        .update(bankDetails)
        .set({
          bankName: data.bankName,
          branchName: data.branchName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          additionalInfo: data.additionalInfo,
          updatedAt: new Date(),
        })
        .where(eq(bankDetails.id, activeBankDetails.id))
        .returning()

      revalidatePath('/payments/qr-code')
      return {
        success: true,
        message: 'Bank details updated successfully! 🔄🏦',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating bank details:', error)

      return {
        success: false,
        message: 'Failed to update bank details. Please try again.',
      }
    }
  }
)

/**
 * Get the active bank details
 * Fetching the traditional payment gateway! 🏦🔍
 */
export async function getActiveBankDetails() {
  try {
    const result = await db
      .select()
      .from(bankDetails)
      .where(eq(bankDetails.isActive, true))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching active bank details:', error)
    return null
  }
}
