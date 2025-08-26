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
  payment_type: z.enum(['cash', 'cheque', 'upi']).nullable(),
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

// Function to create columns with context
export function createColumns(
  users: Array<{ id: string; name: string; houseNumber: string }>,
  categories: Array<{ id: number; name: string }>
): ColumnDef<Payment>[] {
  return [
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
        else if (diffDays < 30)
          timeAgo = `${Math.floor(diffDays / 7)} weeks ago`
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
      filterFn: (row, id, value) => {
        const houseNumber = row.getValue(id) as string
        if (!value || typeof value !== 'string') {
          return true // Show all rows when no filter is applied
        }
        return houseNumber.toLowerCase().includes(value.toLowerCase())
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
      accessorKey: 'payment_type',
      header: 'Payment Type',
      cell: ({ row }) => {
        const paymentType = row.getValue('payment_type') as string
        if (!paymentType) return <div className="text-muted-foreground">-</div>

        // Different colors for different payment types - because who doesn't love a good color scheme? 🎨
        const getTypeColor = (type: string) => {
          switch (type) {
            case 'cash':
              return 'bg-green-100 text-green-800 hover:bg-green-200'
            case 'cheque':
              return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            case 'upi':
              return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            default:
              return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        }

        return (
          <Badge
            variant="outline"
            className={`capitalize ${getTypeColor(paymentType)}`}
          >
            {paymentType.toUpperCase()}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
        return (
          <RowActions payment={payment} users={users} categories={categories} />
        )
      },
    },
  ]
}

// Export the default columns for backward compatibility
export const columns: ColumnDef<Payment>[] = createColumns([], [])
