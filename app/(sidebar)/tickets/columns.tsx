'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'
import { RowActions } from './row-actions'

export const TicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  user_id: z.string(),
  user_name: z.string(),
})

export type Ticket = z.infer<typeof TicketSchema>

export function createColumns(): ColumnDef<Ticket>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          <Link
            href={`/tickets/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.getValue('title')}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        if (!status) return <div className="text-muted-foreground">-</div>
        return (
          <Badge variant="outline" className="capitalize">
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string
        if (!priority) return <div className="text-muted-foreground">-</div>

        const colorMap: Record<'low' | 'medium' | 'high' | 'urgent', string> = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800',
        }

        const color =
          colorMap[priority as keyof typeof colorMap] ||
          'bg-gray-100 text-gray-800'

        return (
          <Badge variant="outline" className={`capitalize ${color}`}>
            {priority}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'user_name',
      header: 'Created By',
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        if (!date) return <div className="text-muted-foreground">-</div>
        const d = new Date(date)
        // Use a deterministic ISO-based format (YYYY-MM-DD HH:mm:ss)
        const iso = d.toISOString().slice(0, 19).replace('T', ' ')
        return <div>{iso}</div>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <>
          <RowActions ticket={row.original} />
        </>
      ),
    },
  ]
}

export const columns: ColumnDef<Ticket>[] = createColumns()
