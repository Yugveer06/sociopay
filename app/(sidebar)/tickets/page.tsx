import { ElementGuard } from '@/components/guards'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { tickets, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { checkServerPermission } from '@/lib/server-permissions'
import { desc, eq } from 'drizzle-orm'
import { Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { TicketsDataTable } from './tickets-data-table'
import type { Ticket } from './columns'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function TicketsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  let ticketsData: Ticket[] = []
  let error: string | null = null

  try {
    // Determine whether the current user can list all tickets or only their own
    const canListAll = await checkServerPermission({ tickets: ['list-all'] })
    const canListOwn = await checkServerPermission({ tickets: ['list-own'] })

    type DbTicketRow = {
      id: string
      title: string
      status: string | null
      priority: string | null
      created_at: Date | null
      updated_at: Date | null
      user_id: string | null
      user_name: string | null
    }

    let result: DbTicketRow[] = []

    if (canListAll.success) {
      // Admins / users with list-all see everything
      result = await db
        .select({
          id: tickets.id,
          title: tickets.title,
          status: tickets.status,
          priority: tickets.priority,
          created_at: tickets.createdAt,
          updated_at: tickets.updatedAt,
          user_id: tickets.userId,
          user_name: user.name,
        })
        .from(tickets)
        .leftJoin(user, eq(tickets.userId, user.id))
        .orderBy(desc(tickets.createdAt))
    } else if (canListOwn.success) {
      // Regular users can only see their own tickets
      result = await db
        .select({
          id: tickets.id,
          title: tickets.title,
          status: tickets.status,
          priority: tickets.priority,
          created_at: tickets.createdAt,
          updated_at: tickets.updatedAt,
          user_id: tickets.userId,
          user_name: user.name,
        })
        .from(tickets)
        .leftJoin(user, eq(tickets.userId, user.id))
        .where(eq(tickets.userId, session.user.id as string))
        .orderBy(desc(tickets.createdAt))
    } else {
      // No permission to list tickets
      throw new Error('Permission denied: cannot list tickets')
    }

    ticketsData = result.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status as 'open' | 'in_progress' | 'resolved' | 'closed' | null,
      priority: t.priority as 'low' | 'medium' | 'high' | 'urgent' | null,
      created_at: t.created_at?.toISOString() || null,
      updated_at: t.updated_at?.toISOString() || null,
      user_id: (t.user_id as string) || '',
      user_name: t.user_name || 'Unknown',
    }))
  } catch (err) {
    console.error('Error fetching tickets:', err)
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  async function refreshData() {
    'use server'
    revalidatePath('/tickets')
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Support Tickets</h1>
              <p className="text-muted-foreground">
                Create, assign, and track support tickets.
              </p>
            </div>
            <div className="flex gap-2">
              <form action={refreshData}>
                <Button variant="outline" size="sm" type="submit">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </form>

              <ElementGuard
                permissions={{ tickets: ['add'] }}
                loadingFallback={
                  <Button disabled size="sm">
                    Loading...
                  </Button>
                }
                unauthorizedFallback={<span hidden>No access</span>}
              >
                <Link href="/tickets/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Ticket
                  </Button>
                </Link>
              </ElementGuard>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ticketsData.filter(t => t.status === 'open').length}
                </div>
                <p className="text-muted-foreground text-xs">
                  Currently open tickets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {ticketsData.filter(t => t.priority === 'urgent').length}
                </div>
                <p className="text-muted-foreground text-xs">
                  High priority tickets
                </p>
              </CardContent>
            </Card>
          </div>

          {error && !ticketsData.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Error Loading Tickets</CardTitle>
                <CardDescription>
                  There was an error loading tickets. Check console for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground py-8 text-center">
                  <p>Failed to load tickets</p>
                  <p className="mt-2 text-sm">Error: {error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Tickets ({ticketsData.length})</CardTitle>
                <CardDescription>List of support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <TicketsDataTable tickets={ticketsData} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
