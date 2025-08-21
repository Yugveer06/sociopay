# Renter KYC Documentation

## Overview

The Renter KYC system allows administrators to upload and manage KYC (Know Your Customer) documents for society members. The system stores documents in Supabase storage and maintains metadata in the database.

## Setup Instructions

### 1. Supabase Storage Setup

Before using the KYC upload functionality, you need to create a storage bucket in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Storage > Buckets
3. Create a new bucket named `kyc-documents`
4. Set the bucket as **public** to allow document downloads
5. Configure appropriate access policies (see Security section below)

### 2. Database Schema

The system uses a `kyc_documents` table with the following structure:

```sql
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  download_url TEXT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  uploaded_by TEXT NOT NULL REFERENCES user(id),
  file_size TEXT,
  content_type TEXT NOT NULL DEFAULT 'application/pdf'
);
```

### 3. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Features

### Upload Functionality

- **File Type**: Only PDF files are allowed
- **File Size**: Maximum 10MB per file
- **Drag & Drop**: Support for drag and drop file upload
- **Progress Tracking**: Real-time upload progress indication
- **User Selection**: Choose which renter the document belongs to

### Document Management

- **View Documents**: View uploaded PDF documents in browser
- **Download**: Download documents to local device
- **Search**: Search by document name or renter name
- **Filter**: Filter documents by various criteria
- **Sorting**: Sort documents by upload date, size, etc.

### Statistics Dashboard

- **Total Documents**: Count of all uploaded documents
- **Users with KYC**: Number of users who have KYC documents
- **Today's Uploads**: Documents uploaded today

## Security Considerations

### Storage Bucket Policies

Configure Row Level Security (RLS) policies for the `kyc-documents` bucket:

```sql
-- Allow authenticated users to read documents
CREATE POLICY "Allow authenticated users to read kyc documents" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'kyc-documents');

-- Allow service role to insert documents
CREATE POLICY "Allow service role to insert kyc documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'service_role' AND bucket_id = 'kyc-documents');
```

### Database Policies

The `kyc_documents` table should have appropriate RLS policies:

```sql
-- Enable RLS
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all KYC documents
CREATE POLICY "Allow authenticated users to read kyc documents" ON kyc_documents
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert KYC documents
CREATE POLICY "Allow authenticated users to insert kyc documents" ON kyc_documents
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Usage

### Accessing the KYC Page

1. Navigate to the "Renter KYC" page from the sidebar
2. The page displays statistics and a list of all uploaded documents

### Uploading a Document

1. Click the "Upload KYC Document" button
2. Select the renter from the dropdown
3. Either drag and drop a PDF file or click to browse and select
4. Click "Upload Document" to start the upload process
5. Monitor the progress bar during upload

### Managing Documents

- Use the search bar to find specific documents
- Click the actions menu (⋮) on any document row to:
  - View the document in a new tab
  - Download the document
  - Copy the document ID

## File Structure

```
app/(sidebar)/renter-kyc/
├── page.tsx              # Main KYC page
├── actions.ts             # Server actions for upload
├── columns.tsx            # Table column definitions
├── data-table.tsx         # Data table component
└── upload-kyc-form.tsx    # Upload form dialog

db/schema/
└── kyc-documents.ts       # Database schema

lib/zod/
└── kyc-documents.ts       # Validation schemas

lib/
└── supabase.ts           # Supabase client configuration
```

## API Endpoints

### Upload KYC Document

**Function**: `uploadKycDocument`
**File**: `app/(sidebar)/renter-kyc/actions.ts`

Handles the complete flow of uploading a file to Supabase storage and saving metadata to the database.

### File Upload to Supabase

**Function**: `uploadFileToSupabase`
**File**: `app/(sidebar)/renter-kyc/actions.ts`

Uploads files directly to Supabase storage bucket and returns the public URL.

## Error Handling

The system includes comprehensive error handling for:

- File validation (type, size)
- Upload failures
- Database insertion errors
- Authentication issues

## Future Enhancements

Potential improvements for the KYC system:

1. **Document Types**: Support for multiple document types (Aadhaar, PAN, etc.)
2. **Document Verification**: Integration with verification services
3. **Bulk Upload**: Upload multiple documents at once
4. **Document Expiry**: Track document expiration dates
5. **Audit Trail**: Log all document access and modifications
6. **Email Notifications**: Notify users when documents are uploaded
7. **Document Templates**: Provide document format guidelines
