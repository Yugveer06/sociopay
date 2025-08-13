'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconCaretUpDown } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'

export const ExpenseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  created_at: z.string().nullable(),
  notes: z.string().nullable(),
  expense_date: z.string().nullable(),
  category_name: z.string(),
})

export type Expense = z.infer<typeof ExpenseSchema>

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'expense_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expense Date
          <IconCaretUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('expense_date') as string
      if (!date) return <div className="text-muted-foreground">-</div>

      const expenseDate = new Date(date)
      const now = new Date()
      const diffTime = now.getTime() - expenseDate.getTime()
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
            {expenseDate.toLocaleDateString('en-US', {
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
          <IconCaretUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount)
      return <div className="font-medium text-red-600">{formatted}</div>
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
]
