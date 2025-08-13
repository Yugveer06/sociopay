'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface MonthSelectorProps {
  value?: { month: number; year: number }
  onChange?: (value: { month: number; year: number }) => void
  startYear?: number
  endYear?: number
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MonthSelector({
  value,
  onChange,
  startYear = 1970,
  endYear = 2100,
  placeholder = 'Select month',
  className,
  disabled = false,
}: MonthSelectorProps) {
  const today = new Date()
  const [open, setOpen] = React.useState(false)
  const [year, setYear] = React.useState(value?.year || today.getFullYear())
  const selectedMonth = value?.month ?? today.getMonth()

  // Sync local year state with value prop
  React.useEffect(() => {
    if (value?.year !== undefined) {
      setYear(value.year)
    }
  }, [value?.year])

  function handleSelect(monthIndex: number) {
    onChange?.({ month: monthIndex, year })
    setOpen(false)
  }

  function handleYearChange(newYear: number) {
    setYear(newYear)
    // If we have a selected month, update it with the new year
    if (value) {
      onChange?.({ month: value.month, year: newYear })
    }
  }

  const displayText = value ? `${MONTHS[selectedMonth]} ${year}` : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[200px] justify-between text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <span>{displayText}</span>
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0" align="start" sideOffset={4}>
        <div className="p-3">
          {/* Year Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleYearChange(year - 1)}
              disabled={year <= startYear}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous year</span>
            </Button>

            <div className="text-sm font-semibold">{year}</div>

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleYearChange(year + 1)}
              disabled={year >= endYear}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next year</span>
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, idx) => {
              // Check if this month is selected
              const isSelected =
                value && idx === value.month && year === value.year
              const isCurrentMonth =
                idx === today.getMonth() && year === today.getFullYear()

              return (
                <Button
                  key={month}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'h-9 w-full text-xs font-normal',
                    isCurrentMonth &&
                      !isSelected &&
                      'bg-accent text-accent-foreground',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                  onClick={() => handleSelect(idx)}
                >
                  {month.slice(0, 3)}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
