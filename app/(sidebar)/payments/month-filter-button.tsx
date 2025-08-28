'use client'

import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MonthSelector } from '@/components/ui/month-selector'
import { Calendar, X } from 'lucide-react'
import { useState } from 'react'

interface MonthFilterButtonProps<TData> {
  table: Table<TData>
}

export function MonthFilterButton<TData>({
  table,
}: MonthFilterButtonProps<TData>) {
  const [open, setOpen] = useState(false)
  const column = table.getColumn('payment_date')
  const currentFilter = column?.getFilterValue() as { month?: Date } | undefined
  const selectedMonth = currentFilter?.month

  const handleMonthSelect = (selectedMonth: Date | undefined) => {
    if (!selectedMonth) {
      // Clear the filter
      column?.setFilterValue(undefined)
    } else {
      // Create a custom filter function for the selected month
      const filterFn = (row: { getValue: (columnId: string) => unknown }) => {
        const paymentDate = row.getValue('payment_date')
        if (!paymentDate) return false

        const date = new Date(paymentDate as string)
        return (
          date.getMonth() === selectedMonth.getMonth() &&
          date.getFullYear() === selectedMonth.getFullYear()
        )
      }

      // Set the filter with our custom function
      column?.setFilterValue({ month: selectedMonth, filterFn })
    }
    setOpen(false)
  }

  const clearFilter = () => {
    column?.setFilterValue(undefined)
    setOpen(false)
  }

  // Get count of filtered payments
  const getFilteredCount = () => {
    if (!selectedMonth) return table.getPreFilteredRowModel().rows.length

    return table.getPreFilteredRowModel().rows.filter(row => {
      const paymentDate = row.getValue('payment_date')
      if (!paymentDate) return false

      const date = new Date(paymentDate as string)
      return (
        date.getMonth() === selectedMonth.getMonth() &&
        date.getFullYear() === selectedMonth.getFullYear()
      )
    }).length
  }

  const hasActiveFilter = !!selectedMonth

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Calendar className="mr-2 h-4 w-4" />
          Month Filter
          {hasActiveFilter && (
            <div className="ml-2 flex items-center gap-1">
              <div className="bg-border h-4 w-px" />
              <Badge variant="secondary" className="h-5 px-1 text-xs">
                {selectedMonth.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Badge>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">Filter by Month</h4>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-6 px-2 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          <MonthSelector
            mode="single"
            selected={selectedMonth}
            onSelect={handleMonthSelect}
            startYear={2020}
            endYear={2030}
            className="w-auto"
            buttonVariant="outline"
            formatters={{
              formatMonth: date =>
                date.toLocaleDateString('en-US', { month: 'short' }),
            }}
          />

          {selectedMonth && (
            <div className="mt-3 border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedMonth.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {getFilteredCount()} payments
                </Badge>
              </div>
            </div>
          )}

          {!selectedMonth && (
            <div className="mt-3 border-t pt-3">
              <div className="text-muted-foreground text-sm">
                Select a month to filter payments
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
