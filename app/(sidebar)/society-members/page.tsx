import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { db } from '@/db/drizzle'
import { IconRefresh, IconUserCheck, IconUsers } from '@tabler/icons-react'
import { desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { columns, SocietyMember } from './columns'
import { DataTable } from './data-table'
import { PageGuard } from '@/components/guards'
import { ExportMembersButton } from './export-button'

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
        houseOwnership: user.houseOwnership,
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
      houseOwnership: member.houseOwnership,
      banned: member.banned,
      banReason: member.banReason,
      banExpires: member.banExpires?.toISOString() || null,
      image: member.image,
      createdAt: member.createdAt.toISOString(),
      emailVerified: member.emailVerified,
    }))
  } catch (err) {
    console.error('Error fetching society members:', err)
    error = err instanceof Error ? err.message : 'Unknown error occurred'
  }

  // Use the fetched members data or fallback to sample data
  const finalMembers: SocietyMember[] =
    membersData.length > 0 ? membersData : []

  // Calculate statistics
  const totalMembers = finalMembers.length
  const activeMembers = finalMembers.filter(member => !member.banned).length
  const bannedMembers = finalMembers.filter(member => member.banned).length
  // House ownership split
  const ownersCount = finalMembers.filter(
    member => member.houseOwnership === 'owner'
  ).length
  const rentersCount = finalMembers.filter(
    member => member.houseOwnership === 'renter'
  ).length

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/society-members')
  }

  return (
    <PageGuard permissions={{ members: ['list'] }}>
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
                <ExportMembersButton />
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Members Overview */}
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <IconUsers className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    House Ownership
                  </CardTitle>
                  <IconUsers className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground text-xs">{`${ownersCount} owners`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{`${rentersCount} renters`}</span>
                      <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
                    </div>
                  </div>
                  {/* Ownership split bar — because even houses like to be categorized */}
                  <div className="mt-2">
                    {/* Split bar */}
                    <div
                      role="progressbar"
                      aria-label="Owners vs Renters split"
                      aria-valuemin={0}
                      aria-valuemax={ownersCount + rentersCount || 100}
                      aria-valuenow={ownersCount}
                      className="bg-muted h-3 w-full overflow-hidden rounded-full"
                    >
                      {/* Give the two segments a little personal space — visually pleasing and drama-free */}
                      <div className="flex h-full gap-1">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            // use flex proportions instead of width so rounding stays perfect
                            flex:
                              ownersCount + rentersCount === 0
                                ? 1
                                : ownersCount / (ownersCount + rentersCount),
                          }}
                        />
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{
                            flex:
                              ownersCount + rentersCount === 0
                                ? 1
                                : rentersCount / (ownersCount + rentersCount),
                          }}
                        />
                      </div>
                    </div>
                  </div>
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
    </PageGuard>
  )
}
