'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import { RowActions } from './row-actions'

export const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  created_at: z.string().nullable(),
  interval_type: z
    .enum(['monthly', 'quarterly', 'half_yearly', 'annually'])
    .nullable(),
  notes: z.string().nullable(),
  payment_date: z.string().nullable(),
  period_end: z.string().nullable(),
  period_start: z.string().nullable(),
  user_id: z.string(),
  user_name: z.string(),
  house_number: z.string(),
  category_name: z.string(),
})

export type Payment = z.infer<typeof PaymentSchema>

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'payment_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payment Date
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('payment_date') as string
      if (!date) return <div className="text-muted-foreground">-</div>

      const paymentDate = new Date(date)
      const now = new Date()
      const diffTime = now.getTime() - paymentDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let timeAgo = ''
      if (diffDays === 0) timeAgo = 'Today'
      else if (diffDays === 1) timeAgo = 'Yesterday'
      else if (diffDays < 7) timeAgo = `${diffDays} days ago`
      else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} weeks ago`
      else timeAgo = `${Math.floor(diffDays / 30)} months ago`

      return (
        <div>
          <div className="font-medium">
            {paymentDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-muted-foreground text-xs">{timeAgo}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'user_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'house_number',
    header: 'House Number',
    cell: ({ row }) => {
      const houseNumber = row.getValue('house_number') as string
      return (
        <Badge variant="outline" className="font-mono">
          {houseNumber}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'category_name',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category_name') as string
      return <Badge variant="secondary">{category}</Badge>
    },
  },
  {
    accessorKey: 'interval_type',
    header: 'Interval',
    cell: ({ row }) => {
      const interval = row.getValue('interval_type') as string
      if (!interval) return <div className="text-muted-foreground">-</div>
      return (
        <Badge variant="outline" className="capitalize">
          {interval.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string
      if (!notes) return <div className="text-muted-foreground">-</div>
      return (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original
      return <RowActions payment={payment} />
    },
  },
]
