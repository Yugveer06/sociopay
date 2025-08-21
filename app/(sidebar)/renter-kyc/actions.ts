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
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

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

    console.log(data)

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

export const uploadKycDocument = validatedAction(
  uploadKycDocumentServerSchema,
  uploadKycDocumentAction
)
