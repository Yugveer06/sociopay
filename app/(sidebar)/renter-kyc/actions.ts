'use server'

import { db } from '@/db/drizzle'
import { kycDocuments } from '@/db/schema'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import {
  uploadKycDocumentServerSchema,
  UploadKycDocumentServerData,
} from '@/lib/zod'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { checkServerPermission } from '@/lib/server-permissions'

async function uploadKycDocumentAction(
  data: UploadKycDocumentServerData
): Promise<ActionState> {
  try {
    console.log('Server action received data:', data)

    // Check if user is authenticated and has admin permissions
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to upload KYC documents',
      }
    }

    // For now, let's assume all authenticated users can upload (you can add role checking later)
    // TODO: Add proper permission checking here

    // Insert the KYC document record into the database
    const result = await db
      .insert(kycDocuments)
      .values({
        userId: data.userId,
        fileName: data.fileName,
        downloadUrl: data.downloadUrl,
        uploadedBy: session.user.id,
        fileSize: data.fileSize,
        contentType: data.contentType,
      })
      .returning()

    console.log('KYC document inserted:', result[0])

    // Revalidate the KYC page to show the new document
    revalidatePath('/renter-kyc')

    return {
      success: true,
      message: 'KYC document uploaded successfully',
      data: result[0],
    }
  } catch (error) {
    console.error('Error uploading KYC document:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to upload KYC document',
    }
  }
}

// Upload file to Supabase storage
export async function uploadFileToSupabase(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate a unique filename while preserving the original name
    const timestamp = Date.now()
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single

    // Create a path that includes both timestamp and original name for uniqueness
    const fileName = `${userId}/${timestamp}_${sanitizedOriginalName}`

    // Upload file to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from('kyc-documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { success: false, error: error.message }
    }

    console.log('File uploaded successfully:', data)

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('kyc-documents')
      .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    }
  }
}

// Delete KYC document schema
const deleteKycDocumentSchema = z.object({
  id: z.string().min(1, 'Document ID is required'),
})

type DeleteKycDocumentData = z.infer<typeof deleteKycDocumentSchema>

async function deleteKycDocumentAction(
  data: DeleteKycDocumentData
): Promise<ActionState> {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        message: 'You must be logged in to delete KYC documents',
      }
    }

    // Check if user has permission to delete KYC documents
    // Only admins can delete KYC documents - this ensures document integrity! 🛡️
    const hasDeletePermission = await checkServerPermission({
      renterKyc: ['delete-all'],
    })

    if (!hasDeletePermission.success) {
      return {
        success: false,
        message:
          'Only administrators can delete KYC documents. Documents are immutable once uploaded for security reasons.',
      }
    }

    // First, get the document details to extract the file path for deletion
    const document = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.id, data.id))
      .limit(1)

    if (document.length === 0) {
      return {
        success: false,
        message: 'KYC document not found',
      }
    }

    const kycDoc = document[0]

    // Extract file path from download URL for Supabase deletion
    // The URL format is typically: https://[project].supabase.co/storage/v1/object/public/kyc-documents/[path]
    const url = new URL(kycDoc.downloadUrl)
    const pathSegments = url.pathname.split('/')
    const bucketIndex = pathSegments.indexOf('kyc-documents')

    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      const filePath = pathSegments.slice(bucketIndex + 1).join('/')

      // Delete file from Supabase storage (non-blocking, we'll proceed even if this fails)
      try {
        const { error: storageError } = await supabaseAdmin.storage
          .from('kyc-documents')
          .remove([filePath])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continue with database deletion even if storage deletion fails
        }
      } catch (storageError) {
        console.error('Storage deletion failed:', storageError)
        // Continue with database deletion
      }
    }

    // Delete the document record from the database
    const result = await db
      .delete(kycDocuments)
      .where(eq(kycDocuments.id, data.id))
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: 'Failed to delete KYC document from database',
      }
    }

    // Revalidate the KYC page to refresh the list
    revalidatePath('/renter-kyc')

    return {
      success: true,
      message: 'KYC document deleted successfully',
      data: result[0],
    }
  } catch (error) {
    console.error('Error deleting KYC document:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to delete KYC document',
    }
  }
}

export const uploadKycDocument = validatedAction(
  uploadKycDocumentServerSchema,
  uploadKycDocumentAction
)

export const deleteKycDocument = validatedAction(
  deleteKycDocumentSchema,
  deleteKycDocumentAction
)
