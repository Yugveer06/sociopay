'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Clock, AlertTriangle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import { houseNumber } from '@/lib/zod/common'

export const MaintenanceDueSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  houseNumber: houseNumber,
  lastPaidPeriodEnd: z.string().nullable(),
  overdueDays: z.number(),
  overdueMonths: z.number(),
  formattedDuration: z.string(),
})

export type MaintenanceDueType = z.infer<typeof MaintenanceDueSchema>

export const dueColumns: ColumnDef<MaintenanceDueType>[] = [
  {
    accessorKey: 'userName',
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
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string
      return <div className="font-medium">{userName}</div>
    },
  },
  {
    accessorKey: 'houseNumber',
    header: 'House Number',
    cell: ({ row }) => {
      const houseNumber = row.getValue('houseNumber') as string
      return (
        <Badge variant="outline" className="font-mono">
          {houseNumber}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'lastPaidPeriodEnd',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Paid Period End
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lastPaidDate = row.getValue('lastPaidPeriodEnd') as string | null

      if (!lastPaidDate) {
        return <div className="text-muted-foreground">No payments</div>
      }

      const date = new Date(lastPaidDate)
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      return (
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <div>
            <div className="font-medium">{formattedDate}</div>
            <div className="text-muted-foreground text-xs">
              Last payment period
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'overdueDays',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Overdue Duration
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const overdueDays = row.getValue('overdueDays') as number
      const formattedDuration = row.original.formattedDuration

      // Color coding based on urgency
      let urgencyColor = 'text-yellow-600'
      let urgencyBg = 'bg-yellow-50'
      let urgencyBorder = 'border-yellow-200'

      if (overdueDays > 90) {
        urgencyColor = 'text-red-600'
        urgencyBg = 'bg-red-50'
        urgencyBorder = 'border-red-200'
      } else if (overdueDays > 30) {
        urgencyColor = 'text-orange-600'
        urgencyBg = 'bg-orange-50'
        urgencyBorder = 'border-orange-200'
      }

      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${urgencyColor}`} />
          <div>
            <Badge
              variant="outline"
              className={`${urgencyColor} ${urgencyBg} ${urgencyBorder} font-medium`}
            >
              {formattedDuration}
            </Badge>
            <div className="text-muted-foreground mt-1 text-xs">
              {overdueDays} days overdue
            </div>
          </div>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const daysA = rowA.getValue('overdueDays') as number
      const daysB = rowB.getValue('overdueDays') as number
      return daysA - daysB
    },
  },
]
