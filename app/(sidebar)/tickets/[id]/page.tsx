import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { ticketMessages, tickets, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { checkServerPermission } from '@/lib/server-permissions'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
// removed markdown rendering: no marked/sanitize-html
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { alias } from 'drizzle-orm/pg-core'
import { RefreshCw, TicketCheck, TicketMinus } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import ClaimDialog from './claim-dialog'
import CloseDialog from './close-dialog'
import MessageForm from './message-form'
import ReopenDialog from './reopen-dialog'
import UnclaimDialog from './unclaim-dialog'
import { Separator } from '@/components/ui/separator'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  const { id } = (await params) as { id: string }

  const userCreator = alias(user, 'userCreator')
  const userClaimedBy = alias(user, 'userClaimedBy')

  const ticketResult = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      claimed_by: tickets.claimedBy,
      claimed_by_name: userClaimedBy.name,
      created_at: tickets.createdAt,
      user_id: tickets.userId,
      opened_by: userCreator.name,
    })
    .from(tickets)
    .leftJoin(userCreator, eq(tickets.userId, userCreator.id))
    .leftJoin(userClaimedBy, eq(tickets.claimedBy, userClaimedBy.id))
    .where(eq(tickets.id, id))

  const ticket = ticketResult[0]
  if (!ticket) return <div className="p-8">Ticket not found</div>

  const messages = await db
    .select({
      id: ticketMessages.id,
      body: ticketMessages.body,
      created_at: ticketMessages.createdAt,
      user_id: ticketMessages.userId,
      user_name: user.name,
      user_role: user.role,
    })
    .from(ticketMessages)
    .leftJoin(user, eq(ticketMessages.userId, user.id))
    .where(eq(ticketMessages.ticketId, id))
    .orderBy(ticketMessages.createdAt)

  // Smart date formatter for message timestamps
  function formatSmartDate(input?: Date | string | null) {
    if (!input) return ''
    const d = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(d.getTime())) return ''

    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const msPerDay = 24 * 60 * 60 * 1000
    const diffDays = Math.round(
      (startOfToday.getTime() - startOfDate.getTime()) / msPerDay
    )

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
    }

    if (diffDays === 0) {
      // today -> show only time
      return d.toLocaleTimeString(undefined, timeOptions)
    }

    if (diffDays === 1) {
      // yesterday -> show label + time
      return `Yesterday, ${d.toLocaleTimeString(undefined, timeOptions)}`
    }

    if (diffDays > 1 && diffDays < 7) {
      // within last week -> show weekday name
      return d.toLocaleDateString(undefined, { weekday: 'long' })
    }

    // older -> show full date
    return d.toLocaleDateString()
  }

  // Refresh action
  async function refreshData() {
    'use server'
    revalidatePath('/payments')
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ticket</h1>
              <p className="text-muted-foreground">{ticket.id}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                type="submit"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              {/* Server-side check for assign permission */}
              {(await checkServerPermission({ tickets: ['assign'] })).success &&
                (() => {
                  const claimedBy = ticket.claimed_by as string | null
                  const currentUserId = session.user?.id

                  if (!claimedBy) {
                    if (ticket.status !== 'closed') {
                      return <ClaimDialog id={id} />
                    } else {
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-not-allowed opacity-50"
                            >
                              <TicketCheck className="mr-2 h-4 w-4" />
                              Claim
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Cannot claim a closed ticket</span>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }
                  }

                  if (claimedBy && claimedBy !== currentUserId) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-not-allowed opacity-50"
                          >
                            Claimed
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>
                            This ticket is already claimed by{' '}
                            <strong>{ticket.claimed_by_name}</strong>
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  if (ticket.status !== 'closed') {
                    return <UnclaimDialog id={id} />
                  } else {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-not-allowed opacity-50"
                          >
                            <TicketMinus className="mr-2 h-4 w-4" />
                            Unclaim
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Cannot unclaim a closed ticket</span>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                })()}

              {/* Close / Reopen */}
              {(await checkServerPermission({ tickets: ['close'] }))
                .success && (
                <div className="flex gap-2">
                  {ticket.status === 'closed' ? (
                    <ReopenDialog id={id} />
                  ) : (
                    <CloseDialog id={id} />
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Ticket details summary card */}

          <Card>
            <CardHeader>
              <CardTitle>Ticket details</CardTitle>
              <CardDescription className="truncate">
                {ticket.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-sm">Ticket ID</div>
                  <div className="font-medium break-all">{ticket.id}</div>
                </div>

                <div>
                  <div className="text-muted-foreground text-sm">Opened by</div>
                  <div className="font-medium">
                    {ticket.opened_by ?? 'Unknown'}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-sm">Status</div>
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {ticket.status
                        ? (ticket.status as string).replace('_', ' ')
                        : '-'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Created</div>
                  <div className="font-medium">
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleString()
                      : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {messages.map(m => (
              <Card key={m.id}>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="text-muted-foreground h-8 w-8 text-xs">
                        <AvatarFallback>
                          {(() => {
                            const parts = (m.user_name || '').split(' ')
                            const first = parts[0]?.charAt(0) || ''
                            const second = parts[1]?.charAt(0) || ''
                            return first + second
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-semibold">
                          {m.user_name ?? m.user_id}
                        </span>
                        {m.user_role === 'admin' && (
                          <Badge variant="default">Admin</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      <Tooltip>
                        <TooltipTrigger className="text-xs">
                          {formatSmartDate(m.created_at)}
                        </TooltipTrigger>
                        <TooltipContent>
                          {/* Full proper time: date, time and timezone (no time travel attempted) */}
                          <p>
                            {/*
                              Human-readable timestamp — succinct and timezone-aware enough.
                              (No time machines were harmed in the making of this string.)
                            */}
                            {m.created_at
                              ? new Date(m.created_at).toLocaleString()
                              : ''}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">{m.body}</div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent>
                {ticket.status !== 'closed' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Avatar className="text-muted-foreground h-8 w-8 text-xs">
                        <AvatarFallback>
                          {(() => {
                            const parts = (session.user?.name || '').split(' ')
                            const first = parts[0]?.charAt(0) || ''
                            const second = parts[1]?.charAt(0) || ''
                            return first + second
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-semibold">
                          {session.user?.name}
                        </span>
                        {session.user?.role === 'admin' && (
                          <Badge variant="default">Admin</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 whitespace-pre-wrap">
                      <MessageForm ticketId={id} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <Separator className="flex-1" />
                    <div className="text-muted-foreground flex-1 text-center text-sm">
                      This ticket has been closed.
                    </div>
                    <Separator className="flex-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
