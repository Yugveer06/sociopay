'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { MonthSelector } from './month-selector'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentDurationSelectorProps {
  value?: { from?: Date; to?: Date }
  onSelect: (range: { from?: Date; to?: Date } | undefined) => void
  intervalType?: 'monthly' | 'quarterly' | 'half_yearly' | 'annually'
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function PaymentDurationSelector({
  value,
  onSelect,
  intervalType = 'quarterly',
  disabled = false,
  placeholder = 'Select payment duration',
  className,
}: PaymentDurationSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Helper function to get last day of month
  const getLastDayOfMonth = React.useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0)
  }, [])

  // Generate range based on interval type
  const generateIntervalRange = React.useCallback(
    (clickedDate: Date) => {
      const from = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        1
      )
      let monthsToAdd = 0

      switch (intervalType) {
        case 'monthly':
          monthsToAdd = 1
          break
        case 'quarterly':
          monthsToAdd = 3
          break
        case 'half_yearly':
          monthsToAdd = 6
          break
        case 'annually':
          monthsToAdd = 12
          break
        default:
          monthsToAdd = 3
      }

      const to = getLastDayOfMonth(
        clickedDate.getFullYear(),
        clickedDate.getMonth() + monthsToAdd - 1
      )

      return { from, to }
    },
    [intervalType, getLastDayOfMonth]
  )

  // Update duration when interval type changes
  React.useEffect(() => {
    // Only update if we have a current value with a 'from' date
    if (value?.from) {
      const newRange = generateIntervalRange(value.from)
      // Only update if the 'to' date actually changed
      if (!value.to || value.to.getTime() !== newRange.to.getTime()) {
        onSelect(newRange)
      }
    }
  }, [intervalType, value?.from, generateIntervalRange, onSelect, value?.to])

  // Handle month selection with interval logic
  const handleMonthSelect = (range: { from?: Date; to?: Date } | undefined) => {
    // If only 'from' is selected, automatically calculate 'to' based on interval type
    if (range?.from && !range.to) {
      const intervalRange = generateIntervalRange(range.from)
      onSelect(intervalRange)
      return
    }

    // For manual range selection, use the range as-is
    onSelect(range)
  }

  // Format display text
  const getDisplayText = () => {
    if (!value?.from) return placeholder

    if (!value.to) {
      return format(value.from, 'MMM yyyy')
    }

    if (value.from.getTime() === value.to.getTime()) {
      return format(value.from, 'MMM yyyy')
    }

    return `${format(value.from, 'MMM yyyy')} - ${format(value.to, 'MMM yyyy')}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value?.from && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {getDisplayText()}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <MonthSelector
          mode="range"
          selected={value}
          onSelect={handleMonthSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
