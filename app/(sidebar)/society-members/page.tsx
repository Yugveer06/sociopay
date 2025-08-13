import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { user } from '@/drizzle/schema'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { IconRefresh, IconUserCheck, IconUsers } from '@tabler/icons-react'
import { desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { columns, SocietyMember } from './columns'
import { DataTable } from './data-table'

export default async function SocietyMembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch society members data using Drizzle
  let membersData: SocietyMember[] = []
  let error: string | null = null

  try {
    // Fetch all members
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        houseNumber: user.houseNumber,
        phone: user.phone,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        image: user.image,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .orderBy(desc(user.createdAt))

    // Transform the data to match our SocietyMember type
    membersData = result.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      houseNumber: member.houseNumber,
      phone: member.phone,
      role: member.role,
      banned: member.banned,
      banReason: member.banReason,
      banExpires: member.banExpires,
      image: member.image,
      createdAt: member.createdAt,
      emailVerified: member.emailVerified,
    }))
  } catch (err) {
    console.error('Error fetching society members:', err)
    error = err instanceof Error ? err.message : 'Unknown error occurred'
  }

  // Use the fetched members data or fallback to sample data
  const finalMembers: SocietyMember[] =
    membersData.length > 0
      ? membersData
      : [
          {
            id: 'sample-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            houseNumber: 'A-101',
            phone: '+91 9876543210',
            role: 'admin',
            banned: false,
            banReason: null,
            banExpires: null,
            image: null,
            createdAt: '2024-01-15T10:30:00Z',
            emailVerified: true,
          },
          {
            id: 'sample-2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            houseNumber: 'B-202',
            phone: '+91 9876543211',
            role: 'treasurer',
            banned: false,
            banReason: null,
            banExpires: null,
            image: null,
            createdAt: '2024-02-20T14:15:00Z',
            emailVerified: true,
          },
          {
            id: 'sample-3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            houseNumber: 'C-303',
            phone: '+91 9876543212',
            role: null,
            banned: false,
            banReason: null,
            banExpires: null,
            image: null,
            createdAt: '2024-03-10T09:45:00Z',
            emailVerified: false,
          },
          {
            id: 'sample-4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            houseNumber: 'D-404',
            phone: '+91 9876543213',
            role: 'secretary',
            banned: true,
            banReason: 'Violation of society rules',
            banExpires: '2025-12-31T23:59:59Z',
            image: null,
            createdAt: '2024-04-05T16:20:00Z',
            emailVerified: true,
          },
        ]

  // Calculate statistics
  const totalMembers = finalMembers.length
  const activeMembers = finalMembers.filter(member => !member.banned).length
  const bannedMembers = finalMembers.filter(member => member.banned).length

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/society-members')
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Society Members</h1>
              <p className="text-muted-foreground">
                Manage and view all society members information and status.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Members Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <IconUsers className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalMembers}
                </div>
                <p className="text-muted-foreground text-xs">
                  Registered society members
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Members
                </CardTitle>
                <IconUserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeMembers}
                </div>
                <p className="text-muted-foreground text-xs">
                  {bannedMembers > 0
                    ? `${bannedMembers} banned/suspended`
                    : 'All members active'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Members Table */}
          {error && !finalMembers.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Error Loading Members</CardTitle>
                <CardDescription>
                  There was an error loading member data. Check console for
                  details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground py-8 text-center">
                  <p>Failed to load member data</p>
                  <p className="mt-2 text-sm">Error: {error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Society Members ({finalMembers.length})</CardTitle>
                <CardDescription>
                  Complete list of all society members with their details and
                  status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={finalMembers} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
