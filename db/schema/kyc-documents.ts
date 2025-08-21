import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  downloadUrl: text('download_url').notNull(),
  uploadedAt: timestamp('uploaded_at')
    .$defaultFn(() => new Date())
    .notNull(),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => user.id), // Admin who uploaded the document
  fileSize: text('file_size'), // Store as text to handle large sizes, or you could use bigint
  contentType: text('content_type').notNull().default('application/pdf'),
})
