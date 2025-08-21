import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { kycDocuments, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { FileText, Users } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { columns } from './columns'
import { DataTable } from './data-table'
import { UploadKycForm } from './upload-kyc-form'
import { KycDocument } from '@/lib/zod'

export default async function RenterKycPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch KYC documents with user data using Drizzle
  let kycDocumentsData: KycDocument[] = []
  let users: Array<{ id: string; name: string; houseNumber: string }> = []
  let error: string | null = null

  try {
    // Fetch KYC documents with user data
    const result = await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        fileName: kycDocuments.fileName,
        downloadUrl: kycDocuments.downloadUrl,
        uploadedAt: kycDocuments.uploadedAt,
        uploadedBy: kycDocuments.uploadedBy,
        fileSize: kycDocuments.fileSize,
        contentType: kycDocuments.contentType,
        user_name: user.name,
        house_number: user.houseNumber,
      })
      .from(kycDocuments)
      .leftJoin(user, eq(kycDocuments.userId, user.id))
      .orderBy(kycDocuments.uploadedAt)

    // Get all unique uploaded by user IDs
    const uploadedByUserIds = [...new Set(result.map(doc => doc.uploadedBy))]

    // Fetch uploaded by user names
    let uploadedByUsers: Array<{ id: string; name: string }> = []
    if (uploadedByUserIds.length > 0) {
      uploadedByUsers = await db
        .select({
          id: user.id,
          name: user.name,
        })
        .from(user)
    }

    // Create a map of user IDs to names for uploaded by users
    const uploadedByUserMap = new Map(uploadedByUsers.map(u => [u.id, u.name]))

    // Fetch all users for the form
    const usersResult = await db
      .select({
        id: user.id,
        name: user.name,
        houseNumber: user.houseNumber,
      })
      .from(user)

    users = usersResult

    // Transform the data to match our KycDocument type
    kycDocumentsData = result.map(doc => ({
      id: doc.id!,
      userId: doc.userId,
      fileName: doc.fileName,
      downloadUrl: doc.downloadUrl,
      uploadedAt: doc.uploadedAt.toISOString(),
      uploadedBy: doc.uploadedBy,
      fileSize: doc.fileSize,
      contentType: doc.contentType,
      user_name: doc.user_name || 'Unknown',
      house_number: doc.house_number || 'Unknown',
      uploaded_by_name: uploadedByUserMap.get(doc.uploadedBy) || 'Unknown',
    }))
  } catch (err) {
    console.error('Error fetching KYC documents:', err)
    error = 'Failed to load KYC documents'
  }

  // Calculate stats
  const totalDocuments = kycDocumentsData.length
  const uniqueUsers = new Set(kycDocumentsData.map(doc => doc.userId)).size

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">
            Error Loading KYC Documents
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Renter KYC</h1>
              <p className="text-muted-foreground">
                Manage KYC documents for all renters in the society.
              </p>
            </div>
            <div className="flex gap-2">
              <UploadKycForm users={users} />
            </div>
          </div>

          {/* KYC Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-muted-foreground text-xs">
                  KYC documents uploaded
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Users with KYC
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueUsers}</div>
                <p className="text-muted-foreground text-xs">
                  Out of {users.length} total users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KYC Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Documents ({kycDocumentsData.length})</CardTitle>
              <CardDescription>
                View and manage all uploaded KYC documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={kycDocumentsData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
