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
import { checkServerPermission } from '@/lib/server-permissions'
import { eq } from 'drizzle-orm'
import { FileText, Users } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { columns } from './columns'
import { DataTable } from './data-table'
import { UploadKycForm } from './upload-kyc-form'
import { KycDocument } from '@/lib/zod'
import { ElementGuard } from '@/components/guards'

export default async function RenterKycPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Check permissions to determine what KYC data to fetch
  // Users with 'list-all' can see all documents, users with 'list-own' can only see their own
  const listAllKycPermission = await checkServerPermission({
    renterKyc: ['list-all'],
  })
  const listOwnKycPermission = await checkServerPermission({
    renterKyc: ['list-own'],
  })

  // Check upload permissions for the upload form
  const uploadAllKycPermission = await checkServerPermission({
    renterKyc: ['upload-all'],
  })
  const uploadOwnKycPermission = await checkServerPermission({
    renterKyc: ['upload-own'],
  })

  // If user doesn't have any list permission, redirect them
  if (!listAllKycPermission.success && !listOwnKycPermission.success) {
    redirect('/dashboard') // No access to KYC documents at all
  }

  // Determine if we should filter by current user (only has list-own permission)
  const shouldFilterByUser =
    !listAllKycPermission.success && listOwnKycPermission.success

  // Determine what users should be available for upload form
  const canUploadForOthers = uploadAllKycPermission.success
  const canUploadOwn = uploadOwnKycPermission.success

  // If user can't upload anything, they shouldn't see the upload form
  const showUploadForm = canUploadForOthers || canUploadOwn

  // Fetch KYC documents with user data using Drizzle
  let kycDocumentsData: KycDocument[] = []
  let users: Array<{
    id: string
    name: string
    houseNumber: string
    houseOwnership: string
  }> = []
  let error: string | null = null

  try {
    // Build the KYC documents query with conditional filtering
    const baseKycSelect = {
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
    }

    let result
    if (shouldFilterByUser) {
      // Fetch only current user's KYC documents
      result = await db
        .select(baseKycSelect)
        .from(kycDocuments)
        .leftJoin(user, eq(kycDocuments.userId, user.id))
        .where(eq(kycDocuments.userId, session.user.id))
        .orderBy(kycDocuments.uploadedAt)
    } else {
      // Fetch all KYC documents (user has list-all permission)
      result = await db
        .select(baseKycSelect)
        .from(kycDocuments)
        .leftJoin(user, eq(kycDocuments.userId, user.id))
        .orderBy(kycDocuments.uploadedAt)
    }

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

    // Fetch users for the upload form based on permissions
    if (canUploadForOthers) {
      // Fetch all users for the form (user has upload-all permission)
      const usersResult = await db
        .select({
          id: user.id,
          name: user.name,
          houseNumber: user.houseNumber,
          houseOwnership: user.houseOwnership,
        })
        .from(user)

      users = usersResult
    } else if (canUploadOwn) {
      // Only fetch current user if they have upload-own permission
      const currentUserResult = await db
        .select({
          id: user.id,
          name: user.name,
          houseNumber: user.houseNumber,
          houseOwnership: user.houseOwnership,
        })
        .from(user)
        .where(eq(user.id, session.user.id))

      users = currentUserResult
    } else {
      // User has no upload permissions, empty users array
      users = []
    }

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
                {shouldFilterByUser
                  ? 'Manage your KYC documents.'
                  : 'Manage KYC documents for all renters in the society.'}
              </p>
            </div>
            <div className="flex gap-2">
              {showUploadForm && (
                <ElementGuard
                  anyPermissions={[
                    { renterKyc: ['upload-all'] },
                    { renterKyc: ['upload-own'] },
                  ]}
                  loadingFallback={
                    <div className="bg-muted h-10 w-32 animate-pulse rounded-md" />
                  }
                  unauthorizedFallback={<span hidden>No upload access</span>}
                >
                  <UploadKycForm 
                    users={users} 
                    canUploadForOthers={canUploadForOthers}
                    currentUserId={session.user.id}
                  />
                </ElementGuard>
              )}
            </div>
          </div>

          {/* KYC Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {shouldFilterByUser ? 'My Documents' : 'Total Documents'}
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-muted-foreground text-xs">
                  KYC documents{' '}
                  {shouldFilterByUser ? 'uploaded by you' : 'uploaded'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {shouldFilterByUser ? 'Upload Status' : 'Users with KYC'}
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shouldFilterByUser
                    ? totalDocuments > 0
                      ? 'Complete'
                      : 'Pending'
                    : uniqueUsers}
                </div>
                <p className="text-muted-foreground text-xs">
                  {shouldFilterByUser
                    ? 'Your KYC verification status'
                    : `Out of ${users.length} total users`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KYC Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {shouldFilterByUser ? 'My KYC Documents' : 'KYC Documents'} (
                {kycDocumentsData.length})
              </CardTitle>
              <CardDescription>
                {shouldFilterByUser
                  ? 'View and manage your uploaded KYC documents'
                  : 'View and manage all uploaded KYC documents'}
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
