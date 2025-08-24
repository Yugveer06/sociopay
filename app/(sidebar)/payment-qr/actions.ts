'use server'

import { db } from '@/db/drizzle'
import { qrCodes } from '@/db/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import { insertQrCodeSchema } from '@/db/schema/qr-codes'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { checkServerPermission } from '@/lib/server-permissions'
import { z } from 'zod'

// Delete QR Code schema
const deleteQrCodeSchema = z.object({
  id: z.string().min(1, 'QR Code ID is required'),
})

/**
 * Delete a QR code - admin only action
 * Because sometimes QR codes need to retire 📱💨
 */
export const deleteQrCodeAction = validatedAction(
  deleteQrCodeSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to delete QR codes',
        }
      }

      // Check if user has permission to delete QR codes
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'],
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to delete QR codes',
        }
      }

      // Delete the QR code
      const result = await db
        .delete(qrCodes)
        .where(eq(qrCodes.id, data.id))
        .returning()

      if (result.length === 0) {
        return {
          success: false,
          message: 'QR code not found',
        }
      }

      revalidatePath('/payment-qr')
      return {
        success: true,
        message: 'QR code deleted successfully! 🗑️',
      }
    } catch (error) {
      console.error('Error deleting QR code:', error)
      return {
        success: false,
        message: 'Failed to delete QR code. Please try again.',
      }
    }
  }
)

/**
 * Create a new QR code - admin only action
 * Let's make some digital money magic! 🎩✨
 */
export const createQrCodeAction = validatedAction(
  insertQrCodeSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to create QR codes',
        }
      }

      // Check if user has permission to manage QR codes (admin only for creation)
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'], // Using delete permission as proxy for admin access
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to create QR codes',
        }
      }

      // Check for existing QR code with the same UPI ID
      const existingQrCode = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.upiId, data.upiId))
        .limit(1)

      if (existingQrCode.length > 0) {
        return {
          success: false,
          message:
            'A QR code with this UPI ID already exists. Please use a different UPI ID.',
        }
      }

      // Deactivate any existing QR codes (only one active at a time)
      await db.update(qrCodes).set({ isActive: false })

      // Create the new QR code
      const result = await db
        .insert(qrCodes)
        .values({
          upiId: data.upiId,
          merchantName: data.merchantName,
          isActive: true,
        })
        .returning()

      revalidatePath('/payment-qr')
      return {
        success: true,
        message: 'QR code created successfully! 📱',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating QR code:', error)

      // Handle unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        return {
          success: false,
          message:
            'A QR code with this UPI ID already exists. Please use a different UPI ID.',
        }
      }

      return {
        success: false,
        message: 'Failed to create QR code. Please try again.',
      }
    }
  }
)

/**
 * Update the existing QR code - admin only action
 * Sometimes QR codes need a makeover! ✨🔄
 */
export const updateQrCodeAction = validatedAction(
  insertQrCodeSchema,
  async (data): Promise<ActionState> => {
    try {
      // Check if user is authenticated and has admin permissions
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        return {
          success: false,
          message: 'You must be logged in to update QR codes',
        }
      }

      // Check if user has permission to manage QR codes (admin only)
      const hasPermission = await checkServerPermission({
        qrCode: ['delete'], // Using delete permission as proxy for admin access
      })

      if (!hasPermission.success) {
        return {
          success: false,
          message: 'You do not have permission to update QR codes',
        }
      }

      // Get the currently active QR code
      const activeQrCode = await getActiveQrCode()

      if (!activeQrCode) {
        // No existing QR code, create a new one
        return await createQrCodeAction(data)
      }

      // Check if we're trying to update to a UPI ID that already exists (but not the current one)
      if (activeQrCode.upiId !== data.upiId) {
        const existingQrCode = await db
          .select()
          .from(qrCodes)
          .where(eq(qrCodes.upiId, data.upiId))
          .limit(1)

        if (existingQrCode.length > 0) {
          return {
            success: false,
            message:
              'A QR code with this UPI ID already exists. Please use a different UPI ID.',
          }
        }
      }

      // Update the existing QR code
      const result = await db
        .update(qrCodes)
        .set({
          upiId: data.upiId,
          merchantName: data.merchantName,
          updatedAt: new Date(),
        })
        .where(eq(qrCodes.id, activeQrCode.id))
        .returning()

      revalidatePath('/payment-qr')
      return {
        success: true,
        message: 'QR code updated successfully! 🔄📱',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating QR code:', error)

      // Handle unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        return {
          success: false,
          message:
            'A QR code with this UPI ID already exists. Please use a different UPI ID.',
        }
      }

      return {
        success: false,
        message: 'Failed to update QR code. Please try again.',
      }
    }
  }
)

/**
 * Get the active QR code
 * Fetching the magical square of payment! 🔮
 */
export async function getActiveQrCode() {
  try {
    const result = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.isActive, true))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching active QR code:', error)
    return null
  }
}
