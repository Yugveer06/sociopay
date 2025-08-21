import { z } from 'zod'

// KYC document upload schema for form validation
export const uploadKycDocumentSchema = z.object({
  userId: z.string().min(1, {
    message: 'Please select a user.',
  }),
  file: z
    .instanceof(File, {
      message: 'Please select a file to upload.',
    })
    .refine(
      file => file.size <= 10 * 1024 * 1024, // 10MB limit
      'File size must be less than 10MB.'
    )
    .refine(
      file => file.type === 'application/pdf',
      'Only PDF files are allowed.'
    ),
})

// KYC document upload schema for server action (without File type)
export const uploadKycDocumentServerSchema = z.object({
  userId: z.string().min(1),
  fileName: z.string().min(1),
  downloadUrl: z.string().url(),
  fileSize: z.string(),
  contentType: z.string(),
})

// Type exports
export type UploadKycDocumentData = z.infer<typeof uploadKycDocumentSchema>
export type UploadKycDocumentServerData = z.infer<
  typeof uploadKycDocumentServerSchema
>

// For displaying KYC documents in table
export type KycDocument = {
  id: string
  userId: string
  fileName: string
  downloadUrl: string
  uploadedAt: string
  uploadedBy: string
  fileSize: string | null
  contentType: string
  user_name: string
  house_number: string
  uploaded_by_name: string
}
